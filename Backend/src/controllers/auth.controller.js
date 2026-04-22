const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklist.model")
const redis = require("../config/cache")
const storageService = require("../services/storage.service")

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/"
}

async function registerUser(req, res) {
    const { username, email, password } = req.body;

    const isAlreadyRegistered = await userModel.findOne({
        $or: [
            { email },
            { username }
        ]
    })

    if (isAlreadyRegistered) {
        return res.status(400).json({
            message: "User with the same email or username already exists"
        })
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "3d"
        }
    )

    res.cookie("token", token, cookieOptions)

    return res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}

async function loginUser(req, res) {
    const { email, password, username } = req.body;

    const searchTerms = [];
    if (email) searchTerms.push({ email });
    if (username) searchTerms.push({ username });

    if (!searchTerms.length) {
        return res.status(400).json({
            message: "Email or username is required"
        })
    }

    const user = await userModel.findOne({
        $or: searchTerms
    }).select("+password")

    if (!user) {
        return res.status(400).json({
            message: "Invalid credentials"
        })
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid credentials"
        })
    }

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "3d"
        }
    )

    res.cookie("token", token, cookieOptions)

    return res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

async function getMe(req, res) {
    const user = await userModel.findById(req.user.id)
        .populate("favorites")

    res.status(200).json({
        message: "User fetched successfully",
        user
    })
}

async function updateProfile(req, res) {
    const { name, avatarUrl } = req.body
    let update = { name }

    if (req.file) {
        const uploadResult = await storageService.uploadFile({
            buffer: req.file.buffer,
            filename: `avatar-${req.user.id}.jpg`,
            folder: "/cohort-2/moodify/avatars"
        })
        update.avatarUrl = uploadResult.url
    } else if (avatarUrl) {
        update.avatarUrl = avatarUrl
    }

    const user = await userModel.findByIdAndUpdate(
        req.user.id,
        update,
        { new: true }
    ).populate("favorites")

    res.status(200).json({
        message: "Profile updated successfully",
        user
    })
}

async function getDashboard(req, res) {
    const user = await userModel.findById(req.user.id).populate("favorites")

    const today = new Date()
    const days = []
    const moodMap = {}
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setHours(0, 0, 0, 0)
        date.setDate(today.getDate() - i)
        const key = date.toISOString().slice(0, 10)
        days.push({
            date: key,
            label: date.toLocaleDateString("en-US", { weekday: "short" }),
            happy: 0,
            sad: 0,
            surprised: 0
        })
        moodMap[key] = days[days.length - 1]
    }

    user.moodHistory.forEach((entry) => {
        const key = entry.recordedAt.toISOString().slice(0, 10)
        if (moodMap[key]) {
            moodMap[key][entry.mood] += 1
        }
    })

    const moodCounts = user.moodHistory.reduce(
        (acc, entry) => {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1
            return acc
        },
        { happy: 0, sad: 0, surprised: 0 }
    )

    res.status(200).json({
        message: "Dashboard data fetched successfully",
        dashboard: {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                favorites: user.favorites
            },
            history: user.moodHistory,
            chart: days,
            moodCounts,
            favorites: user.favorites
        }
    })
}

async function logoutUser(req, res) {

    const token = req.cookies.token

    res.clearCookie("token")

    if (token) {
        try {
            await redis.set(token, Date.now().toString(), "EX", 60 * 60)
        } catch (err) {
            console.warn("Redis unavailable during logout, skipping blacklist set.", err.message)
        }
    }

    res.status(200).json({
        message: "logout successfully."
    })
}


module.exports = { registerUser, loginUser, getMe, updateProfile, getDashboard, logoutUser }