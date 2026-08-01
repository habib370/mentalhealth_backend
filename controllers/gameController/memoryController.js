const MemoryGame = require("../../models/gameModels/MemoryGame");

/**
 * @desc    Save memory game attempt or partial progress
 * @route   POST /api/games/memory/submit
 * @access  Private
 */
const saveMemoryGameResult = async (req, res) => {
  try {
    // Extracts user ID from auth middleware
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User authentication required."
      });
    }

    const {
      gameType,
      timeTakenSec,
      moves,
      score,
      levelReached,
      maxLevels,
      completed,
      status
    } = req.body;

    const newRecord = await MemoryGame.create({
      userId,
      gameType: gameType || "Memory Match Test",
      timeTakenSec: timeTakenSec ?? 0,
      moves: moves ?? 0,
      score: score ?? 0,
      levelReached: levelReached ?? 1,
      maxLevels: maxLevels ?? 2,
      completed: Boolean(completed),
      status: status || "completed"
    });

    return res.status(201).json({
      success: true,
      message: "Memory game result saved successfully.",
      data: newRecord
    });
  } catch (error) {
    console.error("Error in saveMemoryGameResult:", error);
    return res.status(500).json({
      success: false,
      message: "Server error saving memory game result.",
      error: error.message
    });
  }
};

/**
 * @desc    Get all memory game attempts for the logged-in user
 * @route   GET /api/games/memory/records
 * @access  Private
 */
const getMemoryGameResults = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User authentication required."
      });
    }

    const records = await MemoryGame.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error("Error in getMemoryGameResults:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching memory game results.",
      error: error.message
    });
  }
};

module.exports = {
  saveMemoryGameResult,
  getMemoryGameResults
};