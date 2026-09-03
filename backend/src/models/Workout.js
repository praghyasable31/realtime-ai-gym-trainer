const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    exercise: {
      type: String,
      required: [true, 'Exercise type is required'],
      enum: ['squat', 'bicep_curl', 'pushup'],
    },
    reps: {
      type: Number,
      required: [true, 'Repetition count is required'],
      min: [0, 'Reps cannot be negative'],
      default: 0,
    },
    duration: {
      type: Number, // duration in seconds
      required: [true, 'Duration in seconds is required'],
      default: 0,
    },
    formScore: {
      type: Number, // 0 to 100
      min: 0,
      max: 100,
      default: 80,
    },
    feedback: {
      type: [String],
      default: [],
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    repDetails: [
      {
        repNumber: Number,
        durationSeconds: Number,
        peakAngle: Number,
        formStatus: String, // 'good', 'needs_improvement', 'incomplete'
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user workouts chronologically
workoutSchema.index({ userId: 1, createdAt: -1 });
workoutSchema.index({ userId: 1, exercise: 1 });

module.exports = mongoose.model('Workout', workoutSchema);
