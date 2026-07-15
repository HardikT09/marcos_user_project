const router = require("express").Router();

const {
    authentication,
    restrictToRole,
} = require("../controller/authController");

const {
    getAllUser,
    assignRole,
    updateUserStatus,
} = require("../controller/userController");

//  GET ALL USERS 
// Admin and Super Admin can view users
router
    .route("/")
    .get(
        authentication,
        restrictToRole("Admin", "Super Admin"),
        getAllUser
    );

//  ASSIGN ROLE 
// Only Super Admin can assign roles
router
    .route("/:id/assign-role")
    .patch(
        authentication,
        restrictToRole("Super Admin"),
        assignRole
    );

//  ACTIVATE / DEACTIVATE USER 
// Only Super Admin can activate/deactivate users
router
    .route("/:id/status")
    .patch(
        authentication,
        restrictToRole("Super Admin"),
        updateUserStatus
    );

module.exports = router;
