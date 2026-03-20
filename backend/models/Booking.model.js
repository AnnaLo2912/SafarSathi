import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    tourist_id: {
      type: String,
      required: true,
      index: true,
    },
    touristName: {
      type: String,
      required: true,
      trim: true,
    },
    guide_id: {
      type: String,
      required: true,
      index: true,
    },
    guideName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "completed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ guide_id: 1, status: 1, date: 1 });
bookingSchema.index({ tourist_id: 1, status: 1, date: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
