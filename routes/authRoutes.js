const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

// AUTH routes
router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.post("/logout", controller.logout);

// Get current user info
router.get("/me", auth, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email
        }
    });
});

module.exports = router;