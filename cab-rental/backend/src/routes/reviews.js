// Review routes
const router = require("express").Router();
const auth = require("../middleware/auth");
const reviewController = require("../controllers/reviewController");

// Add review
router.post(
  "/",
  auth(["customer", "driver"]),
  reviewController.addReview
);

// Get vehicle reviews
router.get(
  "/vehicle/:id",
  reviewController.getVehicleReviews
);

module.exports = router;
