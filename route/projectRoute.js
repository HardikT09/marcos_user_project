const { authentication, restrictTo } = require("../controller/authController");

const {
    createProject,
    getAllProject,
    getAllProjectsForAdmin,
    getProjectById,
    updateProject,
    deleteProject,
} = require("../controller/projectController");

const router = require("express").Router();

// Project Manager
router
    .route("/")
    .post(authentication, restrictTo("2"), createProject)
    .get(authentication, restrictTo("2"), getAllProject);

// Admin - Get All Projects
router
    .route("/all")
    .get(authentication, restrictTo("1"), getAllProjectsForAdmin);

// Project Manager - Single Project
router
    .route("/:id")
    .get(authentication, restrictTo("2"), getProjectById)
    .patch(authentication, restrictTo("2"), updateProject)
    .delete(authentication, restrictTo("2"), deleteProject);

module.exports = router;