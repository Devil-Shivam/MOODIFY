const crypto = require("crypto")
const songModel = require("../models/song.model")
const userModel = require("../models/user.model")
const storageService = require("../services/storage.service")
const id3 = require("node-id3")

function pickRandomSong(songs) {
    return songs.length === 1
        ? songs[0]
        : songs[Math.floor(Math.random() * songs.length)]
}

async function uploadSong(req, res) {
    const files = []

    if (req.file) {
        files.push(req.file)
    }

    if (Array.isArray(req.files) && req.files.length) {
        files.push(...req.files)
    }

    if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {
        Object.values(req.files).forEach((value) => {
            if (Array.isArray(value)) {
                files.push(...value)
            }
        })
    }

    if (!files.length) {
        return res.status(400).json({
            message: "Song file is required"
        })
    }

    const { mood } = req.body
    const createdSongs = []
    const seenHashes = new Set()
    let duplicateCount = 0

    for (const fileObject of files) {
        const songBuffer = fileObject.buffer
        const fileHash = crypto.createHash("sha256").update(songBuffer).digest("hex")

        if (seenHashes.has(fileHash)) {
            duplicateCount += 1
            continue
        }

        seenHashes.add(fileHash)

        const existingSong = await songModel.findOne({ contentHash: fileHash })
        if (existingSong) {
            duplicateCount += 1
            continue
        }

        const tags = id3.read(songBuffer) || {}
        const title = tags.title || fileObject.originalname || `song-${Date.now()}`
        const posterBuffer = tags.image?.imageBuffer

        const songFile = await storageService.uploadFile({
            buffer: songBuffer,
            filename: `${title}-${Date.now()}.mp3`,
            folder: "/cohort-2/moodify/songs"
        })

        let posterUrl = ""
        if (posterBuffer) {
            const posterFile = await storageService.uploadFile({
                buffer: posterBuffer,
                filename: `${title}-${Date.now()}.jpeg`,
                folder: "/cohort-2/moodify/posters"
            })
            posterUrl = posterFile.url
        }

        const song = await songModel.create({
            title,
            url: songFile.url,
            posterUrl,
            mood,
            contentHash: fileHash
        })

        createdSongs.push(song)
    }

    if (!createdSongs.length) {
        return res.status(200).json({
            message: duplicateCount ? "All uploaded files were duplicates and were skipped." : "No new songs uploaded.",
            duplicatesSkipped: duplicateCount
        })
    }

    res.status(201).json({
        message: createdSongs.length === 1 ? "song created successfully" : "songs created successfully",
        songs: createdSongs,
        duplicatesSkipped: duplicateCount
    })
}

async function getSong(req, res) {

    const { mood } = req.query

    if (!mood) {
        return res.status(400).json({
            message: "Mood query parameter is required."
        })
    }

    const songs = await songModel.find({ mood })

    if (!songs.length) {
        return res.status(404).json({
            message: "No song found for this mood."
        })
    }

    const song = songs.length === 1
        ? songs[0]
        : songs[Math.floor(Math.random() * songs.length)]

    res.status(200).json({
        message: "song fetched successfully.",
        song,
    })
}

async function getSongWithHistory(req, res) {
    const { mood } = req.query

    if (!mood) {
        return res.status(400).json({
            message: "Mood query parameter is required."
        })
    }

    const songs = await songModel.find({ mood })

    if (!songs.length) {
        return res.status(404).json({
            message: "No song found for this mood."
        })
    }

    const song = pickRandomSong(songs)

    await userModel.findByIdAndUpdate(req.user.id, {
        $push: {
            moodHistory: {
                mood,
                recordedAt: new Date()
            }
        }
    })

    res.status(200).json({
        message: "song fetched successfully.",
        song,
    })
}

async function toggleFavorite(req, res) {
    const { songId } = req.body

    if (!songId) {
        return res.status(400).json({
            message: "Song id is required"
        })
    }

    const song = await songModel.findById(songId)
    if (!song) {
        return res.status(404).json({
            message: "Song not found"
        })
    }

    const user = await userModel.findById(req.user.id)
    const alreadyFavorite = user.favorites.some((favorite) => favorite.toString() === songId)

    if (alreadyFavorite) {
        user.favorites = user.favorites.filter((favorite) => favorite.toString() !== songId)
    } else {
        user.favorites.push(songId)
    }

    await user.save()
    await user.populate("favorites")

    res.status(200).json({
        message: "Favorite updated successfully",
        favorites: user.favorites
    })
}

async function getFavorites(req, res) {
    const user = await userModel.findById(req.user.id).populate("favorites")

    res.status(200).json({
        message: "Favorites fetched successfully",
        favorites: user.favorites
    })
}

module.exports = { uploadSong, getSong, getSongWithHistory, toggleFavorite, getFavorites }