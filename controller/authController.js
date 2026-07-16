const user = require("../models/user");
const Role = require("../models/role");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const {
    setResetToken,
    getResetToken,
    deleteResetToken,
} = require("../utils/redisCache");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

//  SIGNUP 
const signup = catchAsync(async (req, res, next) => {
    const body = req.body;

    const newUser = await user.create({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
        confirmPassword: body.confirmPassword,
    });

    if (!newUser) {
        return next(new AppError("Failed to create the user", 400));
    }

    const result = newUser.toJSON();

    delete result.password;
    delete result.deletedAt;

    result.token = generateToken({
        id: result.id,
    });

    return res.status(201).json({
        status: "success",
        data: result,
    });
});

//  LOGIN 

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }

    const result = await user.findOne({
        where: {
            email,
        },
        include: [
            {
                model: Role,
            },
        ],
    });

    // User not found
    if (!result) {
        return next(new AppError("Incorrect email or password", 401));
    }

    // Check if account is locked
    if (
        result.accountLockedUntil &&
        result.accountLockedUntil > new Date()
    ) {
        return next(
            new AppError(
                "Your account is locked. Please try again after 10 minutes.",
                403
            )
        );
    }

    // Wrong password
    const isPasswordCorrect = await bcrypt.compare(
        password,
        result.password
    );

    if (!isPasswordCorrect) {
    result.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (result.failedLoginAttempts >= 5) {
        result.accountLockedUntil = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await sendEmail({
            email: result.email,
            subject: "Account Locked",
            message: `Hello ${result.firstName},

Your account has been locked because of 5 unsuccessful login attempts.

Please try again after 10 minutes.

Regards,
Marcos Team`,
        });

        await result.save();

        return next(
            new AppError(
                "Your account has been locked for 10 minutes due to 5 unsuccessful login attempts.",
                403
            )
        );
    }

    await result.save();

    return next(new AppError("Incorrect email or password", 401));
}


    // Reset failed attempts after successful login
    result.failedLoginAttempts = 0;
    result.accountLockedUntil = null;
    await result.save();

    // No role assigned
    if (!result.roleId) {
        return next(
            new AppError(
                "Your account is pending role assignment. Please contact Super Admin.",
                403
            )
        );
    }

    // Role inactive
    if (!result.role.isActive) {
        return next(
            new AppError(
                "Your assigned role is inactive. Please contact Super Admin.",
                403
            )
        );
    }

    // User inactive
    if (!result.isActive) {
        return next(
            new AppError(
                "Your account has been deactivated by Super Admin.",
                403
            )
        );
    }

    const token = generateToken({
        id: result.id,
    });

    return res.status(200).json({
        status: "success",
        token,
    });
});

// ===================== FORGOT PASSWORD =====================
const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Please provide your email", 400));
    }

    const existingUser = await user.findOne({
        where: {
            email,
        },
    });

    if (!existingUser) {
        return next(new AppError("No user found with this email", 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store token in Redis for 15 minutes
    await setResetToken(resetToken, existingUser.id);
    console.log("Redis Token:", resetToken);
    console.log("Redis UserId:", existingUser.id);

    // Reset URL
    const resetURL = `http://localhost:3000/api/v1/auth/reset-password/${resetToken}`;

    // Send Email
    await sendEmail({
        email: existingUser.email,
        subject: "Password Reset Request",
        message: `Hello ${existingUser.firstName},

You requested to reset your password.

Click the link below to reset it:

${resetURL}

This link will expire in 15 minutes and can only be used once.

If you did not request this, please ignore this email.

Regards,
Marcos Team`,
    });

    return res.status(200).json({
        status: "success",
        message: "Password reset link has been sent to your registered email.",
    });
});

// ===================== RESET PASSWORD =====================
const resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
        return next(
            new AppError(
                "Please provide password and confirm password",
                400
            )
        );
    }

    // Get user id from Redis
    const userId = await getResetToken(token);

    if (!userId) {
        return next(
            new AppError(
                "This password reset link has expired or has already been used.",
                400
            )
        );
    }

    const existingUser = await user.findByPk(userId);

    if (!existingUser) {
        return next(new AppError("User not found.", 404));
    }

    // Update password
    existingUser.password = password;
    existingUser.confirmPassword = confirmPassword;

    await existingUser.save();

    // Delete token from Redis (one-time use)
    await deleteResetToken(token);

    return res.status(200).json({
        status: "success",
        message: "Password has been reset successfully. Please login again.",
    });
});

//  AUTHENTICATION 
const authentication = catchAsync(async (req, res, next) => {
    let idToken = "";

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        idToken = req.headers.authorization.split(" ")[1];
    }

    if (!idToken) {
        return next(new AppError("Please login to get access", 401));
    }

    const tokenDetail = jwt.verify(
        idToken,
        process.env.JWT_SECRET_KEY
    );

    const freshUser = await user.findByPk(tokenDetail.id, {
        attributes: {
            exclude: ["password", "deletedAt"],
        },
        include: [
            {
                model: Role,
                attributes: ["id", "roleName", "isActive"],
            },
        ],
    });

    if (!freshUser) {
        return next(new AppError("User no longer exists", 400));
    }

    req.user = freshUser;

    return next();
});

//  ROLE AUTHORIZATION 
const restrictToRole = (...roles) => {
    return (req, res, next) => {

        if (!req.user.role) {
            return next(
                new AppError(
                    "No role assigned to this user",
                    403
                )
            );
        }

        if (!roles.includes(req.user.role.roleName)) {
            return next(
                new AppError(
                    "You don't have permission to perform this action",
                    403
                )
            );
        }

        return next();
    };
};

module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    authentication,
    restrictToRole,
};

