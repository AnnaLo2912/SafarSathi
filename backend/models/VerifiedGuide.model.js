import mongoose from "mongoose";

const verifiedGuideSchema = new mongoose.Schema(
  {
    enrollment_no: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    normalized_name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      index: true,
    },
    issued_year: {
      type: Number,
      required: true,
      min: 1990,
      max: 2100,
    },
    source: {
      type: String,
      default: "IITF",
      trim: true,
    },
  },
  { timestamps: true, collection: "verified_guides" }
);

verifiedGuideSchema.index({ normalized_name: 1 });

const VerifiedGuide = mongoose.model("VerifiedGuide", verifiedGuideSchema);
export default VerifiedGuide;
