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
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: [0, 'Value cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Enhanced completion tracking
  completion: {
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    completedTime: {
      type: String // Store as HH:MM format
    },
    duration: {
      type: Number, // Duration in minutes
      min: [0, 'Duration cannot be negative']
    },
    startTime: {
      type: String // Store as HH:MM format
    },
    endTime: {
      type: String // Store as HH:MM format
    }
  },
  // Mood and difficulty tracking
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
  // Location and context
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
  // Tags for categorization
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
progressSchema.index({ user: 1, 'completion.isCompleted': 1 });
progressSchema.index({ user: 1, 'completion.completedAt': -1 });

// Virtual for formatted date
progressSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Virtual for completion time
progressSchema.virtual('completionTimeFormatted').get(function() {
  if (!this.completion.completedAt) return null;
  return this.completion.completedAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});

// Virtual for duration formatted
progressSchema.virtual('durationFormatted').get(function() {
  if (!this.completion.duration) return null;
  const hours = Math.floor(this.completion.duration / 60);
  const minutes = this.completion.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
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

// Method to mark as completed
progressSchema.methods.markCompleted = function(completionTime = null) {
  const now = completionTime || new Date();
  this.completion.isCompleted = true;
  this.completion.completedAt = now;
  this.completion.completedTime = now.toTimeString().slice(0, 5);
  
  // Calculate duration if start and end times are available
  if (this.completion.startTime && this.completion.endTime) {
    const start = new Date(`2000-01-01T${this.completion.startTime}:00`);
    const end = new Date(`2000-01-01T${this.completion.endTime}:00`);
    const diffMs = end - start;
    this.completion.duration = Math.floor(diffMs / (1000 * 60));
  }
  
  return this;
};

// Method to get completion status with timing
progressSchema.methods.getCompletionStatus = function() {
  if (this.completion.isCompleted) {
    return {
      status: 'completed',
      message: `Completed at ${this.completion.completedTime}`,
      timeAgo: this.getTimeAgo(this.completion.completedAt),
      duration: this.durationFormatted
    };
  }
  
  return {
    status: 'pending',
    message: 'Not completed yet',
    progress: this.value
  };
};

// Helper method to get time ago
progressSchema.methods.getTimeAgo = function(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
};

// Pre-save middleware to update completion status
progressSchema.pre('save', function(next) {
  if (this.isModified('value')) {
    // Auto-mark as completed if value meets target (assuming target is 1 for boolean habits)
    if (this.value > 0) {
      this.completion.isCompleted = true;
      if (!this.completion.completedAt) {
        this.completion.completedAt = new Date();
        this.completion.completedTime = new Date().toTimeString().slice(0, 5);
      }
    }
  }
  next();
});

module.exports = mongoose.model('Progress', progressSchema);
