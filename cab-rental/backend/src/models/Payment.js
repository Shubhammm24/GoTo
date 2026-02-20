const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    paymentMethod: String,
    transactionId: String,

    // Razorpay fields
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "cod_pending"],
      default: "pending"
    },

    breakdown: {
      baseFare: Number,
      distanceFare: Number,
      timeFare: Number,
      surgePricing: Number,
      discount: Number,
      tax: Number,
      totalAmount: Number
    }
  },
  { timestamps: true }
);

// Database indexes for query performance
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
