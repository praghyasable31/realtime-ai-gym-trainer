const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate signed JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ai-gym-trainer-super-secret-key-2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with that email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyTargetReps: user.dailyTargetReps,
        preferredVoice: user.preferredVoice,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyTargetReps: user.dailyTargetReps,
        preferredVoice: user.preferredVoice,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me or GET /api/users/profile
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyTargetReps: user.dailyTargetReps,
        preferredVoice: user.preferredVoice,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile settings
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, dailyTargetReps, preferredVoice } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (dailyTargetReps !== undefined) user.dailyTargetReps = dailyTargetReps;
    if (preferredVoice !== undefined) user.preferredVoice = preferredVoice;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dailyTargetReps: user.dailyTargetReps,
        preferredVoice: user.preferredVoice,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
