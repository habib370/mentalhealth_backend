const express = require("express");
const router = express.Router();

// 1. Controllers
const stroopController = require("../controllers/gameController/StroopGameController");
const memoryController = require("../controllers/gameController/memoryController");

// 2. Auth Middleware
const auth = require("../middleware/authMiddleware");

// Protect ALL game routes below this line
router.use(auth);

// --- STROOP GAME ROUTES ---
router.post("/submit", stroopController.saveStroopGameResult);
router.get("/records", stroopController.getGameResults);

// --- MEMORY GAME ROUTES ---
router.post("/memory/submit", memoryController.saveMemoryGameResult);

module.exports = router;