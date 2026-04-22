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
  firebaseUid: { type: String, default: null },
  userEmail:   { type: String, default: null },

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

  // Currency info
  currency:     { type: String, default: "USD" },
  exchangeRate: { type: Number, default: 83 },

  // Coordinates for weather
  lat: { type: Number, default: null },
  lon: { type: Number, default: null },

  // Custom vs AI generated
  isCustom: { type: Boolean, default: false },

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

  galleryImages: [{
    url:          String,
    thumbUrl:     String,
    altText:      String,
    photographer: String,
  }],

  weather: [{
    date:      { type: mongoose.Schema.Types.Mixed },
    tempMax:   Number,
    tempMin:   Number,
    condition: String,
    type:      { type: String, default: 'forecast' },
  }],

  status: {
    type:    String,
    enum:    ["draft", "saved"],
    default: "draft",
  },
}, { timestamps: true });

tripSchema.index({ firebaseUid: 1, createdAt: -1 });

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;