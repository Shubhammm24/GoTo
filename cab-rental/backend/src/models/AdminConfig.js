const mongoose = require("mongoose");

const adminConfigSchema = new mongoose.Schema(
  {
    baseFare: Number,
    perKmRate: Number,
    perMinRate: Number,

    bikeRates: {
      baseFare: Number,
      perKmRate: Number,
      perMinRate: Number
    },

    platformCommissionPercent: Number,

    surgeRules: {
      peakHours: [String],
      maxSurge: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminConfig", adminConfigSchema);
