const { Router } = require("express");
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const upload = require("../middlewares/upload.middleware")
const router = Router();


router.post('/register', authController.registerUser)

router.post('/login', authController.loginUser)

router.get("/get-me", authMiddleware.authUser, authController.getMe)
router.patch("/profile", authMiddleware.authUser, upload.single("avatar"), authController.updateProfile)
router.get("/dashboard", authMiddleware.authUser, authController.getDashboard)

router.get("/logout", authController.logoutUser)

module.exports = router;