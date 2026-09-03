const express = require('express');
const {
  createWorkout,
  getWorkouts,
  getWorkoutById,
  deleteWorkout,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createWorkout)
  .get(getWorkouts);

router.route('/:id')
  .get(getWorkoutById)
  .delete(deleteWorkout);

module.exports = router;
