// Error handler middleware
module.exports = (err, req, res, next) => {
  console.error("❌ Error:", err);

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500
      ? "Internal Server Error"
      : err.message || "Internal Server Error",
    ...(isProduction ? {} : { stack: err.stack })
  });
};
