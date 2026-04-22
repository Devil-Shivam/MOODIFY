const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");


const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"), false);
        }
    },
    credentials: true
}))

/**
 * Routes
 */
const authRoutes = require("./routes/auth.routes")
const songRoutes = require("./routes/song.routes")

app.use("/api/auth", authRoutes)
app.use("/api/songs", songRoutes)

module.exports = app