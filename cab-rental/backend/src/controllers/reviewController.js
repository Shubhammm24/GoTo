// Review controller
const Review = require("../models/Review");

exports.addReview = async (req, res, next) => {
  try {
    const { vehicleId, rating, comment } = req.body;

    if (!vehicleId || !rating || !comment) {
      return res.status(400).json({ message: "Missing required review fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const review = await Review.create({
      vehicleId,
      rating,
      comment,
      reviewerId: req.user.id
    });

    res.status(201).json({
      message: "Review added successfully",
      review
    });
  } catch (error) {
    next(error);
  }
};

exports.getVehicleReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ vehicleId: req.params.id }).populate("reviewerId", "name");

    res.json({
      message: "Reviews fetched successfully",
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};
