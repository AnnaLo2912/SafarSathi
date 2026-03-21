import mongoose from "mongoose";

const verificationAttemptSchema = new mongoose.Schema(
  {
    guide_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guide",
      required: true,
      index: true,
    },
    file_url: {
      type: String,
      required: true,
      trim: true,
    },
    extracted_name: {
      type: String,
      default: "",
      trim: true,
    },
    extracted_enrollment_no: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    match_result: {
      type: String,
      enum: ["matched", "not_matched", "low_confidence"],
      required: true,
      index: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false, collection: "verification_attempts" }
);

const VerificationAttempt = mongoose.model("VerificationAttempt", verificationAttemptSchema);
export default VerificationAttempt;
