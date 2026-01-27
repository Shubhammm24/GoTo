const path = require("path");

module.exports = {
  uploadDir: path.join(__dirname, "../../uploads"),
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "application/pdf"
  ],
  maxFileSize: 5 * 1024 * 1024 // 5 MB
};
