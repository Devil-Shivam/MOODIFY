const multer = require("multer")

const storage = multer.memoryStorage()


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 110 // 110MB
    }
})


module.exports = upload