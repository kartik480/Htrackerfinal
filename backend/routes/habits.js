const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Habit = require('../models/Habit');
const Progress = require('../models/Progress');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/habits
// @desc    Get all habits for a user with filtering and sorting
// @access  Private
router.get('/', [
  auth,
  query('category').optional().isIn(['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other']),
  query('status').optional().isIn(['active', 'inactive']),
  query('sortBy').optional().isIn(['name', 'createdAt', 'startDate', 'category']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      category,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    
    if (category) filter.category = category;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get habits with pagination
    const habits = await Habit.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username firstName lastName');

    // Get total count for pagination
    const total = await Habit.countDocuments(filter);

    // Get progress data for each habit
    const habitsWithProgress = await Promise.all(
      habits.map(async (habit) => {
        const progress = await Progress.find({ habit: habit._id })
          .sort({ date: -1 })
          .limit(30); // Last 30 days

        const completedCount = progress.filter(p => p.completed).length;
        const completionRate = progress.length > 0 ? (completedCount / progress.length) * 100 : 0;

        return {
          ...habit.toObject(),
          progress: progress.length,
          completionRate: Math.round(completionRate * 100) / 100
        };
      })
    );

    res.json({
      habits: habitsWithProgress,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalHabits: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ message: 'Server error getting habits' });
  }
});

// @route   GET /api/habits/:id
// @desc    Get a specific habit by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'username firstName lastName');

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Get recent progress
    const progress = await Progress.find({ habit: habit._id })
      .sort({ date: -1 })
      .limit(7);

    const habitData = habit.toObject();
    habitData.recentProgress = progress;

    res.json({ habit: habitData });
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({ message: 'Server error getting habit' });
  }
});

// @route   POST /api/habits
// @desc    Create a new habit
// @access  Private
router.post('/', [
  auth,
  body('name')
    .notEmpty()
    .withMessage('Habit name is required')
    .isLength({ max: 100 })
    .withMessage('Habit name cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other']),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly']),
  body('target')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target must be a positive integer'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('reminder.enabled')
    .optional()
    .isBoolean(),
  body('reminder.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Reminder start time must be in HH:MM format'),
  body('reminder.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Reminder end time must be in HH:MM format'),
  body('reminder.frequency')
    .optional()
    .isIn(['once', 'hourly', 'every-2-hours', 'every-4-hours']),
  body('reminder.message')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Reminder message cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const habitData = {
      ...req.body,
      user: req.user._id
    };

    const habit = new Habit(habitData);
    await habit.save();

    res.status(201).json({
      message: 'Habit created successfully',
      habit
    });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ message: 'Server error creating habit' });
  }
});

// @route   PUT /api/habits/:id
// @desc    Update a habit
// @access  Private
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Habit name cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .optional()
    .isIn(['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other']),
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly']),
  body('target')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target must be a positive integer'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  body('reminder.enabled')
    .optional()
    .isBoolean(),
  body('reminder.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Reminder start time must be in HH:MM format'),
  body('reminder.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Reminder end time must be in HH:MM format'),
  body('reminder.frequency')
    .optional()
    .isIn(['once', 'hourly', 'every-2-hours', 'every-4-hours']),
  body('reminder.message')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Reminder message cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({
      message: 'Habit updated successfully',
      habit
    });
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ message: 'Server error updating habit' });
  }
});

// @route   DELETE /api/habits/:id
// @desc    Delete a habit and all associated progress
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Delete all associated progress entries
    await Progress.deleteMany({ habit: habit._id });

    // Delete the habit
    await Habit.findByIdAndDelete(req.params.id);

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ message: 'Server error deleting habit' });
  }
});

// @route   PUT /api/habits/:id/toggle
// @desc    Toggle habit active status
// @access  Private
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    habit.isActive = !habit.isActive;
    await habit.save();

    res.json({
      message: `Habit ${habit.isActive ? 'activated' : 'deactivated'} successfully`,
      habit
    });
  } catch (error) {
    console.error('Toggle habit error:', error);
    res.status(500).json({ message: 'Server error toggling habit' });
  }
});

// @route   GET /api/habits/stats/overview
// @desc    Get overview statistics for user's habits
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const totalHabits = await Habit.countDocuments({ user: req.user._id });
    const activeHabits = await Habit.countDocuments({ user: req.user._id, isActive: true });
    
    const categoryStats = await Habit.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const totalStreak = await Habit.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, totalStreak: { $sum: '$streak.current' } } }
    ]);

    res.json({
      totalHabits,
      activeHabits,
      categoryStats,
      totalStreak: totalStreak[0]?.totalStreak || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error getting statistics' });
  }
});

module.exports = router;
