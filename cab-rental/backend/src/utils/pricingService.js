const AdminConfig = require("../models/AdminConfig");
const { roundAmount } = require("./helpers");

exports.calculateFare = async ({
  vehicleType,
  distanceKm,
  durationMin
}) => {
  const config = await AdminConfig.findOne();

  let baseFare = config.baseFare;
  let perKm = config.perKmRate;
  let perMin = config.perMinRate;

  if (vehicleType === "bike") {
    baseFare = config.bikeRates.baseFare;
    perKm = config.bikeRates.perKmRate;
    perMin = config.bikeRates.perMinRate;
  }

  // Surge calculation
  let surge = 1.0;
  const hour = new Date().getHours();

  config.surgeRules.peakHours.forEach(range => {
    const [start, end] = range.split("-").map(Number);
    if (hour >= start && hour <= end)
      surge = config.surgeRules.maxSurge;
  });

  const total =
    (baseFare +
      distanceKm * perKm +
      durationMin * perMin) * surge;

  return roundAmount(total);
};
