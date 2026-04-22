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
    "http://127.0.0.1:5174",
    "https://moodify-fawn.vercel.app"
];

app.use(cors({
    origin: true,
    credentials: true
}))

/**
 * Serve Frontend Static Files
 */
const path = require("path");
app.use(express.static(path.join(__dirname, "./dist")));

// For React Router: serve index.html for any unknown route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./dist/index.html"));
});
    // app.get("/", (req, res) => {
    //     res.sendFile(path.join(__dirname, "./dist/index.html"));
    // });

/**
 * Routes
 */
const authRoutes = require("./routes/auth.routes")
const songRoutes = require("./routes/song.routes")

app.use("/api/auth", authRoutes)
app.use("/api/songs", songRoutes)

module.exports = app