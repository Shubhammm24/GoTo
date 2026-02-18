const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    licenseNumber: String,
    licenseExpiry: Date,
    licenseDoc: String,

    backgroundCheck: { type: Boolean, default: false },
    backgroundCheckDate: Date,

    bankDetails: {
      accountNumber: String,
      ifsc: String,
      accountName: String
    },

    currentLocation: {
      type: { type: String, enum: ["Point"] },
      coordinates: {
        type: [Number],
        index: "2dsphere"
      }
    },

    isOnDuty: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    rejectionReason: String,

    vehicleDetails: {
      brand: String,
      model: String,
      licensePlate: String,
      vehicleType: { type: String, enum: ['car', 'bike', 'scooter'] },
      color: String,
      year: Number,
    },

    completedRides: { type: Number, default: 0 },

    rating: { type: Number, default: 0 },

    earnings: {
      totalEarnings: { type: Number, default: 0 },
      pendingAmount: { type: Number, default: 0 },
      availableBalance: { type: Number, default: 0 },
      withdrawnAmount: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// Add schema-level geospatial index for location-based queries
driverSchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model("Driver", driverSchema);
