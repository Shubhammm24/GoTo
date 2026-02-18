const router = require("express").Router();
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");

// ─── Dashboard ────────────────────────────────────────────────
router.get("/dashboard", auth(["admin"]), adminController.dashboard);

// ─── Driver Management ────────────────────────────────────────
router.get("/drivers", auth(["admin"]), adminController.getAllDrivers);
router.get("/drivers/pending", auth(["admin"]), adminController.getPendingDrivers);
router.post("/drivers/:id/approve", auth(["admin"]), adminController.approveDriver);
router.post("/drivers/:id/reject", auth(["admin"]), adminController.rejectDriver);

// ─── Vehicle Management ───────────────────────────────────────
router.get("/vehicles", auth(["admin"]), adminController.getAllVehicles);
router.get("/vehicles/pending", auth(["admin"]), adminController.getPendingVehicles);
router.post("/vehicles", auth(["admin"]), adminController.addVehicle);
router.put("/vehicles/:id", auth(["admin"]), adminController.updateVehicle);
router.delete("/vehicles/:id", auth(["admin"]), adminController.deleteVehicle);
router.post("/vehicles/:id/approve", auth(["admin"]), adminController.approveVehicle);
router.post("/vehicles/:id/reject", auth(["admin"]), adminController.rejectVehicle);

// ─── User Management ──────────────────────────────────────────
router.get("/users", auth(["admin"]), adminController.getAllUsers);

// ─── Bookings ─────────────────────────────────────────────────
router.get("/bookings", auth(["admin"]), adminController.getAllBookings);

// ─── Live Tracking ────────────────────────────────────────────
router.get("/live-locations", auth(["admin"]), adminController.getLiveLocations);

// ─── SOS / Safety ─────────────────────────────────────────────
router.get("/sos-alerts", auth(["admin"]), adminController.getSosAlerts);
router.post("/sos-alerts/:id/resolve", auth(["admin"]), adminController.resolveSos);

module.exports = router;
