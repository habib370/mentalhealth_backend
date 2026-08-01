const mongoose = require("mongoose");

const reflexTestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bestReactionTimeMs: {
      type: Number,
      required: true,
    },
    avgReactionTimeMs: {
      type: Number,
      required: true,
    },
    fatigueSlope: {
      type: Number,
      required: true, // Difference between late trials and early trials in ms
    },
    falseStarts: {
      type: Number,
      default: 0,
    },
    trialTimesMs: [
      {
        type: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReflexTest", reflexTestSchema);