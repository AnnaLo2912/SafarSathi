import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    currency: {
      type: String,
      enum: ["USD", "INR"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be positive"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "wallet"],
      required: true,
    },
    externalTransactionId: {
      type: String,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for fast lookups
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, status: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
