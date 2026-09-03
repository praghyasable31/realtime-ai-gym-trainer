const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const User = require('../models/User');

// @desc    Get aggregated dashboard stats for current user
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Overall Aggregation
    const overallStats = await Workout.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          totalReps: { $sum: '$reps' },
          totalDuration: { $sum: '$duration' }, // in seconds
          totalCalories: { $sum: '$caloriesBurned' },
          avgFormScore: { $avg: '$formScore' },
        },
      },
    ]);

    const stats = overallStats[0] || {
      totalWorkouts: 0,
      totalReps: 0,
      totalDuration: 0,
      totalCalories: 0,
      avgFormScore: 0,
    };

    // 2. Exercise Breakdown
    const exerciseBreakdown = await Workout.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$exercise',
          workoutsCount: { $sum: 1 },
          totalReps: { $sum: '$reps' },
          avgFormScore: { $avg: '$formScore' },
          maxRepsInSession: { $max: '$reps' },
        },
      },
    ]);

    // 3. Last 7 Days Activity for Charts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyActivity = await Workout.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          reps: { $sum: '$reps' },
          workouts: { $sum: 1 },
          duration: { $sum: '$duration' },
          avgFormScore: { $avg: '$formScore' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format all last 7 days even if 0
    const last7DaysMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      last7DaysMap[dateKey] = {
        date: dateKey,
        day: dayName,
        reps: 0,
        workouts: 0,
        minutes: 0,
        formScore: 0,
      };
    }

    dailyActivity.forEach((item) => {
      if (last7DaysMap[item._id]) {
        last7DaysMap[item._id].reps = item.reps;
        last7DaysMap[item._id].workouts = item.workouts;
        last7DaysMap[item._id].minutes = Math.round(item.duration / 60);
        last7DaysMap[item._id].formScore = Math.round(item.avgFormScore);
      }
    });

    const chartData = Object.values(last7DaysMap);

    // 4. Personal Bests
    const personalRecords = {
      squat: 0,
      bicep_curl: 0,
      pushup: 0,
    };
    exerciseBreakdown.forEach((item) => {
      if (personalRecords.hasOwnProperty(item._id)) {
        personalRecords[item._id] = item.maxRepsInSession;
      }
    });

    // 5. Recent 5 Workouts
    const recentWorkouts = await Workout.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. User Streak Calculation
    // Find all distinct dates user worked out
    const activeDates = await Workout.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    let streak = 0;
    const dateList = activeDates.map((a) => a._id);
    let checkDate = new Date();
    const todayStr = checkDate.toISOString().split('T')[0];
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split('T')[0];

    // If worked out today or yesterday, streak is alive
    if (dateList.includes(todayStr) || dateList.includes(yesterdayStr)) {
      let currentCheck = dateList.includes(todayStr) ? new Date() : checkDate;
      while (true) {
        const cStr = currentCheck.toISOString().split('T')[0];
        if (dateList.includes(cStr)) {
          streak++;
          currentCheck.setDate(currentCheck.getDate() - 1);
        } else {
          break;
        }
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        totalWorkouts: stats.totalWorkouts,
        totalReps: stats.totalReps,
        totalMinutes: Math.round((stats.totalDuration || 0) / 60),
        totalCalories: Math.round(stats.totalCalories || 0),
        avgFormScore: Math.round(stats.avgFormScore || 0),
        streakDays: streak,
        personalRecords,
        exerciseBreakdown,
        chartData,
        recentWorkouts,
      },
    });
  } catch (err) {
    next(err);
  }
};
