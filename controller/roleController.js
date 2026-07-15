const Role = require("../models/role");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//  CREATE ROLE 
const createRole = catchAsync(async (req, res, next) => {
    let { roleName } = req.body;

    if (!roleName) {
        return next(new AppError("Role name is required", 400));
    }

    roleName = roleName.trim();

    const roleExists = await Role.findOne({
        where: {
            roleName,
        },
    });

    if (roleExists) {
        return next(new AppError("Role already exists", 400));
    }

    const newRole = await Role.create({
        roleName,
    });

    return res.status(201).json({
        status: "success",
        data: newRole,
    });
});

//  GET ALL ROLES 
const getAllRoles = catchAsync(async (req, res) => {
    const roles = await Role.findAll({
        order: [["id", "ASC"]],
    });

    return res.status(200).json({
        status: "success",
        data: roles,
    });
});

//  UPDATE ROLE 
const updateRole = catchAsync(async (req, res, next) => {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
        return next(new AppError("Role not found", 404));
    }

    if (req.body.roleName !== undefined) {
        role.roleName = req.body.roleName;
    }

    if (req.body.isActive !== undefined) {
        role.isActive = req.body.isActive;
    }

    // Save who updated the role
    role.updatedBy = req.user.id;

    await role.save();

    return res.status(200).json({
        status: "success",
        data: role,
    });
});

module.exports = {
    createRole,
    getAllRoles,
    updateRole,
};
