// Validators utility
exports.validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.validatePhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone);

exports.validateRating = (rating) =>
  rating >= 1 && rating <= 5;
