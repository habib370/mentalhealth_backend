// backend/controllers/gameController.js
const GameResult = require("../../models/gameModels/StroopGame");

exports.saveStroopGameResult = async (req, res) => {
  console.log("Received game result submission:", req.body);
  try {
    const {
      gameType,
      levelReached,
      totalQuestions,
      accuracy,
      avgReactionTimeMs,
      correctCount,
      wrongCount,
      timeoutCount,
      detailedBreakdown,
      analysisReport,
    } = req.body;

    const userId = req.user.id || req.user._id;

    const newResult = new GameResult({
      user: userId,
      gameType: gameType || "5-Level Stroop Focus Assessment",
      levelReached,
      totalQuestions,
      accuracy,
      avgReactionTimeMs,
      correctCount,
      wrongCount,
      timeoutCount,
      detailedBreakdown,
      analysisReport,
    });

    await newResult.save();

    res.status(201).json({
      success: true,
      message: "Game results and analysis saved successfully!",
      data: newResult,
    });
  } catch (error) {
    console.error("Error saving game result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save game result to database",
    });
  }
};

exports.getGameResults = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const results = await GameResult.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching game results:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve game results",
    });
  }
};