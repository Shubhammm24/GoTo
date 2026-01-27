// Helper functions
exports.roundAmount = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

exports.generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000);

exports.isValidCoordinates = (lat, lng) =>
  lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

exports.getCurrentHour = () => new Date().getHours();
