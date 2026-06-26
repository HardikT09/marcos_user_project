const redisClient = require('../config/redis');

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

module.exports = {
    getCache,
    setCache,
    deleteCache,
};