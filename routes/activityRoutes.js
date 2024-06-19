const express = require('express');
const { getActivities, createActivity, updateActivity, deleteActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getActivities).post(protect, createActivity);
router.route('/:id').put(protect, updateActivity);
router.route('/:id').put(protect, updateActivity).delete(protect, deleteActivity);

module.exports = router;
