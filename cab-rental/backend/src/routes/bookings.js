// Booking routes
const router = require("express").Router();
const auth = require("../middleware/auth");
const bookingController = require("../controllers/bookingController");

// Create booking
router.post(
  "/",
  auth(["customer"]),
  bookingController.createBooking
);

// Assign driver (admin / system)
router.post(
  "/:id/assign-driver",
  auth(["admin"]),
  bookingController.assignDriver
);

// Complete booking
router.post(
  "/:id/complete",
  auth(["driver"]),
  bookingController.completeBooking
);

module.exports = router;
