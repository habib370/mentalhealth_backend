// backend/models/StroopGame.js
const mongoose = require("mongoose");

const stroopGameSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameType: {
      type: String,
      default: "5-Level Stroop Focus Assessment",
    },
    levelReached: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      default: 25,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    avgReactionTimeMs: {
      type: Number,
      required: true,
    },
    // Detailed Categorized Performance
    correctCount: { type: Number, required: true },
    wrongCount: { type: Number, required: true },
    timeoutCount: { type: Number, required: true },
    detailedBreakdown: {
      correctAnswers: [
        { level: Number, questionNum: Number, timeSpentMs: Number },
      ],
      wrongAnswers: [
        { level: Number, questionNum: Number, timeSpentMs: Number },
      ],
      timeouts: [{ level: Number, questionNum: Number }],
    },
    // Analytical Report generated for user
    analysisReport: {
      indicator: { type: String, required: true },
      description: { type: String, required: true },
      stressReactivity: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StroopGame", stroopGameSchema);