const user = require("../models/user");
const Role = require("../models/role");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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

    if (!["1", "2"].includes(body.userType)) {
        throw new AppError("Invalid user Type", 400);
    }

    const newUser = await user.create({
        userType: body.userType,
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

// LOGIN 
const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }

    const result = await user.findOne({
        where: { email },
        include: [
            {
                model: Role,
            },
        ],
    });

    if (!result || !(await bcrypt.compare(password, result.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    // Role not assigned
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
    });

    if (!freshUser) {
        return next(new AppError("User no longer exists", 400));
    }

    req.user = freshUser;

    return next();
});

// AUTHORIZATION
const restrictTo = (...userType) => {
    return (req, res, next) => {
        if (!userType.includes(req.user.userType)) {
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
    authentication,
    restrictTo,
};