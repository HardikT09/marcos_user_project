const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = require("../config/s3");
const Upload = require("../models/upload");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const uploadFile = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload a file", 400));
    }

    const userId = req.user.id;

    let key;

    switch (req.body.type) {
        case "profile":
            key = `profiles/${req.file.originalname}`;
            break;

        case "document":
            key = `documents/${req.file.originalname}`;
            break;

        case "image":
            key = `images/${req.file.originalname}`;
            break;

        default:
            key = req.file.originalname;
    }

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    });

    await s3Client.send(command);

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const upload = await Upload.create({
        fileName: req.file.originalname,
        fileType: req.body.type,
        mimeType: req.file.mimetype,
        fileUrl,
        createdBy: userId,
    });

    return res.status(201).json({
        status: "success",
        data: upload,
    });
});

const getAllUploads = catchAsync(async (req, res) => {
    const uploads = await Upload.findAll({
        where: {
            createdBy: req.user.id,
        },
        order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
        status: "success",
        data: uploads,
    });
});

const getProfile = catchAsync(async (req, res, next) => {
    const profile = await Upload.findOne({
        where: {
            createdBy: req.user.id,
            fileType: "profile",
        },
        order: [["createdAt", "DESC"]],
    });

    if (!profile) {
        return next(new AppError("Profile not found", 404));
    }

    const key = profile.fileUrl.split(".amazonaws.com/")[1];

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 300,
    });

    return res.status(200).json({
        status: "success",
        url: signedUrl,
    });
});

module.exports = {
    uploadFile,
    getAllUploads,
    getProfile,
};