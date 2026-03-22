// User model
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"]
  },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  profileImage: String,
  address: String,
  dateOfBirth: Date,
  role: {
    type: String,
    enum: ["customer", "driver", "vehicle_owner", "admin"],
    default: "customer"
  },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  identityProof: {
    docType: String,
    docNumber: String,
    expiryDate: Date
  },

  // Safety and Emergency Settings
  safetySettings: {
    enableEmergencySharing: { type: Boolean, default: false },
    shareLocationAfterRide: { type: Boolean, default: false },
    sosEnabled: { type: Boolean, default: true },
    emergencyContacts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyContact"
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
