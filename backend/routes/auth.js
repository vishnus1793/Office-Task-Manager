const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { signupRules, loginRules, validate } = require('../validators');

router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);
router.get('/me', verifyToken, getMe);

module.exports = router;
