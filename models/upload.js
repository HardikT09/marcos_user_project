const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define(
    "upload",
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },

        fileName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "fileName cannot be null",
                },
                notEmpty: {
                    msg: "fileName cannot be empty",
                },
            },
        },

        fileType: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "fileType cannot be null",
                },
                notEmpty: {
                    msg: "fileType cannot be empty",
                },
            },
        },

        mimeType: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        fileUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        createdBy: {
            type: DataTypes.INTEGER,
            references: {
                model: "user",
                key: "id",
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
    },
    {
        paranoid: true,
        freezeTableName: true,
        modelName: "upload",
    }
);