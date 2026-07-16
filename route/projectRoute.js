const {
    authentication,
    restrictToRole,
} = require("../controller/authController");

const {
    createProject,
    getAllProject,
    getAllProjectsForAdmin,
    getProjectById,
    updateProject,
    deleteProject,
} = require("../controller/projectController");

const router = require("express").Router();

//  PROJECT MANAGER 
router
    .route("/")
    .post(
        authentication,
        restrictToRole("Project Manager"),
        createProject
    )
    .get(
        authentication,
        restrictToRole("Project Manager"),
        getAllProject
    );

//  ADMIN 
router
    .route("/all")
    .get(
        authentication,
        restrictToRole("Super Admin","Admin"),
        getAllProjectsForAdmin
    );

//  PROJECT MANAGER 
router
    .route("/:id")
    .get(
        authentication,
        restrictToRole("Project Manager","Super Admin","Admin"),
        getProjectById
    )
    .patch(
        authentication,
        restrictToRole("Project Manager"),
        updateProject
    )
    .delete(
        authentication,
        restrictToRole("Project Manager"),
        deleteProject
    );

module.exports = router;



