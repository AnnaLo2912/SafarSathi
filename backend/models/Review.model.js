import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true,
    },
    tourist_id: {
      type: String,
      required: true,
      index: true,
    },
    guide_id: {
      type: String,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review_text: {
      type: String,
      default: "",
      trim: true,
      maxlength: 600,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

reviewSchema.index({ guide_id: 1, created_at: -1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
