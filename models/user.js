const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Step 1: Account Credentials
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },

    // Step 2: Personal Information
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    city: {
      type: String,
    },
    religion: {
      type: String,
      enum: ["Islam", "Hindu", "Buddhist", "Christian", "Others"],
    },
    relationshipStatus: {
      type: String,
      enum: ["Single", "In a relationship", "Married", "Prefer not to say"],
    },
    phone: {
      type: String,
    },
    bloodGroup: {
      type: String,
    },
    emergencyContact: {
      type: String,
    },

    // Step 3: Academic Information
    studentId: {
      type: String,
    },
    department: {
      type: String,
      enum: [
        "Civil Engineering",
        "Electrical & Electronic Engineering",
        "Mechanical Engineering",
        "Computer Science & Engineering",
        "Urban And Regional Planning",
        "Petroleum And Mining Engineering",
        "Mechatronics & Industrial Engineering",
        "Materials And Metallurgical Engineering",
        "Electronics & Telecommunication Engineering",
        "Biomedical Engineering",
        "Architecture",
        "Other",
      ],
    },
    batch: {
      type: String,
    },
    course: {
      type: String,
      enum: ["BSc", "MSc", "PhD", "Other"],
    },
    level: {
      type: String,
      enum: ["1", "2", "3", "4"],
    },
    term: {
      type: String,
      enum: ["1", "2"],
    },
    cgpa: {
      type: Number,
    },
    livingSituation: {
      type: String,
      enum: ["University Hall", "With Family", "Hostel", "Renting"],
    },
    partTimeJob: {
      type: String,
      enum: ["Yes", "No"],
    },

    // Step 4: Background / Mental Health Information
    mentalHealthConditions: [
      {
        type: String,
      },
    ],
    receivingTreatment: {
      type: String,
      enum: ["Therapy", "Medication", "Both", "No"],
    },
    talkedWithCounselor: {
      type: String,
      enum: ["Yes", "No"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);