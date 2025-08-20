const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Progress = require('../models/Progress');
const Habit = require('../models/Habit');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/progress
// @desc    Get progress entries with filtering and pagination
// @access  Private
router.get('/', [
  auth,
  query('habit').optional().isMongoId(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('completed').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      habit,
      startDate,
      endDate,
      completed,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    
    if (habit) filter.habit = habit;
    if (startDate) filter.date = { $gte: new Date(startDate) };
    if (endDate) {
      if (filter.date) {
        filter.date.$lte = new Date(endDate);
      } else {
        filter.date = { $lte: new Date(endDate) };
      }
    }
    if (completed !== undefined) filter.completed = completed;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get progress with pagination
    const progress = await Progress.find(filter)
      .populate('habit', 'name category color icon')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Progress.countDocuments(filter);

    res.json({
      progress,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEntries: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error getting progress' });
  }
});

// @route   GET /api/progress/calendar
// @desc    Get progress data for calendar view
// @access  Private
router.get('/calendar', [
  auth,
  query('year').isInt({ min: 2020, max: 2030 }),
  query('month').isInt({ min: 1, max: 12 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { year, month } = req.query;
    
    // Calculate date range for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    // Get all progress entries for the month
    const progress = await Progress.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('habit', 'name category color icon');

    // Get all user habits for reference
    const habits = await Habit.find({ user: req.user._id, isActive: true });

    // Create calendar data structure
    const calendarData = [];
    const daysInMonth = endDate.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(parseInt(year), parseInt(month) - 1, day);
      const dayProgress = progress.filter(p => 
        p.date.toDateString() === currentDate.toDateString()
      );

      calendarData.push({
        date: currentDate.toISOString().split('T')[0],
        dayOfWeek: currentDate.getDay(),
        progress: dayProgress.map(p => ({
          habitId: p.habit._id,
          habitName: p.habit.name,
          category: p.habit.category,
          color: p.habit.color,
          icon: p.habit.icon,
          completed: p.completed,
          value: p.value,
          notes: p.notes,
          mood: p.mood
        })),
        totalHabits: habits.length,
        completedHabits: dayProgress.filter(p => p.completed).length,
        completionRate: habits.length > 0 ? 
          (dayProgress.filter(p => p.completed).length / habits.length) * 100 : 0
      });
    }

    res.json({
      year: parseInt(year),
      month: parseInt(month),
      calendarData,
      summary: {
        totalDays: daysInMonth,
        averageCompletionRate: calendarData.reduce((sum, day) => sum + day.completionRate, 0) / daysInMonth,
        totalProgressEntries: progress.length
      }
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ message: 'Server error getting calendar data' });
  }
});

// @route   GET /api/progress/:id
// @desc    Get a specific progress entry
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('habit', 'name category color icon target unit');

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    res.json({ progress });
  } catch (error) {
    console.error('Get progress entry error:', error);
    res.status(500).json({ message: 'Server error getting progress entry' });
  }
});

// @route   POST /api/progress
// @desc    Create or update progress for a specific date
// @access  Private
router.post('/', [
  auth,
  body('habit')
    .isMongoId()
    .withMessage('Valid habit ID is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('completed')
    .isBoolean()
    .withMessage('Completed status is required'),
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Value must be a non-negative number'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('mood')
    .optional()
    .isIn(['excellent', 'good', 'okay', 'bad', 'terrible']),
  body('difficulty')
    .optional()
    .isIn(['very-easy', 'easy', 'moderate', 'hard', 'very-hard']),
  body('timeSpent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Time spent must be a non-negative number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { habit, date, ...progressData } = req.body;

    // Verify the habit belongs to the user
    const habitDoc = await Habit.findOne({
      _id: habit,
      user: req.user._id
    });

    if (!habitDoc) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Check if progress already exists for this date and habit
    let progress = await Progress.findOne({
      user: req.user._id,
      habit,
      date: new Date(date)
    });

    if (progress) {
      // Update existing progress
      Object.assign(progress, progressData);
      await progress.save();
      
      res.json({
        message: 'Progress updated successfully',
        progress
      });
    } else {
      // Create new progress
      progress = new Progress({
        user: req.user._id,
        habit,
        date: new Date(date),
        ...progressData
      });
      
      await progress.save();
      
      res.status(201).json({
        message: 'Progress created successfully',
        progress
      });
    }
  } catch (error) {
    console.error('Create/update progress error:', error);
    res.status(500).json({ message: 'Server error creating/updating progress' });
  }
});

// @route   PUT /api/progress/:id
// @desc    Update a progress entry
// @access  Private
router.put('/:id', [
  auth,
  body('completed')
    .optional()
    .isBoolean(),
  body('value')
    .optional()
    .isFloat({ min: 0 }),
  body('notes')
    .optional()
    .isLength({ max: 500 }),
  body('mood')
    .optional()
    .isIn(['excellent', 'good', 'okay', 'bad', 'terrible']),
  body('difficulty')
    .optional()
    .isIn(['very-easy', 'easy', 'moderate', 'hard', 'very-hard']),
  body('timeSpent')
    .optional()
    .isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const progress = await Progress.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('habit', 'name category color icon');

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    res.json({
      message: 'Progress updated successfully',
      progress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error updating progress' });
  }
});

// @route   DELETE /api/progress/:id
// @desc    Delete a progress entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    res.json({ message: 'Progress entry deleted successfully' });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({ message: 'Server error deleting progress entry' });
  }
});

// @route   GET /api/progress/stats/summary
// @desc    Get progress statistics summary
// @access  Private
router.get('/stats/summary', [
  auth,
  query('days').optional().isInt({ min: 1, max: 365 })
], async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const progress = await Progress.find({
      user: req.user._id,
      date: { $gte: startDate }
    }).populate('habit', 'name category');

    const habits = await Habit.find({ user: req.user._id, isActive: true });

    // Calculate statistics
    const totalEntries = progress.length;
    const completedEntries = progress.filter(p => p.completed).length;
    const completionRate = totalEntries > 0 ? (completedEntries / totalEntries) * 100 : 0;

    // Category breakdown
    const categoryStats = {};
    habits.forEach(habit => {
      categoryStats[habit.category] = {
        total: 0,
        completed: 0,
        completionRate: 0
      };
    });

    progress.forEach(entry => {
      const category = entry.habit.category;
      if (categoryStats[category]) {
        categoryStats[category].total++;
        if (entry.completed) {
          categoryStats[category].completed++;
        }
      }
    });

    // Calculate completion rates for each category
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    });

    // Streak information
    const streakData = await Progress.aggregate([
      { $match: { user: req.user._id, completed: true } },
      { $sort: { date: -1 } },
      { $group: { _id: '$habit', lastCompleted: { $first: '$date' } } }
    ]);

    res.json({
      period: `${days} days`,
      totalEntries,
      completedEntries,
      completionRate: Math.round(completionRate * 100) / 100,
      categoryStats,
      activeHabits: habits.length,
      streakData
    });
  } catch (error) {
    console.error('Get stats summary error:', error);
    res.status(500).json({ message: 'Server error getting statistics summary' });
  }
});

module.exports = router;
