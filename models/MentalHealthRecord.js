const mongoose = require("mongoose");

const mentalHealthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // --- Step 1: Sleep & Recovery ---
  bedtime: { type: String, required: true },  // e.g., "23:30"
  wakeTime: { type: String, required: true }, // e.g., "07:30"
  sleepHours: { type: Number, required: true }, // Calculated by backend

  // --- Step 2: Academic Classes ---
  classCount: { type: Number, min: 0, max: 5, required: true },
  classDetails: [{
    classNumber: { type: Number, required: true },
    focusedMinutes: { type: Number, min: 0, max: 45, required: true }
  }],
  academicFocusPercentage: { type: Number, default: 0 },

  // --- Step 3: Lab Activity (2.5 Hours = 150 Mins) ---
  attendedLab: { type: Boolean, default: false },
  labFocusedMinutes: { type: Number, min: 0, max: 150, default: 0 },
  labFocusPercentage: { type: Number, default: 0 },

  // --- Step 4: Co-Curricular Activities ---
  coCurricularActivities: [{
    type: String,
    enum: ['None', 'Club Meeting / Event', 'Volunteering', 'Cultural Performance', 'Workshop / Seminar']
  }],

  // --- Step 5: Social Interactions & Trait Assessment ---
  socialInteractionQuality: {
    type: String,
    enum: [
      'Positive & Collaborative',
      'Neutral / Routine',
      'Draining / Conflict',
      'Minimal / No Interaction'
    ],
    required: true
  },

  // --- Step 6: Physical Activity ---
  physicalActivityType: {
    type: String,
    enum: ['None', 'Gym Workout', 'Walking', 'Sports / Fitness'],
    required: true
  },
  physicalActivityDuration: {
    type: String,
    enum: ['None', 'Less than 30 mins', '30-60 mins', '60+ mins'],
    default: 'None'
  },

  // --- Step 7: Non-Academic Screen Time ---
  nonAcademicScreenTime: {
    type: String,
    enum: ['Less than 1 hour', '1 – 2 hours', '2 – 4 hours', '4+ hours'],
    required: true
  },

  // --- Step 8: Skill Development ---
  engagedInSkillDev: { type: Boolean, default: false },
  skillDevTimeHours: { type: Number, min: 0, max: 24, default: 0 },

  // --- Step 9: Tomorrow's Lookahead ---
  tomorrowPlan: {
    academicCommitments: [{
      type: String,
      enum: ['None', 'Class Test / Quiz', 'Lab Report / Viva', 'Major Exam', 'Assignment Deadline']
    }],
    coCurricularActivities: [{
      type: String,
      enum: ['None', 'Club Meeting / Event', 'Workshop / Seminar', 'Volunteering']
    }]
  },

  // Overall Calculated Score
  wellnessScore: { type: Number, min: 0, max: 100, default: 50 },

  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

mentalHealthRecordSchema.index({ userId: 1, submittedAt: -1 });

module.exports = mongoose.model("MentalHealthRecord", mentalHealthRecordSchema);