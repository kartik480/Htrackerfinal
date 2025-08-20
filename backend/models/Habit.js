const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other'],
    default: 'other'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  target: {
    type: Number,
    default: 1,
    min: [1, 'Target must be at least 1']
  },
  unit: {
    type: String,
    default: 'times',
    trim: true
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  icon: {
    type: String,
    default: '📝'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  // Enhanced reminder system
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: String, // HH:MM format
      default: '09:00'
    },
    endTime: {
      type: String, // HH:MM format
      default: '21:00'
    },
    frequency: {
      type: String,
      enum: ['once', 'hourly', 'every-2-hours', 'every-4-hours'],
      default: 'once'
    },
    message: {
      type: String,
      default: 'Time to work on your habit!',
      maxlength: [200, 'Reminder message cannot exceed 200 characters']
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
habitSchema.index({ user: 1, isActive: 1 });
habitSchema.index({ user: 1, category: 1 });
habitSchema.index({ user: 1, startDate: -1 });
habitSchema.index({ user: 1, 'reminder.enabled': 1 });

module.exports = mongoose.model('Habit', habitSchema);
