const router = require("express").Router();

const {
    createRole,
    getAllRoles,
    updateRole,
} = require("../controller/roleController");

const {
    authentication,
    restrictToRole,
} = require("../controller/authController");

//  ROLE APIs 

// Only Super Admin can create and view roles
router
    .route("/")
    .post(
        authentication,
        restrictToRole("Super Admin"),
        createRole
    )
    .get(
        authentication,
        restrictToRole("Super Admin"),
        getAllRoles
    );

// Only Super Admin can update roles
router
    .route("/:id")
    .patch(
        authentication,
        restrictToRole("Super Admin"),
        updateRole
    );

module.exports = router;