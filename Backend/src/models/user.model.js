const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [ true, "Username is required" ],
        unique: [ true, "Username must be unique" ]
    },
    email: {
        type: String,
        required: [ true, "Email is required" ],
        unique: [ true, "Email must be unique" ]
    },
    password: {
        type: String,
        required: [ true, "Password is required" ],
        select: false
    },
    name: {
        type: String,
        default: ""
    },
    avatarUrl: {
        type: String,
        default: ""
    },
    moodHistory: [
        {
            mood: {
                type: String,
                enum: [ "sad", "happy", "surprised" ]
            },
            recordedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "songs"
        }
    ]
})

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;