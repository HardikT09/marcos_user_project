const { authentication, restrictTo } = require('../controller/authController');
const {
    createProject,
    getAllProject,
    getProjectById,
    updateProject,
    deleteProject,
} = require('../controller/projectController');

const router = require('express').Router();

router
    .route('/')
    .post(authentication, restrictTo('2'), createProject)
    .get(authentication, restrictTo('2'), getAllProject);

router
    .route('/:id')
    .get(authentication, restrictTo('2'), getProjectById)
    .patch(authentication, restrictTo('2'), updateProject)
    .delete(authentication, restrictTo('2'), deleteProject);

module.exports = router;
