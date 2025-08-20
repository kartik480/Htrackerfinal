const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        // Ensure progress cannot be marked for future dates
        return value <= new Date();
      },
      message: 'Progress cannot be marked for future dates'
    }
  },
  completed: {
    type: Boolean,
    default: false
  },
  value: {
    type: Number,
    default: 0,
    min: [0, 'Value cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'okay', 'bad', 'terrible'],
    default: 'okay'
  },
  difficulty: {
    type: String,
    enum: ['very-easy', 'easy', 'moderate', 'hard', 'very-hard'],
    default: 'moderate'
  },
  timeSpent: {
    type: Number, // in minutes
    min: [0, 'Time spent cannot be negative']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  weather: {
    type: String,
    trim: true,
    maxlength: [50, 'Weather cannot exceed 50 characters']
  },
  attachments: [{
    type: String, // URLs to uploaded files/images
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }]
}, {
  timestamps: true
});

// Compound index to ensure one progress entry per habit per day per user
progressSchema.index({ user: 1, habit: 1, date: 1 }, { unique: true });

// Index for efficient queries
progressSchema.index({ user: 1, date: -1 });
progressSchema.index({ habit: 1, date: -1 });
progressSchema.index({ user: 1, completed: 1 });

// Virtual for formatted date
progressSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Virtual for day of week
progressSchema.virtual('dayOfWeek').get(function() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[this.date.getDay()];
});

// Method to check if progress meets habit target
progressSchema.methods.meetsTarget = function(habitTarget) {
  return this.value >= habitTarget;
};

// Method to get progress percentage
progressSchema.methods.getProgressPercentage = function(habitTarget) {
  if (habitTarget === 0) return 0;
  return Math.min((this.value / habitTarget) * 100, 100);
};

// Pre-save middleware to update habit streak
progressSchema.pre('save', async function(next) {
  if (this.isModified('completed')) {
    try {
      const Habit = require('./Habit');
      const habit = await Habit.findById(this.habit);
      
      if (habit) {
        habit.updateStreak(this.completed);
        await habit.save();
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Progress', progressSchema);
