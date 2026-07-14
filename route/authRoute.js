const {
    signup,
    login,
    forgotPassword,
    resetPassword,
} = require("../controller/authController");

const router = require("express").Router();

// Signup
router.route("/signup").post(signup);

// Login
router.route("/login").post(login);

// Forgot Password
router.route("/forgot-password").post(forgotPassword);

// Reset Password
router
    .route("/reset-password/:token")
    .patch(resetPassword);

module.exports = router;

