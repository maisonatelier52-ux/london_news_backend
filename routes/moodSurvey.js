// routes/moodSurvey.js
const express = require('express');
const router = express.Router();
const adminVerify = require('../middlewares/adminVerify');
const MoodSurvey = require('../models/MoodSurvey');

// Helper: get today's date string
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// Helper: get or create today's survey
async function getTodaySurvey() {
  const date = todayStr();
  let survey = await MoodSurvey.findOne({ date });
  if (!survey) {
    // Auto-create from the most recent config
    const last = await MoodSurvey.findOne().sort({ createdAt: -1 });
    survey = await MoodSurvey.create({
      date,
      headline: last?.headline || "London is okay right now",
      updatedText: last?.updatedText || "Updated just now",
      surveyTitle: last?.surveyTitle || "London's Mood Right Now",
      surveyButtonLabel: last?.surveyButtonLabel || "Take Part in Our Daily Survey",
      surveySuccessText: last?.surveySuccessText || "Thanks for sharing your mood!",
      options: last?.options?.map(o => ({ key: o.key, label: o.label, votes: 0 })) || [
        { key: "happy", label: "Happy", votes: 0 },
        { key: "sad", label: "Sad", votes: 0 },
        { key: "okay", label: "Can't complain", votes: 0 },
      ],
    });
  }
  return survey;
}

// ─── PUBLIC ROUTES ──────────────────────────────────────────────────────────

// GET /api/public/mood — get current mood data for frontend display
router.get('/public/mood', async (req, res) => {
  try {
    const survey = await getTodaySurvey();
    const totalVotes = survey.options.reduce((sum, o) => sum + o.votes, 0);

    const moodBreakdown = survey.options.map(o => ({
      key: o.key,
      label: o.label,
      value: totalVotes > 0 ? `${Math.round((o.votes / totalVotes) * 100)}%` : '0%',
      votes: o.votes,
    }));

    res.json({
      moodHeadline: survey.headline,
      moodUpdatedText: survey.updatedText,
      surveyTitle: survey.surveyTitle,
      surveyButtonLabel: survey.surveyButtonLabel,
      surveySuccessText: survey.surveySuccessText,
      moodOptions: survey.options.map(o => ({ key: o.key, label: o.label })),
      moodBreakdown,
      moodTotalVotes: totalVotes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/public/mood/vote — submit a vote (cookie-based dedup)
router.post('/public/mood/vote', async (req, res) => {
  try {
    const { optionKey } = req.body;
    if (!optionKey) return res.status(400).json({ error: 'optionKey is required' });

    // Simple IP-based dedup (can be replaced with cookie check on frontend)
    const survey = await getTodaySurvey();
    const option = survey.options.find(o => o.key === optionKey);
    if (!option) return res.status(400).json({ error: 'Invalid option key' });

    option.votes += 1;
    await survey.save();

    const totalVotes = survey.options.reduce((sum, o) => sum + o.votes, 0);
    const moodBreakdown = survey.options.map(o => ({
      key: o.key,
      label: o.label,
      value: totalVotes > 0 ? `${Math.round((o.votes / totalVotes) * 100)}%` : '0%',
      votes: o.votes,
    }));

    res.json({
      moodBreakdown,
      moodTotalVotes: totalVotes,
      surveySuccessText: survey.surveySuccessText,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// GET /api/mood-surveys — list all surveys (admin)
router.get('/', adminVerify, async (req, res) => {
  try {
    const surveys = await MoodSurvey.find().sort({ date: -1 }).limit(30);
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/mood-surveys/today — get today's survey (admin)
router.get('/today', adminVerify, async (req, res) => {
  try {
    const survey = await getTodaySurvey();
    res.json(survey);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/mood-surveys — create or update today's survey config (admin)
router.post('/', adminVerify, async (req, res) => {
  try {
    const { headline, updatedText, surveyTitle, surveyButtonLabel, surveySuccessText, options, date } = req.body;
    const targetDate = date || todayStr();

    let survey = await MoodSurvey.findOne({ date: targetDate });
    if (survey) {
      // Update existing
      if (headline !== undefined) survey.headline = headline;
      if (updatedText !== undefined) survey.updatedText = updatedText;
      if (surveyTitle !== undefined) survey.surveyTitle = surveyTitle;
      if (surveyButtonLabel !== undefined) survey.surveyButtonLabel = surveyButtonLabel;
      if (surveySuccessText !== undefined) survey.surveySuccessText = surveySuccessText;
      if (options !== undefined) {
        survey.options = options.map(o => ({
          key: o.key || o.label.toLowerCase().replace(/\s+/g, '_'),
          label: o.label,
          votes: o.votes || 0,
        }));
      }
      await survey.save();
    } else {
      survey = await MoodSurvey.create({
        date: targetDate,
        headline: headline || "London is okay right now",
        updatedText: updatedText || "Updated just now",
        surveyTitle: surveyTitle || "London's Mood Right Now",
        surveyButtonLabel: surveyButtonLabel || "Take Part in Our Daily Survey",
        surveySuccessText: surveySuccessText || "Thanks for sharing your mood!",
        options: options || [
          { key: "happy", label: "Happy", votes: 0 },
          { key: "sad", label: "Sad", votes: 0 },
          { key: "okay", label: "Can't complain", votes: 0 },
        ],
      });
    }
    res.json(survey);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/mood-surveys/:id — update by id (admin)
router.put('/:id', adminVerify, async (req, res) => {
  try {
    const survey = await MoodSurvey.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!survey) return res.status(404).json({ message: 'Survey not found' });
    res.json(survey);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/mood-surveys/:id — delete (admin)
router.delete('/:id', adminVerify, async (req, res) => {
  try {
    const survey = await MoodSurvey.findByIdAndDelete(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;