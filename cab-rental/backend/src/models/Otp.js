const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  code: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["email", "phone"],
    required: true
  },
  purpose: {
    type: String,
    enum: ["registration", "forgot-password"],
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Fast lookups
otpSchema.index({ userId: 1, type: 1, purpose: 1 });

module.exports = mongoose.model("Otp", otpSchema);
