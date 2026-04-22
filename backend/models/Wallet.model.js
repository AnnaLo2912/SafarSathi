import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    usdBalance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    inrBalance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "frozen"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
