import mongoose from "mongoose";

const paymentRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    paymentGateway: {
      type: String,
      enum: ["razorpay", "stripe"],
      required: true,
    },
    orderId: {
      type: String,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be positive"],
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["USD", "INR"],
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index for fast lookups
paymentRecordSchema.index({ userId: 1, createdAt: -1 });
paymentRecordSchema.index({ paymentGateway: 1, orderId: 1 });

const PaymentRecord = mongoose.model("PaymentRecord", paymentRecordSchema);
export default PaymentRecord;
