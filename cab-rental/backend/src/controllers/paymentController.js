// Payment controller
const Payment = require("../models/Payment");

exports.createPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    if (!bookingId || !amount || !paymentMethod) {
      return res.status(400).json({ message: "Missing required payment fields" });
    }

    const payment = await Payment.create({
      bookingId,
      userId: req.user.id,
      amount,
      paymentMethod,
      status: "pending"
    });

    res.status(201).json({
      message: "Payment created successfully",
      payment
    });
  } catch (error) {
    next(error);
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
