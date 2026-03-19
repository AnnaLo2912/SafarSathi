import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateItinerary = async ({
  destination,
  duration,
  budget,
  travelers = 1,
  tripStyle = "budget",
  startDate,
}) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert travel planner for India. Generate a detailed trip itinerary.

Trip Details:
- Destination: ${destination}
- Duration: ${duration} nights (${duration + 1} days)
- Budget: $${budget} USD total for ${travelers} traveler(s)
- Style: ${tripStyle}
- Start Date: ${startDate || "flexible"}

Return ONLY a valid JSON object — no markdown, no explanation, no backticks. Use this exact structure:

{
  "summary": "2-3 sentence overview",
  "highlights": ["highlight1", "highlight2", "highlight3", "highlight4", "highlight5"],
  "dayPlans": [
    {
      "day": 1,
      "title": "Day theme",
      "attractions": [
        {
          "name": "Attraction name",
          "description": "Short description",
          "timing": "9:00 AM - 12:00 PM",
          "entryFee": 5,
          "entryFeeINR": 415,
          "category": "monument",
          "tips": "Practical tip"
        }
      ],
      "meals": {
        "breakfast": { "name": "Place name", "cost": 3, "costINR": 250 },
        "lunch":     { "name": "Place name", "cost": 5, "costINR": 415 },
        "dinner":    { "name": "Place name", "cost": 8, "costINR": 664 }
      },
      "transport": { "mode": "auto", "costINR": 150 },
      "dayTotal": 25
    }
  ],
  "hotelOptions": [
    {
      "name": "Budget Hotel",
      "stars": 2,
      "pricePerNight": 25,
      "priceINR": 2075,
      "rating": 4.1,
      "amenities": ["WiFi", "AC"]
    },
    {
      "name": "Mid-range Hotel",
      "stars": 3,
      "pricePerNight": 60,
      "priceINR": 4980,
      "rating": 4.4,
      "amenities": ["WiFi", "AC", "Breakfast"]
    },
    {
      "name": "Luxury Hotel",
      "stars": 5,
      "pricePerNight": 150,
      "priceINR": 12450,
      "rating": 4.8,
      "amenities": ["WiFi", "AC", "Pool", "Spa", "Restaurant"]
    }
  ],
  "budgetBreakdown": {
    "accommodation": 75,
    "food": 40,
    "transport": 15,
    "attractions": 15,
    "miscellaneous": 5,
    "total": 150
  },
  "packingList": [
    "Lightweight cotton clothes",
    "Comfortable walking shoes",
    "Sunscreen SPF 50",
    "Water bottle",
    "Power bank",
    "Light jacket for evenings",
    "Basic medicines",
    "Camera",
    "Cash in INR",
    "Travel insurance docs"
  ],
  "travelTips": [
    "tip1", "tip2", "tip3", "tip4", "tip5"
  ]
}

Use real attraction names for ${destination}. Keep prices realistic.
Exchange rate: 1 USD = 83 INR.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Strip any accidental markdown wrapping
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/gi, "")
    .trim();

  return JSON.parse(cleaned);
};

export const generatePackingList = async ({ destination, duration, season }) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Generate a practical packing list for ${destination} for ${duration} days during ${season || "general"} season.
Return ONLY a JSON array of strings. Example: ["Item 1", "Item 2"]
Include 15-20 specific, practical items.
`;

  const result = await model.generateContent(prompt);
  const text = result.response
    .text()
    .replace(/```json|```/gi, "")
    .trim();

  return JSON.parse(text);
};