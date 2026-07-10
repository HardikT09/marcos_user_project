const project = require("../models/project");
const user = require("../models/user");
const Role = require("../models/role");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const {
    getCache,
    setCache,
    deleteCache,
} = require("../utils/redisCache");

// ================= CREATE PROJECT =================
const createProject = catchAsync(async (req, res, next) => {
    const body = req.body;
    const userId = req.user.id;

    const newProject = await project.create({
        title: body.title,
        productImage: body.productImage,
        price: body.price,
        shortDescription: body.shortDescription,
        description: body.description,
        productUrl: body.productUrl,
        category: body.category,
        tags: body.tags,
        createdBy: userId,
        slag: body.slag,
    });

    const cacheKey = `projects:${userId}`;
    await deleteCache(cacheKey);

    console.log("Project cache cleared");

    return res.status(201).json({
        status: "success",
        data: newProject,
    });
});

// ================= PROJECT MANAGER - OWN PROJECTS =================
const getAllProject = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const cacheKey = `projects:${userId}`;

    const cacheData = await getCache(cacheKey);

    if (cacheData) {
        console.log("Data fetched from Redis");

        return res.json({
            status: "success",
            source: "redis",
            data: cacheData,
        });
    }

    const result = await project.findAll({
        where: {
            createdBy: userId,
        },
        include: [
            {
                model: user,
                attributes: {
                    exclude: ["password", "deletedAt"],
                },
                include: [
                    {
                        model: Role,
                        attributes: ["id", "roleName"],
                    },
                ],
            },
        ],
    });

    await setCache(cacheKey, result);

    console.log("Data fetched from PostgreSQL");

    return res.json({
        status: "success",
        source: "postgres",
        data: result,
    });
});

// ================= ADMIN - ALL PROJECTS =================
const getAllProjectsForAdmin = catchAsync(async (req, res, next) => {
    const result = await project.findAll({
        include: [
            {
                model: user,
                attributes: {
                    exclude: ["password", "deletedAt"],
                },
                include: [
                    {
                        model: Role,
                        attributes: ["id", "roleName"],
                    },
                ],
            },
        ],
        order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
        status: "success",
        totalProjects: result.length,
        data: result,
    });
});

// ================= GET PROJECT BY ID =================
const getProjectById = catchAsync(async (req, res, next) => {
    const projectId = req.params.id;

    const result = await project.findByPk(projectId, {
        include: [
            {
                model: user,
                attributes: {
                    exclude: ["password", "deletedAt"],
                },
                include: [
                    {
                        model: Role,
                        attributes: ["id", "roleName"],
                    },
                ],
            },
        ],
    });

    if (!result) {
        return next(new AppError("Invalid project id", 400));
    }

    return res.json({
        status: "success",
        data: result,
    });
});

// ================= UPDATE PROJECT =================
const updateProject = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const projectId = req.params.id;
    const body = req.body;

    const result = await project.findOne({
        where: {
            id: projectId,
            createdBy: userId,
        },
    });

    if (!result) {
        return next(new AppError("Invalid project id", 400));
    }

    result.title = body.title;
    result.productImage = body.productImage;
    result.price = body.price;
    result.shortDescription = body.shortDescription;
    result.description = body.description;
    result.productUrl = body.productUrl;
    result.category = body.category;
    result.tags = body.tags;
    result.slag = body.slag;

    const updatedResult = await result.save();

    const cacheKey = `projects:${userId}`;
    await deleteCache(cacheKey);

    console.log("Project cache cleared");

    return res.json({
        status: "success",
        data: updatedResult,
    });
});

// ================= DELETE PROJECT =================
const deleteProject = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const projectId = req.params.id;

    const result = await project.findOne({
        where: {
            id: projectId,
            createdBy: userId,
        },
    });

    if (!result) {
        return next(new AppError("Invalid project id", 400));
    }

    await result.destroy({
        force: true,
    });

    const cacheKey = `projects:${userId}`;
    await deleteCache(cacheKey);

    console.log("Project cache cleared");

    return res.json({
        status: "success",
        message: "Record deleted successfully",
    });
});

module.exports = {
    createProject,
    getAllProject,
    getAllProjectsForAdmin,
    getProjectById,
    updateProject,
    deleteProject,
};