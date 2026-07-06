const { Op } = require("sequelize");
const user = require("../models/user");
const Role = require("../models/role");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Get All Users
const getAllUser = catchAsync(async (req, res, next) => {
    const users = await user.findAndCountAll({
        where: {
            userType: {
                [Op.ne]: "0",
            },
        },
        attributes: {
            exclude: ["password"],
        },
        include: [
            {
                model: Role,
                attributes: ["id", "roleName", "isActive"],
            },
        ],
    });

    return res.status(200).json({
        status: "success",
        data: users,
    });
});

// Assign Role
const assignRole = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const { roleId } = req.body;

    if (!roleId) {
        return next(new AppError("Role Id is required", 400));
    }

    const existingUser = await user.findByPk(userId);

    if (!existingUser) {
        return next(new AppError("User not found", 404));
    }

    const existingRole = await Role.findByPk(roleId);

    if (!existingRole) {
        return next(new AppError("Role not found", 404));
    }

    existingUser.roleId = roleId;

    await existingUser.save();

    return res.status(200).json({
        status: "success",
        message: "Role assigned successfully",
        data: existingUser,
    });
});

module.exports = {
    getAllUser,
    assignRole,
};