const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    refreshAccessToken,
    logout,
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

// Refresh Token
router
    .route("/refresh-token")
    .post(refreshAccessToken);

// Logout
router
    .route("/logout")
    .post(logout);

module.exports = router;

