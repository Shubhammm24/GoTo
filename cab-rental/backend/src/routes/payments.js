// Payment routes
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const paymentController = require("../controllers/paymentController");

// Razorpay webhook (no auth, needs raw body for signature verification)
// IMPORTANT: This must be BEFORE any JSON body parser middleware
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

// Create Razorpay order
router.post(
  "/create-order",
  auth(["customer"]),
  paymentController.createPayment
);

// Verify Razorpay payment
router.post(
  "/verify",
  auth(["customer"]),
  paymentController.verifyPayment
);

// Cash on Delivery
router.post(
  "/cod",
  auth(["customer"]),
  paymentController.codPayment
);

// Get payment by booking ID
router.get(
  "/booking/:bookingId",
  auth(),
  paymentController.getPaymentByBooking
);

// Get user's payment history
router.get(
  "/user/me",
  auth(["customer"]),
  paymentController.getUserPayments
);

// Create payment (legacy endpoint)
router.post(
  "/",
  auth(["customer"]),
  paymentController.createPayment
);

// Update payment status (admin)
router.patch(
  "/:id/status",
  auth(["admin"]),
  paymentController.updatePaymentStatus
);

module.exports = router;
