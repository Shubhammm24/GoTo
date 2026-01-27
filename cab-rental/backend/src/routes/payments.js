// Payment routes
const router = require("express").Router();
const auth = require("../middleware/auth");
const paymentController = require("../controllers/paymentController");

// Create payment
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
