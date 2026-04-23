
// routes/dashboard.js
const express = require('express');
const router = express.Router();
const adminVerify = require('../middlewares/adminVerify');
const Category = require('../models/Category');
const Article = require('../models/Article');
const Author = require('../models/Author');
const Activity = require('../models/Activity');

// GET /api/admin/stats
router.get('/stats', adminVerify, async (req, res) => {
  try {
    const [categoriesCount, articlesCount, authorsCount, recentActivities] = await Promise.all([
      Category.countDocuments(),
      Article.countDocuments(),
      Author.countDocuments(),
      Activity.find().sort({ createdAt: -1 }).limit(20),
    ]);
    res.json({ categoriesCount, articlesCount, authorsCount, recentActivities });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/activities  — clear all activity log entries
router.delete('/activities', adminVerify, async (req, res) => {
  try {
    await Activity.deleteMany({});
    res.json({ message: 'Activity log cleared.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;