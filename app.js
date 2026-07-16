require('dotenv').config({ path: `${process.cwd()}/.env` });

const express = require('express');
const formatResponse = require("./utils/formatResponse");

const authRouter = require('./route/authRoute');
const projectRouter = require('./route/projectRoute');
const userRouter = require('./route/userRoute');
const uploadRouter = require('./route/uploadRoute');
const roleRouter = require("./route/roleRoute");

const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const sequelize = require('./config/database');
const redisClient = require('./config/redis');
const createSuperAdmin = require('./utils/superAdminSeeder');

const app = express();

// Middleware
app.use((req, res, next) => {
    const originalJson = res.json;

    res.json = function (body) {
        if (body && body.data) {
            body.data = formatResponse(body.data);
        }

        return originalJson.call(this, body);
    };

    next();
});

app.use(express.json());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/role", roleRouter);


// Handle undefined routes
app.use(
    catchAsync(async (req, res, next) => {
        throw new AppError(
            `Cant find ${req.originalUrl} on this server`,
            404
        );
    })
);

// Global Error Handler
app.use(globalErrorHandler);

const PORT = process.env.APP_PORT || 4000;

(async () => {
    try {

        await sequelize.sync({ alter: true });
        console.log(" Database synced");

        await redisClient.connect();

        // Create Super Admin if it doesn't exist
        await createSuperAdmin();

        app.listen(PORT, () => {
            console.log(` Server up and running on port ${PORT}`);
        });

    } catch (err) {
        console.error(" Error starting server:", err);
    }
})();
