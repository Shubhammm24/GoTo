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
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number],
        index: "2dsphere"
      }
    },

    isOnDuty: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },

    completedRides: { type: Number, default: 0 },

    rating: { type: Number, default: 0 },

    earnings: {
      totalEarnings: { type: Number, default: 0 },
      pendingAmount: { type: Number, default: 0 },
      withdrawnAmount: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
