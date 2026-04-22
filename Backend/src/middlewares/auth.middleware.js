const blacklistModel = require("../models/blacklist.model");
const userModel = require("../models/user.model");
const redis = require("../config/cache")
const jwt = require("jsonwebtoken");


async function authUser(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Token not provided"
        })
    }

    let isTokenBlacklisted = null;
    try {
        isTokenBlacklisted = await redis.get(token)
    } catch (err) {
        console.warn("Redis unavailable during auth check, skipping token blacklist.", err.message)
    }

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "Invalid token"
        })
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
        )

        req.user = decoded

        next()
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token"
        })
    }
}

module.exports = { authUser }