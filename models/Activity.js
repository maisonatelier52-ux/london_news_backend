// models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  title: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Activity', activitySchema);