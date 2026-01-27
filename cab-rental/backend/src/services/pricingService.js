const AdminConfig = require("../models/AdminConfig");

exports.calculateFare = async ({
  vehicleType,
  distanceKm,
  durationMin
}) => {
  try {
    const config = await AdminConfig.findOne();

    if (!config) {
      throw new Error("Admin config not found");
    }

    let baseFare = config.baseFare || 50;
    let perKm = config.perKmRate || 12;
    let perMin = config.perMinRate || 2;

    if (vehicleType === "bike") {
      baseFare = config.bikeRates?.baseFare || 30;
      perKm = config.bikeRates?.perKmRate || 7;
      perMin = config.bikeRates?.perMinRate || 1;
    }

    // Surge calculation
    let surge = 1.0;
    const hour = new Date().getHours();

    if (config.surgeRules?.peakHours) {
      config.surgeRules.peakHours.forEach(range => {
        const [start, end] = range.split("-").map(Number);
        if (hour >= start && hour <= end) {
          surge = config.surgeRules.maxSurge || 1.5;
        }
      });
    }

    const total = (baseFare + distanceKm * perKm + durationMin * perMin) * surge;
    
    return Math.round(total * 100) / 100; // Round to 2 decimals
  } catch (error) {
    console.error("❌ Pricing service error:", error);
    throw error;
  }
};
