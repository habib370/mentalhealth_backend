// backend/controllers/mentalHealthController.js
const MentalHealthRecord = require("../models/MentalHealthRecord");
const AnalyticsService = require("../services/AnalyticsService");

/**
 * Submit a new daily activity record
 */
exports.submitRecord = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const body = req.body;

    // Validate essential required fields
    const requiredFields = ['bedtime', 'wakeTime', 'classCount', 'socialInteractionQuality', 'physicalActivityType', 'nonAcademicScreenTime'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    // 1. Calculate Sleep Hours automatically
    const sleepHours = AnalyticsService.calculateSleepHours(body.bedtime, body.wakeTime);

    // 2. Calculate Academic Focus Percentage
    const academicFocusPercentage = AnalyticsService.calculateAcademicFocus(body.classCount, body.classDetails);

    // 3. Calculate Lab Focus Percentage
    const labFocusPercentage = AnalyticsService.calculateLabFocus(body.attendedLab, body.labFocusedMinutes);

    // Assemble Record Object
    const recordData = {
      userId,
      ...body,
      sleepHours,
      academicFocusPercentage,
      labFocusPercentage
    };

    // 4. Compute Overall Wellness Score
    recordData.wellnessScore = AnalyticsService.calculateWellnessScore(recordData);

    // Save New Record
    const record = new MentalHealthRecord(recordData);
    await record.save();

    // 5. Get Previous Day's Record for Comparison
    const previousRecord = await MentalHealthRecord.findOne({
      userId,
      _id: { $ne: record._id }
    }).sort({ submittedAt: -1, createdAt: -1 });

    // Generate comparison analytics & recommendations
    const analytics = AnalyticsService.compareRecords(record, previousRecord);
    const recommendations = AnalyticsService.generateRecommendations(record);

    res.status(201).json({
      success: true,
      message: 'Daily activity record saved successfully',
      data: {
        record,
        analytics,
        recommendations,
        wellnessScore: record.wellnessScore
      }
    });

  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save daily record',
      error: error.message
    });
  }
};

/**
 * Get all records with analytics
 */
exports.getRecords = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { limit = 20, page = 1 } = req.query;

    const records = await MentalHealthRecord.find({ userId })
      .sort({ submittedAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await MentalHealthRecord.countDocuments({ userId });

    const allRecords = await MentalHealthRecord.find({ userId }).sort({ submittedAt: 1, createdAt: 1 });
    const trends = AnalyticsService.calculateTrends(allRecords);

    const latestRecord = records[0];
    let comparison = null;

    if (latestRecord && records.length > 1) {
      const previousRecord = records[1];
      comparison = {
        latest: latestRecord,
        previous: previousRecord,
        analytics: AnalyticsService.compareRecords(latestRecord, previousRecord)
      };
    }

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        trends,
        comparison,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Records fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch records'
    });
  }
};

/**
 * Get single record by ID
 */
exports.getRecordById = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const recordId = req.params.id;

    const record = await MentalHealthRecord.findOne({
      _id: recordId,
      userId
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    const previousRecord = await MentalHealthRecord.findOne({
      userId,
      submittedAt: { $lt: record.submittedAt || record.createdAt }
    }).sort({ submittedAt: -1, createdAt: -1 });

    const analytics = AnalyticsService.compareRecords(record, previousRecord);
    const recommendations = AnalyticsService.generateRecommendations(record);

    res.json({
      success: true,
      data: {
        record,
        analytics,
        recommendations,
        wellnessScore: AnalyticsService.calculateWellnessScore(record)
      }
    });
  } catch (error) {
    console.error('Record fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch record'
    });
  }
};

/**
 * Get analytics summary
 */
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const records = await MentalHealthRecord.find({ userId }).sort({ submittedAt: -1, createdAt: -1 });

    if (records.length === 0) {
      return res.json({
        success: true,
        data: {
          hasData: false,
          message: 'No records found. Start your first check-in!'
        }
      });
    }

    const latest = records[0];
    const totalRecords = records.length;
    const wellnessScores = records.map(r => AnalyticsService.calculateWellnessScore(r));
    const averageWellness = Math.round(wellnessScores.reduce((a, b) => a + b, 0) / wellnessScores.length);

    const trends = AnalyticsService.calculateTrends(records);
    const recommendations = AnalyticsService.generateRecommendations(latest);

    res.json({
      success: true,
      data: {
        hasData: true,
        totalRecords,
        latest,
        averageWellness,
        trends,
        recommendations: recommendations.slice(0, 5),
        wellnessScore: AnalyticsService.calculateWellnessScore(latest)
      }
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics summary'
    });
  }
};

/**
 * Delete a record
 */
exports.deleteRecord = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const recordId = req.params.id;

    const record = await MentalHealthRecord.findOneAndDelete({
      _id: recordId,
      userId
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete record'
    });
  }
};