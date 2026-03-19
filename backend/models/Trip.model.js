import mongoose from "mongoose";

const attractionSchema = new mongoose.Schema({
  name:        String,
  description: String,
  timing:      String,
  entryFee:    { type: Number, default: 0 },
  entryFeeINR: { type: Number, default: 0 },
  category:    String,
  tips:        String,
}, { _id: false });

const dayPlanSchema = new mongoose.Schema({
  day:   { type: Number, required: true },
  title: String,
  attractions: [attractionSchema],
  meals: {
    breakfast: { name: String, cost: Number, costINR: Number },
    lunch:     { name: String, cost: Number, costINR: Number },
    dinner:    { name: String, cost: Number, costINR: Number },
  },
  transport: {
    mode:    String,
    costINR: { type: Number, default: 0 },
  },
  dayTotal: { type: Number, default: 0 },
}, { _id: false });

const hotelOptionSchema = new mongoose.Schema({
  name:          String,
  stars:         Number,
  pricePerNight: Number,
  priceINR:      Number,
  rating:        Number,
  amenities:     [String],
}, { _id: false });

const tripSchema = new mongoose.Schema({
  // Firebase user info
  firebaseUid: { type: String, default: null },
  userEmail:   { type: String, default: null },

  // Core trip info
  destination: { type: String, required: true },
  duration:    { type: Number, required: true },
  budget:      { type: Number, required: true },
  travelers:   { type: Number, default: 1 },
  tripStyle: {
    type:    String,
    enum:    ["budget", "comfort", "luxury"],
    default: "budget",
  },
  startDate: { type: Date },

  // AI generated content
  summary:    String,
  highlights: [String],
  dayPlans:   [dayPlanSchema],
  hotelOptions: [hotelOptionSchema],
  budgetBreakdown: {
    accommodation: Number,
    food:          Number,
    transport:     Number,
    attractions:   Number,
    miscellaneous: Number,
    total:         Number,
  },
  packingList: [String],
  travelTips:  [String],

  // Images
  galleryImages: [{
    url:          String,
    thumbUrl:     String,
    altText:      String,
    photographer: String,
  }],

  // Weather from Open-Meteo
  weather: [{
    date:      Date,
    tempMax:   Number,
    tempMin:   Number,
    condition: String,
  }],

  status: {
    type:    String,
    enum:    ["draft", "saved"],
    default: "draft",
  },
}, { timestamps: true });

// Fast lookup by user
tripSchema.index({ firebaseUid: 1, createdAt: -1 });

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;





