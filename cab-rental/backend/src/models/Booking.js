const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle"
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver"
    },

    pickupLocation: {
      address: String,
      coordinates: {
        type: [Number] // [lng, lat]
      }
    },

    dropoffLocation: {
      address: String,
      coordinates: {
        type: [Number]
      }
    },

    pickupTime: Date,
    dropoffTime: Date,

    rentalType: {
      type: String,
      enum: ["self-drive", "driver-operated"]
    },

    vehicleType: {
      type: String,
      enum: ["car", "bike", "scooter"]
    },

    estimatedDistance: Number,
    estimatedDuration: Number,

    actualDistance: Number,
    actualDuration: Number,

    baseFare: Number,
    distanceFare: Number,
    timeFare: Number,
    surgePricing: Number,

    totalAmount: Number,

    status: {
      type: String,
      enum: [
        "requested",
        "confirmed",
        "driver_assigned",
        "pickup_pending",
        "in_progress",
        "completed",
        "cancelled"
      ],
      default: "requested"
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    },

    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "wallet", "upi"]
    },

    specialRequests: String,

    // Communication & Chat
    communication: {
      chatEnabled: { type: Boolean, default: true },
      maskedDriverNumber: String,  // Twilio virtual number
      maskedCustomerNumber: String,
      chatExpiry: Date  // Auto-delete chat after this time
    },

    // Safety & Emergency
    safetyStatus: {
      sosActivated: { type: Boolean, default: false },
      sosTimestamp: Date,
      emergencyContactsNotified: { type: Boolean, default: false },
      locationSharingActive: { type: Boolean, default: false }
    },

    actualStartTime: Date,
    actualEndTime: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
