const cloudinary = require("cloudinary").v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });

exports.uploadController = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "An image file is required" });
    const encoded = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(encoded, { folder: "social-connect", resource_type: "image", transformation: [{ width: 1600, crop: "limit", fetch_format: "auto", quality: "auto" }] });
    res.status(201).json({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height });
  } catch (error) { next(error); }
};
exports.deleteController = async (req, res, next) => { try { await cloudinary.uploader.destroy(req.body.publicId); res.status(204).send(); } catch (error) { next(error); } };
