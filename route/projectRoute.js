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
    searchProjects,
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

//  SUPER ADMIN & ADMIN - GET ALL PROJECTS
router
    .route("/all")
    .get(
        authentication,
        restrictToRole("Super Admin", "Admin"),
        getAllProjectsForAdmin
    );

//  SUPER ADMIN & ADMIN - SEARCH / FILTER / SORT PROJECTS
router
    .route("/search")
    .get(
        authentication,
        restrictToRole("Super Admin", "Admin"),
        searchProjects
    );

//  PROJECT DETAILS
router
    .route("/:id")
    .get(
        authentication,
        restrictToRole(
            "Project Manager",
            "Super Admin",
            "Admin"
        ),
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
