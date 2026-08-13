const User = require("../models/userModel");
const Message = require("../models/messageModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");

if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}
const publicFields = "username email avatarImage isAvatarImageSet firebaseUid createdAt";
const session = (user) => jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
const respondWithSession = (res, user, status = 200) => res.status(status).json({ token: session(user), user: user.toObject ? user.toObject() : user });

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "Username, email and password are required" });
    if (await User.exists({ $or: [{ username }, { email }] })) return res.status(409).json({ message: "Username or email is already used" });
    const user = await User.create({ username, email, password: await bcrypt.hash(password, 12) });
    user.password = undefined;
    respondWithSession(res, user, 201);
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+password");
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) return res.status(401).json({ message: "Invalid email or password" });
    user.password = undefined;
    respondWithSession(res, user);
  } catch (error) { next(error); }
};

exports.firebaseLogin = async (req, res, next) => {
  try {
    if (!admin.apps.length) return res.status(503).json({ message: "Firebase Admin is not configured" });
    const decoded = await admin.auth().verifyIdToken(req.body.idToken);
    const email = decoded.email;
    if (!email) return res.status(400).json({ message: "Google account email is required" });
    const username = (decoded.name || email.split("@")[0]).replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 20);
    const user = await User.findOneAndUpdate({ firebaseUid: decoded.uid }, { $setOnInsert: { email, username, firebaseUid: decoded.uid, avatarImage: decoded.picture || "", isAvatarImageSet: Boolean(decoded.picture) } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    respondWithSession(res, user);
  } catch (error) { next(error); }
};

exports.getMe = async (req, res, next) => { try { res.json(await User.findById(req.user.id).select(publicFields).lean()); } catch (e) { next(e); } };
exports.updateMe = async (req, res, next) => { try { const user = await User.findByIdAndUpdate(req.user.id, { $set: { username: req.body.username } }, { new: true, runValidators: true }).select(publicFields); res.json(user); } catch (e) { next(e); } };
exports.setAvatar = async (req, res, next) => { try { const user = await User.findByIdAndUpdate(req.user.id, { avatarImage: req.body.image, isAvatarImageSet: true }, { new: true }).select(publicFields); res.json(user); } catch (e) { next(e); } };
exports.getUsers = async (req, res, next) => { try { res.json(await User.find({ _id: { $ne: req.user.id } }).select(publicFields).sort({ username: 1 }).lean()); } catch (e) { next(e); } };
exports.getUser = async (req, res, next) => { try { const user = await User.findById(req.params.id).select(publicFields).lean(); if (!user) return res.status(404).json({ message: "User not found" }); res.json(user); } catch (e) { next(e); } };
exports.deleteMe = async (req, res, next) => { try { await Message.deleteMany({ $or: [{ sender: req.user.id }, { receiver: req.user.id }] }); await User.findByIdAndDelete(req.user.id); res.status(204).send(); } catch (e) { next(e); } };
