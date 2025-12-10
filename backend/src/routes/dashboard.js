const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// All routes require JWT authentication
router.use(authenticateToken);

// Dashboard statistics route
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
