const { uploadController, deleteController } = require("../controllers/cloudinaryController");
const { requireAuth } = require("../middleware/auth");
const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(requireAuth);
router.post("/upload", upload.single("image"), uploadController);
router.delete("/", deleteController);
module.exports = router;
