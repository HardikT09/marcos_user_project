const router = require("express").Router();

const multer = require("multer");

const upload = require("../middleware/uploadMiddleware");

const {
    authentication,
    restrictTo,
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
        restrictTo("2"),
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
    .get(authentication, restrictTo("2"), getAllUploads);

router.get(
    "/profile",
    authentication,
    restrictTo("2"),
    getProfile
);

module.exports = router;
