const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  duration: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Ongoing','Paused', 'Completed'], default: 'Pending' },
  logs: [
    {
      action: { type: String, enum: ['Start', 'Pause', 'Resume', 'End'] },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Activity', activitySchema);
