const Workout = require('../models/Workout');

// Calorie estimate factors based on MET (Metabolic Equivalent of Task)
// Squats: ~5 kcal/min, Push-ups: ~7 kcal/min, Bicep Curls: ~4 kcal/min
const estimateCalories = (exercise, durationSeconds, reps) => {
  const minutes = durationSeconds / 60;
  let caloriesPerRep = 0.32;
  if (exercise === 'squat') caloriesPerRep = 0.45;
  if (exercise === 'pushup') caloriesPerRep = 0.50;
  if (exercise === 'bicep_curl') caloriesPerRep = 0.28;

  const repBased = reps * caloriesPerRep;
  const timeBased = minutes * 5;
  return Math.round((repBased * 0.7 + timeBased * 0.3) * 10) / 10;
};

// @desc    Record completed workout
// @route   POST /api/workouts
// @access  Private
exports.createWorkout = async (req, res, next) => {
  try {
    const {
      exercise,
      reps,
      duration,
      formScore,
      feedback,
      repDetails,
      startedAt,
      completedAt,
    } = req.body;

    if (!exercise || reps === undefined || duration === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exercise, reps count, and duration in seconds',
      });
    }

    const calculatedCalories = estimateCalories(exercise, duration, reps);

    const workout = await Workout.create({
      userId: req.user.id,
      exercise,
      reps: Number(reps),
      duration: Number(duration),
      formScore: formScore !== undefined ? Math.min(100, Math.max(0, Number(formScore))) : 80,
      feedback: Array.isArray(feedback) ? feedback : [],
      caloriesBurned: calculatedCalories,
      repDetails: Array.isArray(repDetails) ? repDetails : [],
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: completedAt ? new Date(completedAt) : new Date(),
    });

    res.status(201).json({
      success: true,
      workout,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user workouts list with pagination and optional exercise filter
// @route   GET /api/workouts
// @access  Private
exports.getWorkouts = async (req, res, next) => {
  try {
    const { exercise, limit = 20, page = 1 } = req.query;
    const query = { userId: req.user.id };

    if (exercise && ['squat', 'bicep_curl', 'pushup'].includes(exercise)) {
      query.exercise = exercise;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Workout.countDocuments(query);
    const workouts = await Workout.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: workouts.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      workouts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single workout by ID
// @route   GET /api/workouts/:id
// @access  Private
exports.getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    res.status(200).json({
      success: true,
      workout,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workout session removed successfully',
    });
  } catch (err) {
    next(err);
  }
};
