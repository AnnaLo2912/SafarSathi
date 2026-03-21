import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const interpretCode = (code) => {
  if (code <= 3)  return "Sunny/Clear";
  if (code <= 67) return "Rainy/Drizzle";
  if (code <= 77) return "Snowy";
  return "Thunderstorm";
};

// ── CASE 1: Real forecast (within 16 days) ────────────────────
const fetchForecastWeather = async (lat, lon, startDate, duration) => {
  try {
    const fmt       = (d) => d.toISOString().split('T')[0]
    const today     = new Date(); today.setHours(0,0,0,0);
    const tripStart = new Date(startDate); tripStart.setHours(0,0,0,0);
    const daysUntil = Math.ceil((tripStart - today) / (1000 * 60 * 60 * 24));
    const daysNeeded = daysUntil + duration + 1;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=${Math.min(daysNeeded, 16)}`;
    const response = await axios.get(url);
    const daily = response.data.daily;

    // Slice only the travel days
    return daily.time
      .map((dateStr, i) => ({
        date:      dateStr, // keep as string "YYYY-MM-DD" — avoid UTC shift
        tempMax:   daily.temperature_2m_max[i],
        tempMin:   daily.temperature_2m_min[i],
        condition: interpretCode(daily.weathercode[i]),
        type:      'forecast',
      }))
      .filter((d) => d.date >= fmt(tripStart))
      .slice(0, duration + 1);
  } catch (err) {
    console.error("🌤 Forecast fetch error:", err.message);
    return [];
  }
};

// ── CASE 2: Historical climate averages (trip too far ahead) ──
// Uses Open-Meteo's climate API — 30-year monthly averages
const fetchClimateAverages = async (lat, lon, startDate, duration) => {
  try {
    // Use same month/day from last year as a proxy for climate normals
    const start = new Date(startDate);
    const end   = new Date(startDate);
    end.setDate(end.getDate() + duration);

    // Shift dates back 1 year for historical data
    const histStart = new Date(start); histStart.setFullYear(histStart.getFullYear() - 1);
    const histEnd   = new Date(end);   histEnd.setFullYear(histEnd.getFullYear() - 1);

    const fmt = (d) => d.toISOString().split('T')[0];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&start_date=${fmt(histStart)}&end_date=${fmt(histEnd)}`;

    const response = await axios.get(url);
    const daily    = response.data.daily;

    return daily.time.map((_, i) => {
      // Remap dates to actual travel dates as YYYY-MM-DD strings
      const actualDate = new Date(start);
      actualDate.setDate(actualDate.getDate() + i);
      const fmt = (d) => d.toISOString().split('T')[0]
      return {
        date:      fmt(actualDate),
        tempMax:   daily.temperature_2m_max[i],
        tempMin:   daily.temperature_2m_min[i],
        condition: interpretCode(daily.weathercode[i]),
        type:      'historical',
      };
    });
  } catch (err) {
    console.error("🌤 Climate average fetch error:", err.message);
    return [];
  }
};

// ── Smart weather dispatcher ──────────────────────────────────
const fetchSmartWeather = async (lat, lon, startDate, duration) => {
  if (!lat || !lon) return [];

  // No date provided → show today's 3-day forecast as before
  if (!startDate) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=3`;
      const res  = await axios.get(url);
      return res.data.daily.time.map((dateStr, i) => ({
        date:      dateStr, // keep as "YYYY-MM-DD" string
        tempMax:   res.data.daily.temperature_2m_max[i],
        tempMin:   res.data.daily.temperature_2m_min[i],
        condition: interpretCode(res.data.daily.weathercode[i]),
        type:      'forecast',
      }));
    } catch { return []; }
  }

  const today     = new Date(); today.setHours(0,0,0,0);
  const tripStart = new Date(startDate); tripStart.setHours(0,0,0,0);
  const daysUntil = Math.ceil((tripStart - today) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 14) {
    // Within 2 weeks → real forecast
    console.log(`🌤 Fetching live forecast (trip in ${daysUntil} days)`);
    return await fetchForecastWeather(lat, lon, startDate, duration);
  } else {
    // Too far ahead → historical same-period last year
    console.log(`🌤 Trip is ${daysUntil} days away — using historical climate data`);
    return await fetchClimateAverages(lat, lon, startDate, duration);
  }
};

export const generateItinerary = async (data) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing from .env");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
  const dateContext = data.startDate
    ? (() => {
        const start = new Date(data.startDate);
        const end   = new Date(data.startDate);
        end.setDate(end.getDate() + data.duration);
        const fmt = (d) => d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const days = Array.from({ length: data.duration + 1 }, (_, i) => {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          return `Day ${i + 1}: ${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`;
        }).join(', ');
        return `Travel dates: ${fmt(start)} to ${fmt(end)}. Day breakdown: ${days}.`;
      })()
    : `No specific dates provided — use generic day references.`;

  const prompt = `
You are an expert travel planner for SafarSathi. Generate a high-detail trip itinerary for ${data.destination}.
Duration: ${data.duration} nights. Budget: $${data.budget} USD. Travelers: ${data.travelers || 1}. Style: ${data.tripStyle || 'budget'}.
${dateContext}

CRITICAL DATABASE MAPPING RULES:
1. For all costs provide values in BOTH USD and INR. Rate: 1 USD = 83 INR.
2. Ensure NO empty arrays. Every day must have 3 attractions.
3. Provide 3 real hotels for "hotelOptions".
4. Include accurate "lat" and "lon" coordinates for ${data.destination}.
5. If travel dates are provided, factor in the season/weather for that time of year.

Return ONLY a valid JSON object — no markdown, no explanation, no backticks:
{
  "lat": 0.0,
  "lon": 0.0,
  "summary": "Detailed overview",
  "highlights": ["h1", "h2", "h3", "h4", "h5"],
  "dayPlans": [{
    "day": 1,
    "title": "Day Theme",
    "attractions": [{
      "name": "Place Name",
      "description": "Details",
      "timing": "10:00 AM - 12:00 PM",
      "entryFee": 1.20,
      "entryFeeINR": 100,
      "category": "Heritage",
      "tips": "Practical tip"
    }],
    "meals": {
      "breakfast": { "name": "Spot", "cost": 3, "costINR": 250 },
      "lunch":     { "name": "Spot", "cost": 6, "costINR": 500 },
      "dinner":    { "name": "Spot", "cost": 10, "costINR": 830 }
    },
    "transport": { "mode": "Rickshaw", "costINR": 300 },
    "dayTotal": 20
  }],
  "hotelOptions": [{
    "name": "Hotel Name",
    "stars": 3,
    "pricePerNight": 30,
    "priceINR": 2490,
    "rating": 4.2,
    "amenities": ["WiFi", "AC", "Breakfast"]
  }],
  "budgetBreakdown": {
    "accommodation": 90,
    "food": 30,
    "transport": 15,
    "attractions": 10,
    "miscellaneous": 5,
    "total": 150
  },
  "packingList": ["item1", "item2", "item3"],
  "travelTips": ["tip1", "tip2", "tip3"]
}

Use real attraction names for ${data.destination}. Keep prices realistic.
`;

  try {
    console.log(`🤖 SafarSathi: Generating itinerary for ${data.destination}...`);

    const result       = await model.generateContent(prompt);
    const response     = await result.response;
    const cleanedJson  = response.text()
      .replace(/```json/gi, "")
      .replace(/```/gi, "")
      .replace(/^[^{]*/, "")
      .replace(/[^}]*$/, "")
      .trim();

    const itinerary = JSON.parse(cleanedJson);

    // Fetch weather — live forecast if within 14 days, historical averages if further ahead
    if (itinerary.lat && itinerary.lon) {
      itinerary.weather = await fetchSmartWeather(itinerary.lat, itinerary.lon, data.startDate, data.duration);
    }

    return itinerary;

  } catch (error) {
    console.error("❌ Itinerary AI Error:", error.message);
    throw error;
  }
};

export const generatePackingList = async (data) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return ["Passport", "Charger", "Clothes"];

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const res   = await model.generateContent(
      `Generate a JSON array of 15 strings for a packing list for ${data.destination}. Return ONLY the JSON array.`
    );
    return JSON.parse(res.response.text().replace(/```json|```/gi, "").trim());
  } catch (error) {
    return ["Clothes", "Toiletries", "Charger", "Sunscreen", "Power bank"];
  }
};