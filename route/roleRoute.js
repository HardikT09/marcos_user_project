const router = require("express").Router();

const {
    createRole,
    getAllRoles,
    updateRole,
} = require("../controller/roleController");

const {
    authentication,
    restrictTo,
} = require("../controller/authController");

router
    .route("/")
    .post(authentication, createRole)
    .get(authentication, getAllRoles);

router
    .route("/:id")
    .patch(authentication, updateRole);

module.exports = router;