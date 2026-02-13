const express = require("express");
const { signup, login } = require("../controllers/authController");
const { signupValidator, loginValidator } = require("../middleware/validators");

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);

module.exports = router;
