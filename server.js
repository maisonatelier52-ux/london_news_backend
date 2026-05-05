
// // server.js
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');
// require('dotenv').config();

// const app = express();

// // Ensure uploads folder exists
// if (!fs.existsSync('uploads')) {
//   fs.mkdirSync('uploads', { recursive: true });
// }

// // CORS
// // app.use(cors({
// //   origin: [
// //     'http://localhost:3000',
// //     'https://london-news-two.vercel.app',
// //   ],
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization'],
// // }));
// const allowedOrigins = [
//   'http://localhost:3000',
//   'https://london-news-two.vercel.app'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("CORS not allowed"));
//     }
//   },
//   credentials: true
// }));

// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// // MongoDB
// const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/news-portal';
// mongoose.connect(MONGO_URI)
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch((err) => console.error('❌ MongoDB connection error:', err));

// // Routes
// app.use('/api/admin', require('./routes/auth'));
// app.use('/api/admin', require('./routes/dashboard'));
// app.use('/api/categories', require('./routes/categories'));
// app.use('/api/articles', require('./routes/articles'));
// app.use('/api/authors', require('./routes/authors'));
// app.use('/api/public', require('./routes/public'));

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({
//     status: 'ok',
//     mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//     timestamp: new Date().toISOString(),
//   });
// });

// app.get('/api/test', (req, res) => {
//   res.json({ message: 'Backend is running!', timestamp: new Date().toISOString() });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`\n🚀 Server running on port ${PORT}`);
//   console.log(`📡 API running...`);
//   console.log(`💚 Health running`);
//   // console.log(`📁 Uploads: ${path.join(__dirname, 'uploads')}\n`);
// });

// server.js  — UPDATED: add homepage, moodSurvey routes
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

const allowedOrigins = [
  'http://localhost:3000',
  'https://london-news-two.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/news-portal';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Existing routes
app.use('/api/admin', require('./routes/auth'));
app.use('/api/admin', require('./routes/dashboard'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/authors', require('./routes/authors'));
app.use('/api/public', require('./routes/public'));

// ── NEW ROUTES ──
const moodSurveyRouter = require('./routes/moodSurvey');
// Admin mood survey management
app.use('/api/mood-surveys', moodSurveyRouter);
// Public mood routes are inside public.js (/api/public/mood, /api/public/mood/vote)

// Homepage management
const homepageRouter = require('./routes/homepage');
app.use('/api/admin-homepage', homepageRouter);
// Public homepage route is inside public.js (/api/public/homepage)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
});