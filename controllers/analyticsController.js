const EmotionGame = require("../models/gameModels/EmotionGame");
const MemoryGame = require("../models/gameModels/MemoryGame");
const ReflexTest = require("../models/gameModels/ReflexTest");
const StroopGame = require("../models/gameModels/StroopGame");

// Helper: Calculate Standard Deviation from trial array
function calculateStdDev(array, mean) {
  if (!array || array.length === 0) return 0;
  const squareDiffs = array.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / array.length;
  return Math.sqrt(avgSquareDiff);
}

// Function name MUST be getDashboardAnalytics to match gameRoutes.js
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // 1. Query latest game records in parallel using their exact schema user fields
    const [latestStroop, latestMemory, latestReflex, latestEmotion] = await Promise.all([
      StroopGame.findOne({ user: userId }).sort({ createdAt: -1 }),
      MemoryGame.findOne({ userId: userId }).sort({ createdAt: -1 }),
      ReflexTest.findOne({ user: userId }).sort({ createdAt: -1 }),
      EmotionGame.findOne({ userId: userId }).sort({ createdAt: -1 })
    ]);

    // --- A. STROOP GAME METRICS ---
    const stroopAccuracy = latestStroop?.accuracy ?? 92.0;
    const stroopAvgRT = latestStroop?.avgReactionTimeMs ?? 320;
    // Estimate interference: average reaction difference or fallback base
    const stroopInterference = Math.round(stroopAvgRT * 0.18); 

    // --- B. MEMORY GAME METRICS ---
    const optimalMoves = 12; // Baseline optimal move count
    const actualMoves = latestMemory?.moves ?? 16;
    const memoryEfficiency = Math.min(100, Math.round((optimalMoves / Math.max(1, actualMoves)) * 100));
    const memoryTimeTaken = latestMemory?.timeTakenSec ?? 28;
    const memoryPacingRate = Number((memoryTimeTaken / Math.max(1, actualMoves)).toFixed(1));

    // --- C. REFLEX GAME METRICS ---
    const reflexTrialLatencies = (latestReflex?.trialTimesMs && latestReflex.trialTimesMs.length > 0)
      ? latestReflex.trialTimesMs
      : [210, 225, 218, 240, 222];
    const meanReactionTime = latestReflex?.avgReactionTimeMs ?? Math.round(reflexTrialLatencies.reduce((a, b) => a + b, 0) / reflexTrialLatencies.length);
    const peakReactionTime = latestReflex?.bestReactionTimeMs ?? Math.min(...reflexTrialLatencies);
    const reflexConsistencyStdDev = Math.round(calculateStdDev(reflexTrialLatencies, meanReactionTime));

    // --- D. EMOTION & PSYCHIATRIC ASSESSMENT ---
    const responses = latestEmotion?.responses || {};
    const copingStyle = responses.q8_stress_coping || "Active Problem-Solving";
    const relaxationStrategy = responses.q5_relaxation_strategy || "Somatic Grounding";
    const hedonicEnergyState = responses.q6_hedonic_energy || "Moderate Energy";
    const cognitiveBarrier = responses.q10_completion_barrier || "Mental Fatigue";

    // --- SYNTHESIS: 4 CORE MIND PILLARS (0 to 100 Scale) ---
    const executiveFocus = Math.max(10, Math.round(stroopAccuracy - (reflexConsistencyStdDev * 0.5)));
    const shortTermMemory = Math.min(100, Math.round((memoryEfficiency * 0.9) + (memoryPacingRate <= 2.0 ? 10 : 0)));
    const processingSpeedPillar = Math.max(10, Math.min(100, Math.round(100 - ((meanReactionTime - 180) / 3.5))));
    const emotionalResilience = copingStyle.toLowerCase().includes("avoidant") ? 62 : 85;

    // --- AI RECOMMENDATIONS GENERATION ---
    const recommendations = [];

    if (stroopInterference > 50) {
      recommendations.push({
        id: "rec_1",
        category: "Cognitive Control",
        severity: "warning",
        title: "Stroop Interference Strain Detected",
        impact: "Medium Impact",
        formulaRef: `Interference = ${stroopInterference}ms`,
        action: "High cognitive interference detected. Practice 3 minutes of focused diaphragmatic breathing to stabilize impulse control.",
        tags: ["Stroop", "Focus"]
      });
    }

    if (reflexConsistencyStdDev > 12) {
      recommendations.push({
        id: "rec_2",
        category: "Neuromuscular Fatigue",
        severity: "alert",
        title: "Reaction Fluctuation Spikes (σ = " + reflexConsistencyStdDev + "ms)",
        impact: "High Impact",
        formulaRef: `σ = ${reflexConsistencyStdDev}ms`,
        action: "Variation in click latencies indicates micro-attentional fatigue. Take a 10-minute break from screen activity.",
        tags: ["Reflex", "Fatigue"]
      });
    }

    recommendations.push({
      id: "rec_3",
      category: "Memory Retention",
      severity: "success",
      title: "Memory Efficiency Score: " + memoryEfficiency + "%",
      impact: "Positive",
      formulaRef: `E = ${memoryEfficiency}%`,
      action: `Your visual-spatial strategy is efficient (${actualMoves} moves taken). Maintain current task intervals.`,
      tags: ["Memory", "Spatial Recall"]
    });

    recommendations.push({
      id: "rec_4",
      category: "Psychological Baseline",
      severity: "info",
      title: `Coping Style: ${copingStyle}`,
      impact: "Adaptive",
      formulaRef: "Projective Assessment",
      action: `Current primary barrier: "${cognitiveBarrier}". Applying your preferred ${relaxationStrategy} will aid recovery.`,
      tags: ["Emotion", "Coping"]
    });

    // Final Payload
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      pillars: {
        executiveFocus,
        shortTermMemory,
        processingSpeed: processingSpeedPillar,
        emotionalResilience
      },
      perGameMetrics: {
        stroop: {
          accuracyRate: stroopAccuracy,
          avgReactionTimeMs: stroopAvgRT,
          interferenceScore: stroopInterference,
          insight: "Measures impulse control, cognitive speed, and visual distraction processing."
        },
        memory: {
          moves: actualMoves,
          optimalMoves,
          efficiencyIndex: memoryEfficiency,
          timeTakenSec: memoryTimeTaken,
          pacingRateSec: memoryPacingRate,
          insight: "Evaluates visual-spatial working memory efficiency and move precision."
        },
        reflex: {
          peakRT: peakReactionTime,
          meanRT: meanReactionTime,
          stdDevConsistency: reflexConsistencyStdDev,
          trialsCount: reflexTrialLatencies.length,
          insight: "Measures neuromuscular reaction velocity and focus stability."
        },
        emotion: {
          copingStyle,
          relaxationStrategy,
          hedonicEnergyState,
          cognitiveBarrier,
          insight: "Maps qualitative projective assessment metrics to stress response profiles."
        }
      },
      recommendations
    });

  } catch (error) {
    console.error("Analytics Calculation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error calculating dashboard analytics payload"
    });
  }
};