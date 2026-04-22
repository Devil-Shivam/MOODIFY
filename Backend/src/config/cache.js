const RedisPackage = require("ioredis");
const Redis = RedisPackage.default || RedisPackage;

const redisOptions = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    connectTimeout: 10000,
    retryStrategy: () => null,
    maxRetriesPerRequest: 0,
    enableOfflineQueue: false
};

const noopRedis = {
    get: async () => null,
    set: async () => null,
    del: async () => null,
    quit: async () => null
};

let client = noopRedis;

if (process.env.REDIS_HOST || process.env.REDIS_PORT) {
    client = new Redis(redisOptions);

    client.on("connect", () => {
        console.log("Server is connected to Redis")
    })

    client.on("error", (err) => {
        console.error("Redis connection error:", err.message)
        client = noopRedis
    })
} else {
    console.warn("Redis is not configured. Redis cache is disabled.")
}

module.exports = {
    get: async (...args) => client.get(...args),
    set: async (...args) => client.set(...args),
    del: async (...args) => client.del(...args),
    quit: async (...args) => client.quit(...args)
};