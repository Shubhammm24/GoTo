const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const driverController = require("../controllers/driverController");

// Get all drivers (admin)
router.get("/", auth(["admin"]), driverController.getAllDrivers);

// Register driver profile
router.post("/register", auth(["customer"]), driverController.registerDriver);

// Complete driver registration with documents
router.put("/complete-registration", auth(["driver"]), driverController.completeRegistration);

// Get driver's own profile
router.get("/me", auth(["driver"]), driverController.getMyDriverProfile);

// Toggle driver availability (on/off duty)
router.patch("/toggle-availability", auth(["driver"]), driverController.toggleAvailability);

// Update current location
router.patch("/update-location", auth(["driver"]), driverController.updateLocation);

// Get assigned rides
router.get("/assigned-rides", auth(["driver"]), driverController.getAssignedRides);

// Get ride history
router.get("/ride-history", auth(["driver"]), driverController.getRideHistory);

// Get earnings
router.get("/earnings", auth(["driver"]), driverController.getEarnings);

// Accept ride
router.post("/rides/:rideId/accept", auth(["driver"]), driverController.acceptRide);

// Reject ride
router.post("/rides/:rideId/reject", auth(["driver"]), driverController.rejectRide);

// Start ride
router.post("/rides/:rideId/start", auth(["driver"]), driverController.startRide);

module.exports = router;
