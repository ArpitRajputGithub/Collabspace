const Activity = require('../models/activity');

// Get activities for a specific workspace
const getWorkspaceActivities = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    // req.workspace is set by the isMember middleware
    const activities = await Activity.getByWorkspace(workspaceId, limit);

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Get workspace activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching activities'
    });
  }
};

// Get recent activities across all user's workspaces
const getUserRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Get user from JWT auth
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    const userId = req.user.id;

    const activities = await Activity.getRecentForUser(userId, limit);

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Get user recent activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching recent activities'
    });
  }
};

module.exports = {
  getWorkspaceActivities,
  getUserRecentActivities
};
