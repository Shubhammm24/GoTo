const AdminConfig = require("../models/AdminConfig");

module.exports = async () => {
  const exists = await AdminConfig.findOne();
  if (exists) return;

  await AdminConfig.create({
    baseFare: 50,
    perKmRate: 12,
    perMinRate: 2,
    bikeRates: {
      baseFare: 30,
      perKmRate: 7,
      perMinRate: 1
    },
    platformCommissionPercent: 20,
    surgeRules: {
      peakHours: ["08-10", "18-21"],
      maxSurge: 2
    }
  });

  console.log("✅ AdminConfig seeded");
};
