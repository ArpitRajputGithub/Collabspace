const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile); 

module.exports = router;
