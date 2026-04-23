// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const adminVerify = require('../middlewares/adminVerify');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@newsportal.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = 'Super Admin';

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { email, name: ADMIN_NAME },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      return res.json({
        token,
        admin: { id: 'admin1', email, name: ADMIN_NAME },
      });
    }

    return res.status(401).json({ message: 'Invalid email or password.' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/me  — verify token
router.get('/me', adminVerify, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;