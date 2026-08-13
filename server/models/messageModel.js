const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  message: { text: { type: String, default: "" }, media: { url: String, publicId: String } },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  readAt: Date,
}, { timestamps: true });
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
module.exports = mongoose.model("Message", messageSchema);
