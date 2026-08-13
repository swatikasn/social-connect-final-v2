const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, minLength: 3, maxLength: 20, unique: true },
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  password: { type: String, minLength: 8, select: false },
  firebaseUid: { type: String, unique: true, sparse: true },
  isAvatarImageSet: { type: Boolean, default: false }, avatarImage: { type: String, default: "" },
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);
