const router = require("express").Router();

const {
    authentication,
    restrictTo,
} = require("../controller/authController");

const {
    getAllUser,
    assignRole,
} = require("../controller/userController");

// Get all users
router
    .route("/")
    .get(authentication, getAllUser);

// Assign Role
router
    .route("/:id/assign-role")
    .patch(authentication, assignRole);

module.exports = router;