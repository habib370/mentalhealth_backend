// Step up 2 folders to reach backend/models/gameModels/MemoryGame.js
const MemoryGameResult = require("../../models/gameModels/MemoryGame");

exports.saveMemoryGameResult = async (req, res) => {
  console.log("Received Memory Game Submission:", req.body);
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const {
      gameType,
      levelReached,
      totalMoves,
      mismatches,
      accuracy,
      timeTakenSec,
      analysisReport,
    } = req.body;

    const newResult = new MemoryGameResult({
      user: userId,
      gameType: gameType || "Visual Memory Card Assessment",
      levelReached,
      totalMoves,
      mismatches,
      accuracy,
      timeTakenSec,
      analysisReport,
    });

    const savedDoc = await newResult.save();
    console.log("✅ Saved Memory Game to DB ID:", savedDoc._id);

    return res.status(201).json({
      success: true,
      message: "Memory Game result saved successfully!",
      data: savedDoc,
    });
  } catch (error) {
    console.error("❌ Error saving Memory game:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to save Memory game result",
      error: error.message,
    });
  }
};