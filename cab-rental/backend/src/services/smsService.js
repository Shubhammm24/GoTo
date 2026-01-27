exports.sendSMS = async ({ to, message }) => {
  try {
    // TODO: Integrate with Twilio or AWS SNS
    console.log("📲 SMS sent to:", to);
    console.log("📲 Message:", message);
    return true;
  } catch (error) {
    console.error("❌ SMS error:", error);
    return false;
  }
};
