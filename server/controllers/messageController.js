const Message = require("../models/messageModel");

exports.addMessage = async (req, res, next) => {
  try {
    const { recipientId, text, media } = req.body;
    if (!recipientId || (!text?.trim() && !media?.url)) return res.status(400).json({ message: "A recipient and message content are required" });
    const message = await Message.create({ sender: req.user.id, receiver: recipientId, message: { text: text?.trim() || "", media } });
    res.status(201).json(message);
  } catch (error) { next(error); }
};
exports.getMessages = async (req, res, next) => { try { const messages = await Message.find({ $or: [{ sender: req.user.id, receiver: req.params.userId }, { sender: req.params.userId, receiver: req.user.id }] }).sort({ createdAt: 1 }).limit(100).lean(); res.json(messages); } catch (e) { next(e); } };
exports.getConversations = async (req, res, next) => { try { const messages = await Message.find({ $or: [{ sender: req.user.id }, { receiver: req.user.id }] }).sort({ createdAt: -1 }).limit(100).populate("sender receiver", "username avatarImage").lean(); const unique = []; const seen = new Set(); for (const message of messages) { const peer = String(message.sender._id) === req.user.id ? message.receiver : message.sender; if (!seen.has(String(peer._id))) { seen.add(String(peer._id)); unique.push({ user: peer, lastMessage: message }); } } res.json(unique); } catch (e) { next(e); } };
exports.markRead = async (req, res, next) => { try { const message = await Message.findOneAndUpdate({ _id: req.params.id, receiver: req.user.id }, { readAt: new Date() }, { new: true }); if (!message) return res.status(404).json({ message: "Message not found" }); res.json(message); } catch (e) { next(e); } };
