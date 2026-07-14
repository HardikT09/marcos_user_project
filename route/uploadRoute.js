const router = require("express").Router();

const multer = require("multer");

const upload = require("../middleware/uploadMiddleware");

const {
    authentication,
    restrictToRole,
} = require("../controller/authController");

const {
    uploadFile,
    getAllUploads,
    getProfile,
} = require("../controller/uploadController");

router
    .route("/")
    .post(
        authentication,
        restrictToRole("Project Manager"),
        (req, res, next) => {
            upload.single("file")(req, res, (err) => {
                if (err instanceof multer.MulterError) {
                    return res.status(400).json({
                        status: "fail",
                        message: "File size greater than 5MB",
                    });
                }

                if (err) {
                    return res.status(400).json({
                        status: "fail",
                        message: err.message,
                    });
                }

                next();
            });
        },
        uploadFile
    )
    .get(
        authentication,
        restrictToRole("Project Manager"),
        getAllUploads
    );

router.get(
    "/profile",
    authentication,
    restrictToRole("Project Manager"),
    getProfile
);

module.exports = router;