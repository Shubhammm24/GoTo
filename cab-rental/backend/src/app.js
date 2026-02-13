const express = require("express");
const cors = require("cors");
const rateLimiter = require("./middleware/rateLimiter");
const security = require("./middleware/security");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(security);
app.use(rateLimiter);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Cab Rental Backend Running 🚕",
    timestamp: new Date().toISOString()
  });
});

// API Health check
app.get("/api", (req, res) => {
  res.json({
    status: "success",
    message: "API is working",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

app.get("/test", (req, res) => {
  res.status(200).json({ message: "TEST ROUTE WORKING" });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/drivers", require("./routes/drivers"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/tracking", require("./routes/tracking"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/parcels", require("./routes/parcels"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/emergency", require("./routes/emergency"));


// Error handler LAST
app.use(errorHandler);

module.exports = app;
