const mongoose = require("mongoose");

const emotionInsightSchema = new mongoose.Schema(
  {
    questionId: { type: Number, required: true },
    qKey: { type: String, required: true },
    category: { type: String, required: true },
    selectedKey: { type: String, required: true },
    selectedLabel: { type: String, required: true },
    interpretation: { type: String, required: true }
  },
  { _id: false }
);

const emotionGameSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    gameType: {
      type: String,
      default: "Psychiatric & Projective Assessment"
    },
    timeTakenSec: {
      type: Number,
      required: true
    },
    // Granular Key-Value pairs for analytics queries and SQL/NoSQL filters
    responses: {
      q1_visual_projection: { type: String, required: true },
      q2_color_preference: { type: String, required: true },
      q3_life_stage_anchor: { type: String, required: true },
      q4_auditory_bias_1: { type: String, required: true },
      q5_relaxation_strategy: { type: String, required: true },
      q6_hedonic_energy: { type: String, required: true },
      q7_auditory_bias_2: { type: String, required: true },
      q8_stress_coping: { type: String, required: true },
      q9_aspirational_need: { type: String, required: true },
      q10_completion_barrier: { type: String, required: true }
    },
    // Array of full human-readable texts for quick UI history rendering
    insights: [emotionInsightSchema]
  },
  {
    timestamps: true
  }
);

// Compound index for querying user history ordered by date
emotionGameSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("EmotionGame", emotionGameSchema);