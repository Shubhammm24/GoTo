// Vehicle model
const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vehicleType: { type: String, enum: ["car", "bike", "scooter"] },
  licensePlate: String,
  brand: String,
  model: String,
  year: Number,
  seatCapacity: Number,
  registrationDoc: String,
  insuranceDoc: String,
  images: [String],
  rentalType: { type: String, enum: ["self-drive", "driver-operated", "both"] },
  pricePerHour: Number,
  pricePerDay: Number,
  isAvailable: { type: Boolean, default: true },
  location: {
    type: { type: String, enum: ["Point"] },
    coordinates: { type: [Number] }
  },
  rating: { type: Number, default: 0 },
  totalRides: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Add geospatial index for location-based queries
vehicleSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Vehicle", vehicleSchema);
