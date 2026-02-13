const router = require("express").Router();
const auth = require("../middleware/auth");
const chatController = require("../controllers/chatController");

// Get chat messages for a booking
router.get(
    "/booking/:bookingId/messages",
    auth(),
    chatController.getChatMessages
);

// Send message in booking chat
router.post(
    "/booking/:bookingId/message",
    auth(),
    chatController.sendMessage
);

// Mark messages as read
router.patch(
    "/booking/:bookingId/read",
    auth(),
    chatController.markMessagesAsRead
);

// Delete chat history
router.delete(
    "/booking/:bookingId/messages",
    auth(),
    chatController.deleteChatHistory
);

module.exports = router;
