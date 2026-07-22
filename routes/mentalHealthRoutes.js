const express = require("express");
const router = express.Router();
const controller = require("../controllers/mentalHealthController");
const auth = require("../middleware/authMiddleware");

// All routes are protected
router.use(auth);

// Submit a new record
router.post("/submit", controller.submitRecord);

// Get all records with analytics
router.get("/records", controller.getRecords);

// Get analytics summary
router.get("/analytics/summary", controller.getAnalyticsSummary);

// Get single record
router.get("/record/:id", controller.getRecordById);

// Delete a record
router.delete("/record/:id", controller.deleteRecord);

module.exports = router;