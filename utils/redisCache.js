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

module.exports = {
    getCache,
    setCache,
    deleteCache,
    setResetToken,
    getResetToken,
    deleteResetToken,
};