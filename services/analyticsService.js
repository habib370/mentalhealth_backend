// backend/services/AnalyticsService.js

class AnalyticsService {
  /**
   * Calculate sleep hours automatically from bedtime and wakeTime (HH:mm)
   */
  static calculateSleepHours(bedtime, wakeTime) {
    if (!bedtime || !wakeTime) return 7; // Safe default

    try {
      const today = new Date().toISOString().split("T")[0];
      const bedDate = new Date(`${today}T${bedtime}:00`);
      let wakeDate = new Date(`${today}T${wakeTime}:00`);

      if (isNaN(bedDate.getTime()) || isNaN(wakeDate.getTime())) return 7;

      // Handle overnight crossover (e.g. bedtime 23:30, wake 07:30)
      if (wakeDate <= bedDate) {
        wakeDate.setDate(wakeDate.getDate() + 1);
      }

      const diffInMs = wakeDate - bedDate;
      const hours = diffInMs / (1000 * 60 * 60);
      return parseFloat(hours.toFixed(1));
    } catch (err) {
      return 7;
    }
  }

  /**
   * Calculate Academic Focus Percentage from class details
   */
  static calculateAcademicFocus(classCount, classDetails) {
    if (!classCount || classCount === 0 || !Array.isArray(classDetails) || classDetails.length === 0) {
      return 100;
    }

    let totalFocus = 0;
    let validClasses = 0;

    for (const cls of classDetails) {
      if (cls && typeof cls.focusPercentage === "number") {
        totalFocus += cls.focusPercentage;
        validClasses++;
      }
    }

    return validClasses > 0 ? Math.round(totalFocus / validClasses) : 80;
  }

  /**
   * Calculate Lab Focus Percentage
   */
  static calculateLabFocus(attendedLab, labFocusedMinutes) {
    if (!attendedLab) return 0;
    const mins = Number(labFocusedMinutes) || 0;
    // Standard 120-minute lab calculation
    return Math.min(100, Math.round((mins / 120) * 100));
  }

  /**
   * Calculate overall wellness score (0-100) safely
   */
  static calculateWellnessScore(record) {
    // 1. Sleep score (7-8 hours is 100%)
    const sleepHours = record.sleepHours ?? 7;
    const sleepScore = Math.min(100, (sleepHours / 8) * 100);

    // 2. Academic Focus
    const academicFocus = record.academicFocusPercentage ?? 75;

    // 3. Activity Score
    const activityMap = {
      'None': 20,
      'No physical activity': 20,
      'Light walking': 60,
      'Walking': 60,
      'Moderate exercise': 85,
      'Gym': 90,
      'Sports': 95,
      'Intense workout': 100
    };
    const activityScore = activityMap[record.physicalActivityType || record.physicalActivity] || 50;

    // 4. Social Interaction Score
    const socialMap = {
      'Positive & Engaging': 95,
      'Neutral': 70,
      'Isolated / Minimal': 30,
      'Stressful': 20
    };
    const socialScore = socialMap[record.socialInteractionQuality] || (record.socialInteraction ? (record.socialInteraction / 10) * 100 : 70);

    // 5. Non-Academic Screen Time Score
    const screenMap = {
      'Less than 1 hour': 100,
      '1 – 2 hours': 85,
      '1 - 2 hours': 85,
      '2 – 4 hours': 60,
      '2 - 4 hours': 60,
      '4+ hours': 35
    };
    const screenScore = screenMap[record.nonAcademicScreenTime] || 70;

    // Weighted average
    const totalScore = (
      sleepScore * 0.25 +
      academicFocus * 0.25 +
      activityScore * 0.20 +
      socialScore * 0.15 +
      screenScore * 0.15
    );

    return Math.min(100, Math.max(0, Math.round(totalScore)));
  }

  /**
   * Compare current record with previous record
   */
  static compareRecords(current, previous) {
    if (!previous) {
      return {
        isFirst: true,
        wellnessScore: this.calculateWellnessScore(current),
        previousWellnessScore: null,
        improvement: 0,
        improvementPercentage: 0
      };
    }

    const currentScore = this.calculateWellnessScore(current);
    const previousScore = this.calculateWellnessScore(previous);

    return {
      wellnessScore: currentScore,
      previousWellnessScore: previousScore,
      improvement: currentScore - previousScore,
      improvementPercentage: previousScore > 0 ? Math.round(((currentScore - previousScore) / previousScore) * 100) : 0
    };
  }

  /**
   * Generate recommendations safely
   */
  static generateRecommendations(record) {
    const recommendations = [];

    if (record.sleepHours < 6) {
      recommendations.push({
        category: 'Sleep Hygiene',
        severity: 'high',
        icon: '😴',
        title: 'Insufficient Sleep',
        description: 'Aim for 7-8 hours of quality sleep to maintain high focus levels.',
        action: 'Avoid screens 1 hour before bed.'
      });
    }

    if (record.academicFocusPercentage < 60) {
      recommendations.push({
        category: 'Academic Focus',
        severity: 'high',
        icon: '📚',
        title: 'Low Focus in Classes',
        description: 'Try sitting in the front row and taking active handwritten notes.',
        action: 'Use the Pomodoro method for study blocks.'
      });
    }

    if (record.physicalActivityType === 'None' || record.physicalActivityType === 'No physical activity') {
      recommendations.push({
        category: 'Physical Health',
        severity: 'medium',
        icon: '🏃',
        title: 'Limited Physical Activity',
        description: 'Light exercise significantly boosts mental clarity and energy.',
        action: 'Take a 15-minute brisk walk today.'
      });
    }

    return recommendations;
  }

  /**
   * Calculate trends from multiple records
   */
  static calculateTrends(records) {
    if (!records || records.length < 2) {
      return { trend: 'insufficient_data', message: 'Need at least 2 records for trend analysis' };
    }

    const sortedRecords = [...records].sort((a, b) => new Date(a.submittedAt || a.createdAt) - new Date(b.submittedAt || b.createdAt));
    const recent = sortedRecords.slice(-7);

    return {
      wellnessScore: this.extractNumericTrend(recent, null, (r) => this.calculateWellnessScore(r)),
      sleepHours: this.extractNumericTrend(recent, 'sleepHours'),
      academicFocusPercentage: this.extractNumericTrend(recent, 'academicFocusPercentage')
    };
  }

  static extractNumericTrend(records, field, converter = null) {
    const values = records.map(record => {
      if (converter) return converter(record);
      return record[field] || 0;
    });

    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;

    return {
      values,
      first,
      last,
      change,
      direction: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable'
    };
  }
}

module.exports = AnalyticsService;