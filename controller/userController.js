const { Op } = require("sequelize");
const user = require("../models/user");
const Role = require("../models/role");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/sendEmail");

//  GET ALL USERS 
const getAllUser = catchAsync(async (req, res, next) => {
    const users = await user.findAndCountAll({
        where: {
            userType: {
                [Op.ne]: "0",
            },
        },
        attributes: {
            exclude: ["password", "deletedAt"],
        },
        include: [
            {
                model: Role,
                attributes: ["id", "roleName", "isActive"],
            },
        ],
        order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
        status: "success",
        data: users,
    });
});

//  ASSIGN ROLE 
const assignRole = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const { roleId, email } = req.body;

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

    // Automatically activate user after role assignment
    existingUser.isActive = true;

    await existingUser.save();

    //  SEND EMAIL 
    await sendEmail({
        email: email || existingUser.email,
        subject: "Role Assigned Successfully",
        message: `Hello ${existingUser.firstName},

Congratulations!

Your role has been assigned successfully.

Role: ${existingRole.roleName}

You can now login to the Marcos application.

Regards,
Marcos Team`,
    });

    const result = existingUser.toJSON();

    delete result.password;
    delete result.deletedAt;

    return res.status(200).json({
        status: "success",
        message: "Role assigned successfully",
        data: result,
    });
});

//  UPDATE USER STATUS 
const updateUserStatus = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
        return next(new AppError("isActive must be true or false", 400));
    }

    const existingUser = await user.findByPk(userId);

    if (!existingUser) {
        return next(new AppError("User not found", 404));
    }

    existingUser.isActive = isActive;

    await existingUser.save();

    const result = existingUser.toJSON();

    delete result.password;
    delete result.deletedAt;

    return res.status(200).json({
        status: "success",
        message: `User ${
            isActive ? "activated" : "deactivated"
        } successfully`,
        data: result,
    });
});

module.exports = {
    getAllUser,
    assignRole,
    updateUserStatus,
};