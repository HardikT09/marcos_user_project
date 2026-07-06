const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

module.exports = sequelize.define(
    "role",
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },

        roleName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notNull: {
                    msg: "Role name cannot be null",
                },
                notEmpty: {
                    msg: "Role name cannot be empty",
                },
            },
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },

        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },

        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },

        deletedAt: {
            type: DataTypes.DATE,
        },
    },
    {
        paranoid: true,
        freezeTableName: true,
        modelName: "role",
    }
);