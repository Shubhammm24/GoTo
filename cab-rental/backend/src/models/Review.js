const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking"
    },

    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle"
    },

    rating: { type: Number, min: 1, max: 5 },
    comment: String,

    categories: {
      cleanliness: Number,
      communication: Number,
      drivingSkills: Number,
      condition: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
