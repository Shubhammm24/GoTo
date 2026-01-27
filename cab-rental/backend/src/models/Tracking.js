// Tracking model
const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    index: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle"
  },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" }
  },
  speed: Number,
  heading: Number,
  accuracy: Number,
  timestamp: Date
}, {
  timestamps: true
});

// 🔥 Auto-delete tracking data after 7 days
trackingSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 7 }
);

module.exports = mongoose.model("Tracking", trackingSchema);
