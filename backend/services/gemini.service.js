
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// Fetch real weather from Open-Meteo
const fetchRealWeather = async (lat, lon) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=3`;
    const response = await axios.get(url);

    const interpretCode = (code) => {
      if (code <= 3)  return "Sunny/Clear";
      if (code <= 67) return "Rainy/Drizzle";
      if (code <= 77) return "Snowy";
      return "Thunderstorm";
    };

    return response.data.daily.time.map((date, i) => ({
      date:      new Date(date),
      tempMax:   response.data.daily.temperature_2m_max[i],
      tempMin:   response.data.daily.temperature_2m_min[i],
      condition: interpretCode(response.data.daily.weathercode[i]),
    }));
  } catch (error) {
    console.error("🌤 Weather Service Error:", error.message);
    return [];
  }
};

export const generateItinerary = async (data) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing from .env");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
You are an expert travel planner for SafarSathi. Generate a high-detail trip itinerary for ${data.destination}.
Duration: ${data.duration} nights. Budget: $${data.budget} USD. Travelers: ${data.travelers || 1}.

CRITICAL DATABASE MAPPING RULES:
1. For all costs provide values in BOTH USD and INR.
2. Use the rate: 1 USD = 83 INR.
3. Ensure NO empty arrays. Every day must have 3 attractions.
4. Provide 3 real hotels for "hotelOptions".
5. Include accurate "lat" and "lon" coordinates for ${data.destination}.

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

    const result    = await model.generateContent(prompt);
    const response  = await result.response;
    const cleanedJson = response.text()
      .replace(/```json/gi, "")
      .replace(/```/gi, "")
      .replace(/^[^{]*/, "")
      .replace(/[^}]*$/, "")
      .trim();

    const itinerary = JSON.parse(cleanedJson);

    // Fetch real weather using AI-provided coordinates
    if (itinerary.lat && itinerary.lon) {
      itinerary.weather = await fetchRealWeather(itinerary.lat, itinerary.lon);
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




