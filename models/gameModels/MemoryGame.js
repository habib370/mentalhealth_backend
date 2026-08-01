const mongoose = require("mongoose");

const memoryGameSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    gameType: {
      type: String,
      default: "Memory Match Test"
    },
    timeTakenSec: {
      type: Number,
      required: true
    },
    moves: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      default: 0
    },
    levelReached: {
      type: Number,
      default: 1
    },
    maxLevels: {
      type: Number,
      default: 2
    },
    completed: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["completed", "ended_early"],
      default: "completed"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("MemoryGame", memoryGameSchema);