const axios = require("axios");

exports.getDistanceAndDuration = async (pickup, drop) => {
  const url =
    "https://maps.googleapis.com/maps/api/distancematrix/json";

  const res = await axios.get(url, {
    params: {
      origins: `${pickup.coordinates[1]},${pickup.coordinates[0]}`,
      destinations: `${drop.coordinates[1]},${drop.coordinates[0]}`,
      departure_time: "now",
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  });

  const element = res.data.rows[0].elements[0];

  return {
    distanceKm: element.distance.value / 1000,
    durationMin:
      element.duration_in_traffic.value / 60
  };
};
