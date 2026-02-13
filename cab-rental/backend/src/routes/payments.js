// Payment routes
const router = require("express").Router();
const auth = require("../middleware/auth");
const paymentController = require("../controllers/paymentController");

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

// Razorpay webhook (no auth)
router.post(
  "/webhook",
  paymentController.handleWebhook
);

// Create payment (old endpoint - kept for compatibility)
router.post(
  "/",
  auth(["customer"]),
  paymentController.createPayment
);

// Update payment status (webhook/admin)
router.patch(
  "/:id/status",
  auth(["admin"]),
  paymentController.updatePaymentStatus
);

module.exports = router;
