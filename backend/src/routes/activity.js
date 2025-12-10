const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/auth');
const { isMember } = require('../middleware/rbac');

// All routes require JWT authentication
router.use(authenticateToken);

// Activity routes
router.get('/recent', activityController.getUserRecentActivities);
router.get('/workspace/:workspaceId', isMember, activityController.getWorkspaceActivities);

module.exports = router;
