import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

/**
 * SafarSathi Backend Service - FINAL MERGED VERSION
 * Includes: Strict Mongoose Mapping + Real Weather (Open-Meteo)
 */

// Helper: Fetch real weather from Open-Meteo based on AI-provided coordinates
const fetchRealWeather = async (lat, lon) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=3`;
    const response = await axios.get(url);
    
    const interpretCode = (code) => {
      if (code <= 3) return "Sunny/Clear";
      if (code <= 67) return "Rainy/Drizzle";
      if (code <= 77) return "Snowy";
      return "Thunderstorm";
    };

    return response.data.daily.time.map((date, i) => ({
      date: new Date(date),
      tempMax: response.data.daily.temperature_2m_max[i],
      tempMin: response.data.daily.temperature_2m_min[i],
      condition: interpretCode(response.data.daily.weathercode[i])
    }));
  } catch (error) {
    console.error("🌤 Weather Service Error:", error.message);
    return []; // Return empty so it doesn't crash the trip creation
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
    1. For all costs (entry fees, meals, transport), provide values in BOTH USD (e.g., entryFee) and INR (e.g., entryFeeINR).
    2. Use the rate: 1 USD = 83 INR.
    3. Ensure NO empty arrays. Every day must have 3 attractions.
    4. Provide 3 real hotels for "hotelOptions".
    5. Include accurate "lat" and "lon" coordinates for ${data.destination}.

    Return ONLY a valid JSON object matching this EXACT Mongoose schema structure:
    {
      "lat": 0.0,
      "lon": 0.0,
      "summary": "Detailed overview",
      "highlights": ["h1", "h2", "h3"],
      "dayPlans": [{
        "day": 1,
        "title": "Day Theme",
        "attractions": [{
          "name": "Place Name",
          "description": "Details",
          "timing": "10:00 AM",
          "entryFee": 1.20,
          "entryFeeINR": 100,
          "category": "Heritage",
          "tips": "Wear walking shoes"
        }],
        "meals": {
          "breakfast": { "name": "Spot", "cost": 3, "costINR": 250 },
          "lunch": { "name": "Spot", "cost": 6, "costINR": 500 },
          "dinner": { "name": "Spot", "cost": 10, "costINR": 830 }
        },
        "transport": { "mode": "Rickshaw", "costINR": 300 },
        "dayTotal": 2000
      }],
      "hotelOptions": [{
        "name": "Hotel Name",
        "stars": 3,
        "pricePerNight": 30,
        "priceINR": 2500,
        "amenities": ["WiFi", "AC"]
      }],
      "budgetBreakdown": {
        "accommodation": 0, "food": 0, "transport": 0, "attractions": 0, "miscellaneous": 0, "total": 0
      },
      "packingList": ["item1", "item2"],
      "travelTips": ["tip1", "tip2"]
    }
  `;

  try {
    console.log(`🤖 SafarSathi: Syncing AI & Weather for ${data.destination}...`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanedJson = response.text()
      .replace(/```json/gi, "")
      .replace(/```/gi, "")
      .replace(/^[^{]*/, "") 
      .replace(/[^}]*$/, "") 
      .trim();

    const itinerary = JSON.parse(cleanedJson);

    // Fetch real weather using AI coordinates before returning
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
    const res = await model.generateContent(`Generate a JSON array of 15 strings for a packing list for ${data.destination}.`);
    return JSON.parse(res.response.text().replace(/```json|```/gi, "").trim());
  } catch (error) {
    return ["Clothes", "Toiletries", "Charger", "Sunscreen"];
  }
};