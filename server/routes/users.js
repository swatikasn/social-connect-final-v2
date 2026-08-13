const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { getMe, updateMe, getUsers, getUser, setAvatar, deleteMe } = require("../controllers/userController");

router.use(requireAuth);
router.get("/me", getMe);
router.patch("/me", updateMe);
router.delete("/me", deleteMe);
router.get("/", getUsers);
router.get("/:id", getUser);
router.patch("/me/avatar", setAvatar);
module.exports = router;
