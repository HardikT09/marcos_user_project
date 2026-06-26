require('dotenv').config({ path: `${process.cwd()}/.env` });

const express = require('express');

const authRouter = require('./route/authRoute');
const projectRouter = require('./route/projectRoute');
const userRouter = require('./route/userRoute');

const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const sequelize = require('./config/database');
const redisClient = require('./config/redis');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/project', projectRouter);
app.use('/api/v1/user', userRouter);

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

// Start Server
(async () => {
    try {
        // Connect PostgreSQL
        await sequelize.sync({ alter: true });
        console.log(' Database synced');

        // Connect Redis
        await redisClient.connect();

        // Start Express Server
        app.listen(PORT, () => {
            console.log(` Server up and running on port ${PORT}`);
        });
    } catch (err) {
        console.error(' Error starting server:', err);
    }
})();