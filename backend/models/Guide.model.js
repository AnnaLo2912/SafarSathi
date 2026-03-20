import mongoose from "mongoose";

const guideSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    availability: {
      type: Boolean,
      default: false,
      index: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    price: {
      type: Number,
      default: 1500,
      min: 0,
    },
  },
  { timestamps: true }
);

guideSchema.index({ availability: 1, location: 1 });

const Guide = mongoose.model("Guide", guideSchema);
export default Guide;
