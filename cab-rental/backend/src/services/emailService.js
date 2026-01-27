exports.sendEmail = async ({
  to,
  subject,
  message
}) => {
  try {
    // TODO: Integrate with Nodemailer or SendGrid
    console.log("📧 Email sent to:", to);
    console.log("📧 Subject:", subject);
    console.log("📧 Message:", message);
    return true;
  } catch (error) {
    console.error("❌ Email error:", error);
    return false;
  }
};
