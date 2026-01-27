const connectDB = require("./db");
const seedAdminConfig = require("./seedAdminConfig");

module.exports = async () => {
  await connectDB();
  await seedAdminConfig();
};
