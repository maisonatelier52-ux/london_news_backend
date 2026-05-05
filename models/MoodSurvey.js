// models/MoodSurvey.js
const mongoose = require('mongoose');

const moodOptionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const moodSurveySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD
    headline: { type: String, default: "London is okay right now" },
    updatedText: { type: String, default: "Updated 32 minutes ago" },
    surveyTitle: { type: String, default: "London's Mood Right Now" },
    surveyButtonLabel: { type: String, default: "Take Part in Our Daily Survey" },
    surveySuccessText: { type: String, default: "Thanks for sharing your mood!" },
    options: {
      type: [moodOptionSchema],
      default: [
        { key: "happy", label: "Happy", votes: 0 },
        { key: "sad", label: "Sad", votes: 0 },
        { key: "okay", label: "Can't complain", votes: 0 },
      ],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MoodSurvey', moodSurveySchema);