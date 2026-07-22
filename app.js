// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
}));

// Routes
const authRoutes = require("./routes/authRoutes");
const mentalHealthRoutes = require("./routes/mentalHealthRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/mentalhealth", mentalHealthRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong!"
    });
});

// Connect to MongoDB - FIXED: Removed deprecated options
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 API endpoints:`);
        console.log(`   - POST   /api/auth/signup`);
        console.log(`   - POST   /api/auth/login`);
        console.log(`   - POST   /api/auth/logout`);
        console.log(`   - GET    /api/auth/me`);
        console.log(`   - POST   /api/mentalhealth/submit`);
        console.log(`   - GET    /api/mentalhealth/records`);
        console.log(`   - GET    /api/mentalhealth/analytics/summary`);
        console.log(`   - GET    /api/mentalhealth/record/:id`);
    });
})
.catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
});