const router = require("express").Router();
const { register, login, firebaseLogin } = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.post("/firebase", firebaseLogin);
module.exports = router;
