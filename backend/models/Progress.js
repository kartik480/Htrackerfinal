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
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress entry per habit per day per user
progressSchema.index({ user: 1, habit: 1, date: 1 }, { unique: true });

// Index for efficient queries
progressSchema.index({ user: 1, date: -1 });
progressSchema.index({ habit: 1, date: -1 });

// Virtual for formatted date
progressSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
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

module.exports = mongoose.model('Progress', progressSchema);
