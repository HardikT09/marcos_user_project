const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const sequelize = require('../config/database');
const AppError = require('../utils/appError');

const project = require('./project');
const upload = require('./upload');
const role = require('./role');

const user = sequelize.define(
    'user',
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },

        roleId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'role',
                key: 'id',
            },
        },

        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'user',
                key: 'id',
            },
        },

        // ===== Forgot Password =====
        passwordResetToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        passwordResetExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        // ===== Login Lock =====
        failedLoginAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        accountLockedUntil: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'firstName cannot be null',
                },
                notEmpty: {
                    msg: 'firstName cannot be empty',
                },
            },
        },

        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'lastName cannot be null',
                },
                notEmpty: {
                    msg: 'lastName cannot be empty',
                },
            },
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'email cannot be null',
                },
                notEmpty: {
                    msg: 'email cannot be empty',
                },
                isEmail: {
                    msg: 'Invalid email id',
                },
            },
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'password cannot be null',
                },
                notEmpty: {
                    msg: 'password cannot be empty',
                },
            },
        },

        confirmPassword: {
            type: DataTypes.VIRTUAL,
            set(value) {
                if (!this.password || this.password.length < 7) {
                    throw new AppError(
                        'Password length must be greater than 7',
                        400
                    );
                }

                if (value === this.password) {
                    const hashPassword = bcrypt.hashSync(value, 10);
                    this.setDataValue('password', hashPassword);
                } else {
                    throw new AppError(
                        'Password and confirm password must be the same',
                        400
                    );
                }
            },
        },

        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },

        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        deletedAt: {
            type: DataTypes.DATE,
        },
    },
    {
        paranoid: true,
        freezeTableName: true,
        modelName: 'user',
    }
);

// ================= User ↔ Project =================
user.hasMany(project, {
    foreignKey: 'createdBy',
});

project.belongsTo(user, {
    foreignKey: 'createdBy',
});

// ================= User ↔ Upload =================
user.hasMany(upload, {
    foreignKey: 'createdBy',
});

upload.belongsTo(user, {
    foreignKey: 'createdBy',
});

// ================= Role ↔ User =================
role.hasMany(user, {
    foreignKey: 'roleId',
});

user.belongsTo(role, {
    foreignKey: 'roleId',
});

module.exports = user;