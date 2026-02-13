// Payment controller with Razorpay integration
const Payment = require("../models/Payment");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create Razorpay order
 * @route POST /api/payments/create-order
 */
exports.createPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, currency = "INR" } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ message: "Missing required payment fields" });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId,
        userId: req.user.id
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create payment record in database
    const payment = await Payment.create({
      bookingId,
      userId: req.user.id,
      amount,
      currency,
      razorpayOrderId: razorpayOrder.id,
      status: "pending"
    });

    res.status(201).json({
      message: "Payment order created successfully",
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      payment
    });
  } catch (error) {
    console.error("CREATE PAYMENT ERROR:", error);
    next(error);
  }
};

/**
 * Verify Razorpay payment signature
 * @route POST /api/payments/verify
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Create signature verification string
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    // Generate expected signature
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    // Verify signature
    if (razorpay_signature === expectedSign) {
      // Payment verified - update database
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: "completed",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        },
        { new: true }
      );

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.json({
        success: true,
        message: "Payment verified successfully",
        payment
      });
    } else {
      // Invalid signature
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );

      res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    next(error);
  }
};

/**
 * Get payment by booking ID
 * @route GET /api/payments/booking/:bookingId
 */
exports.getPaymentByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ bookingId: req.params.bookingId })
      .populate("userId", "name email")
      .populate("bookingId");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Authorization check
    if (
      req.user.role !== "admin" &&
      payment.userId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's payment history
 * @route GET /api/payments/user/me
 */
exports.getUserPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate("bookingId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Razorpay webhook handler
 * @route POST /api/payments/webhook
 */
exports.handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature === expectedSignature) {
      const event = req.body.event;
      const paymentEntity = req.body.payload.payment.entity;

      // Handle different events
      switch (event) {
        case "payment.captured":
          await Payment.findOneAndUpdate(
            { razorpayPaymentId: paymentEntity.id },
            { status: "completed" }
          );
          break;

        case "payment.failed":
          await Payment.findOneAndUpdate(
            { razorpayOrderId: paymentEntity.order_id },
            { status: "failed" }
          );
          break;
      }

      res.json({ status: "ok" });
    } else {
      res.status(400).json({ error: "Invalid signature" });
    }
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
      message: "Payment status updated successfully",
      payment
    });
  } catch (error) {
    next(error);
  }
};
