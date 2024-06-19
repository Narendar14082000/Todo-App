const Activity = require('../models/Activity');

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createActivity = async (req, res) => {
  const { name } = req.body;

  try {
    const activity = await Activity.create({
      userId: req.user.id,
      name,
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateActivity = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  try {
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (action === 'start') {
      activity.status = 'Ongoing';
      activity.logs.push({ action: 'Start' });
    } else if (action === 'pause') {
      activity.status = 'Paused';
      activity.logs.push({ action: 'Resume' });
    } else if (action === 'resume') {
      activity.status = 'Ongoing';
      activity.logs.push({ action: 'Pause' });
    } else if (action === 'end') {
      activity.status = 'Completed';
      activity.logs.push({ action: 'End' });
    }

    await activity.save();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await Activity.findByIdAndDelete(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};