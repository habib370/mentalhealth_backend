const ReflexTest = require("../../models/gameModels/ReflexTest");

// Save a new Reflex Test score
exports.saveReflexTest = async (req, res) => {
  try {
    const {
      bestReactionTimeMs,
      avgReactionTimeMs,
      fatigueSlope,
      falseStarts,
      trialTimesMs,
    } = req.body;

    const newRecord = new ReflexTest({
      user: req.user._id || req.user.id,
      bestReactionTimeMs,
      avgReactionTimeMs,
      fatigueSlope,
      falseStarts,
      trialTimesMs,
    });

    await newRecord.save();

    res.status(201).json({
      success: true,
      message: "Reflex test result saved successfully",
      data: newRecord,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch user's reflex test history
exports.getReflexHistory = async (req, res) => {
  try {
    const history = await ReflexTest.find({ user: req.user._id || req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};