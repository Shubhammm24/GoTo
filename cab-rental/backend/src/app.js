const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const rateLimiter = require("./middleware/rateLimiter");
const security = require("./middleware/security");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ─── Core Middleware ─────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(security);
app.use(compression());

// Express 5 makes req.query a getter-only property.
// express-mongo-sanitize needs to write to it — redefine as writable.
app.use((req, _res, next) => {
  const q = req.query;
  Object.defineProperty(req, 'query', {
    value: q,
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(rateLimiter);

// ─── Request Logging ─────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// ─── Health Check ────────────────────────────────────────────
app.get("/health", async (req, res) => {
  const mongoose = require("mongoose");
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus
    }
  });
});

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Cab Rental Backend Running 🚕",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// ─── API v1 Routes ───────────────────────────────────────────
const v1Router = express.Router();
v1Router.use("/auth", require("./routes/auth"));
v1Router.use("/users", require("./routes/users"));
v1Router.use("/vehicles", require("./routes/vehicles"));
v1Router.use("/drivers", require("./routes/drivers"));
v1Router.use("/bookings", require("./routes/bookings"));
v1Router.use("/payments", require("./routes/payments"));
v1Router.use("/reviews", require("./routes/reviews"));
v1Router.use("/tracking", require("./routes/tracking"));
v1Router.use("/admin", require("./routes/admin"));
v1Router.use("/parcels", require("./routes/parcels"));
v1Router.use("/chat", require("./routes/chat"));
v1Router.use("/emergency", require("./routes/emergency"));

// Mount v1 routes
app.use("/api/v1", v1Router);

// Backward compatibility: /api/* → /api/v1/*
app.use("/api", v1Router);

// ─── Error Handler (must be LAST) ───────────────────────────
app.use(errorHandler);

module.exports = app;
