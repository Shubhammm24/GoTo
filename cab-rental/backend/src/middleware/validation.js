// Validation middleware
const { validateEmail, validatePhone } = require("../utils/validators");

exports.validateRegistration = (req, res, next) => {
  const { email, phone, password } = req.body;

  if (!email || !phone || !password)
    return res.status(400).json({ msg: "Missing required fields" });

  if (!validateEmail(email))
    return res.status(400).json({ msg: "Invalid email" });

  if (!validatePhone(phone))
    return res.status(400).json({ msg: "Invalid phone number" });

  next();
};

exports.validateCoordinates = (req, res, next) => {
  const { lat, lng } = req.body;
  if (
    typeof lat !== "number" ||
    typeof lng !== "number"
  ) {
    return res.status(400).json({ msg: "Invalid coordinates" });
  }
  next();
};
