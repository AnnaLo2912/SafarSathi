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
    full_name: {
      type: String,
      default: "",
      trim: true,
    },
    is_verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    is_deactivated: {
      type: Boolean,
      default: false,
      index: true,
    },
    verification_status: {
      type: String,
      enum: ["not_submitted", "processing", "verified", "rejected"],
      default: "not_submitted",
      index: true,
    },
    availability: {
      type: Boolean,
      default: false,
      index: true,
    },
    ocr_last_result: {
      type: Object,
      default: null,
    },
    verified_at: {
      type: Date,
      default: null,
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

guideSchema.pre("save", function enforceAvailabilityGate(next) {
  if (this.availability && !this.is_verified) {
    return next(new Error("Availability can only be enabled for verified guides"));
  }
  return next();
});

const Guide = mongoose.model("Guide", guideSchema);
export default Guide;
