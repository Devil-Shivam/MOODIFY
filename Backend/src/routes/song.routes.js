const express = require("express")
const upload = require("../middlewares/upload.middleware")
const songController = require("../controllers/song.controller")
const authMiddleware = require("../middlewares/auth.middleware")


const router = express.Router()

/**
 * POST /api/songs/
 */
router.post(
    "/",
    upload.any(),
    songController.uploadSong
)

router.get('/', songController.getSong)
router.get('/play', authMiddleware.authUser, songController.getSongWithHistory)
router.post('/favorite', authMiddleware.authUser, songController.toggleFavorite)
router.get('/favorites', authMiddleware.authUser, songController.getFavorites)

module.exports = router