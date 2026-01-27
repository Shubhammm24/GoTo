const axios = require("axios");

exports.getDistanceAndDuration = async (pickup, drop) => {
  try {
    const url = "https://maps.googleapis.com/maps/api/distancematrix/json";

    const res = await axios.get(url, {
      params: {
        origins: `${pickup.coordinates[1]},${pickup.coordinates[0]}`,
        destinations: `${drop.coordinates[1]},${drop.coordinates[0]}`,
        departure_time: "now",
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (!res.data.rows?.[0]?.elements?.[0]) {
      throw new Error("Invalid response from Google Maps API");
    }

    const element = res.data.rows[0].elements[0];

    if (element.status === "ZERO_RESULTS") {
      throw new Error("No route found between pickup and drop");
    }

    return {
      distanceKm: element.distance.value / 1000,
      durationMin: element.duration_in_traffic?.value / 60 || element.duration?.value / 60
    };
  } catch (error) {
    console.error("❌ Map service error:", error.message);
    throw error;
  }
};
