// Booking routes
const router = require("express").Router();
const auth = require("../middleware/auth");
const bookingController = require("../controllers/bookingController");

// Get all bookings (admin only)
router.get(
  "/",
  auth(["admin"]),
  bookingController.getBookings
);

// Get user's own bookings
router.get(
  "/user/me",
  auth(["customer"]),
  bookingController.getUserBookings
);

// Get booking by ID
router.get(
  "/:id",
  auth(),
  bookingController.getBookingById
);

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

// Cancel booking
router.patch(
  "/:id/cancel",
  auth(["customer", "admin"]),
  bookingController.cancelBooking
);

module.exports = router;
