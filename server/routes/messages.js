const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { addMessage, getMessages, getConversations, markRead } = require("../controllers/messageController");

router.use(requireAuth);
router.post("/", addMessage);
router.get("/conversations", getConversations);
router.get("/:userId", getMessages);
router.patch("/:id/read", markRead);
module.exports = router;
