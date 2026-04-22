const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    posterUrl: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    mood: {
        type: String,
        enum: {
            values: [ "sad", "happy", "surprised" ],
            message: "Enum this is"
        }
    },
    contentHash: {
        type: String,
        unique: true,
        sparse: true
    }
})

const songModel = mongoose.model("songs", songSchema)

module.exports = songModel