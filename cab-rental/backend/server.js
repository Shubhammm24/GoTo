require("dotenv").config();

const http = require("http");
const mongoose = require("mongoose");
const app = require("./src/app");
const bootstrap = require("./src/config/bootstrap");
const initSockets = require("./src/sockets");

(async () => {
  await bootstrap();

  const server = http.createServer(app);
  const io = initSockets(server);

  // Store io on app for use in controllers (e.g., emergency SOS)
  app.set("io", io);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  // ─── Graceful Shutdown ───────────────────────────────────
  const gracefulShutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);

    server.close(() => {
      console.log("✅ HTTP server closed");
    });

    try {
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed");
    } catch (err) {
      console.error("❌ Error closing MongoDB connection:", err);
    }

    process.exit(0);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
})();
