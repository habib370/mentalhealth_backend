const express = require("express");
const router = express.Router();

// 1. Controllers
const stroopController = require("../controllers/gameController/StroopGameController");
const memoryController = require("../controllers/gameController/memoryController");
const reflexController = require("../controllers/gameController/reflexController");
const emotionController = require("../controllers/gameController/emotionController");
const analyticsController = require("../controllers/analyticsController");

// 2. Auth Middleware
const auth = require("../middleware/authMiddleware");

// Protect ALL game routes below this line
router.use(auth);

// --- STROOP GAME ROUTES ---
router.post("/stroop/submit", stroopController.saveStroopGameResult);
router.get("/stroop/records", stroopController.getGameResults);

// --- MEMORY GAME ROUTES ---
router.post("/memory/submit", memoryController.saveMemoryGameResult);
router.get("/memory/records", memoryController.getMemoryGameResults);

// --- REFLEX GAME ROUTES ---
router.post("/reflex/submit", reflexController.saveReflexTest);
router.get("/reflex/records", reflexController.getReflexHistory);

// --- EMOTION / PROJECTIVE ASSESSMENT ROUTES ---
router.post("/emotion/submit", emotionController.submitEmotionGame);
router.get("/emotion/history", emotionController.getEmotionHistory);
router.get("/emotion/latest", emotionController.getLatestEmotionResult);

// --- ANALYTICS ROUTE ---
router.get("/analytics/dashboard", analyticsController.getDashboardAnalytics);

module.exports = router;