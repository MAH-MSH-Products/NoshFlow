const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect, sanitizeInput } = require('../middlewares/authMiddleware');

// Apply NoSQL injection sanitization to all auth routes
router.use(sanitizeInput);

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
