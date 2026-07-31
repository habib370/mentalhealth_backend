const mongoose = require("mongoose");

const memoryGameSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameType: {
      type: String,
      default: "Visual Memory Card Assessment",
    },
    levelReached: { type: Number, required: true },
    totalMoves: { type: Number, required: true },
    mismatches: { type: Number, default: 0 },
    accuracy: { type: Number, required: true },
    timeTakenSec: { type: Number, required: true },
    analysisReport: {
      indicator: { type: String, required: true },
      description: { type: String, required: true },
      memoryRating: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MemoryGame", memoryGameSchema);