const EmotionGame = require("../../models/gameModels/EmotionGame");

/**
 * @desc    Submit assessment responses & save analysis
 * @route   POST /api/games/emotion/submit
 * @access  Private
 */
const submitEmotionGame = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { timeTakenSec, responses, insights, gameType } = req.body;

    // Basic Validation
    if (!responses || !insights || timeTakenSec === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: responses, insights, or timeTakenSec."
      });
    }

    // Required response keys check
    const requiredKeys = [
      "q1_visual_projection",
      "q2_color_preference",
      "q3_life_stage_anchor",
      "q4_auditory_bias_1",
      "q5_relaxation_strategy",
      "q6_hedonic_energy",
      "q7_auditory_bias_2",
      "q8_stress_coping",
      "q9_aspirational_need",
      "q10_completion_barrier"
    ];

    const missingKey = requiredKeys.find((key) => !responses[key]);
    if (missingKey) {
      return res.status(400).json({
        success: false,
        message: `Incomplete assessment payload. Missing response key: ${missingKey}`
      });
    }

    const newRecord = await EmotionGame.create({
      userId,
      gameType: gameType || "Psychiatric & Projective Assessment",
      timeTakenSec,
      responses,
      insights
    });

    return res.status(201).json({
      success: true,
      message: "Emotion assessment results saved successfully.",
      data: newRecord
    });
  } catch (error) {
    console.error("Error in submitEmotionGame:", error);
    return res.status(500).json({
      success: false,
      message: "Server error saving assessment result.",
      error: error.message
    });
  }
};

/**
 * @desc    Get user's past assessment history
 * @route   GET /api/games/emotion/history
 * @access  Private
 */
const getEmotionHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const history = await EmotionGame.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error("Error in getEmotionHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching assessment history.",
      error: error.message
    });
  }
};

/**
 * @desc    Get latest assessment result for dashboard/analytics
 * @route   GET /api/games/emotion/latest
 * @access  Private
 */
const getLatestEmotionResult = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const latest = await EmotionGame.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: "No projective assessment record found for this user."
      });
    }

    return res.status(200).json({
      success: true,
      data: latest
    });
  } catch (error) {
    console.error("Error in getLatestEmotionResult:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching latest result.",
      error: error.message
    });
  }
};

module.exports = {
  submitEmotionGame,
  getEmotionHistory,
  getLatestEmotionResult
};