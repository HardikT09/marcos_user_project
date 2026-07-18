const redisClient = require("../config/redis");

// ================= PROJECT CACHE =================

const getCache = async (key) => {
    const data = await redisClient.get(key);

    if (!data) {
        return null;
    }

    return JSON.parse(data);
};

const setCache = async (key, value, ttl = 60) => {
    await redisClient.setEx(
        key,
        ttl,
        JSON.stringify(value)
    );
};

const deleteCache = async (key) => {
    await redisClient.del(key);
};

// ================= RESET PASSWORD TOKEN =================

const setResetToken = async (token, userId) => {
    await redisClient.setEx(
        `resetToken:${token}`,
        900, // 15 minutes
        userId.toString()
    );
};

const getResetToken = async (token) => {
    return await redisClient.get(`resetToken:${token}`);
};

const deleteResetToken = async (token) => {
    await redisClient.del(`resetToken:${token}`);
};

// ================= REFRESH TOKEN =================

const setRefreshToken = async (token, userId) => {
    await redisClient.setEx(
        `refreshToken:${token}`,
        7 * 24 * 60 * 60, // 7 days
        userId.toString()
    );
};

const getRefreshToken = async (token) => {
    return await redisClient.get(`refreshToken:${token}`);
};

const deleteRefreshToken = async (token) => {
    await redisClient.del(`refreshToken:${token}`);
};

module.exports = {
    getCache,
    setCache,
    deleteCache,

    setResetToken,
    getResetToken,
    deleteResetToken,

    setRefreshToken,
    getRefreshToken,
    deleteRefreshToken,
};
