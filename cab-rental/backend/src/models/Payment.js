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

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
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

module.exports = mongoose.model("Payment", paymentSchema);
