const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/music-app";

function connectToDB() {
    if (!process.env.MONGO_URI) {
        console.warn("Warning: MONGO_URI not found. Falling back to local MongoDB.");
    } else {
        console.log("Using MongoDB URI from environment.");
    }

    mongoose.connect(mongoUri)
        .then(() => {
            console.log("Connected to DB")
        })
        .catch(err => {
            console.log("Error connecting to DB", err)
        })
}

module.exports = connectToDB;