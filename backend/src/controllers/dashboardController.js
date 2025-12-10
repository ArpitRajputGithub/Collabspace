const { pool } = require('../config/database');

// Get dashboard statistics for the authenticated user
const getDashboardStats = async (req, res) => {
  try {
    // Get user from JWT auth
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    const userId = req.user.id;

    const client = await pool.connect();
    try {
      // Get today's activity count (tasks created/updated today)
      const todayQuery = `
        SELECT COUNT(DISTINCT a.id) as count
        FROM workspace_activities a
        JOIN workspace_members wm ON wm.workspace_id = a.workspace_id
        WHERE wm.user_id = $1 
          AND wm.is_active = true
          AND a.created_at >= CURRENT_DATE
          AND a.type IN ('task', 'comment', 'project')
      `;
      const todayResult = await client.query(todayQuery, [userId]);
      const activeTodayCount = parseInt(todayResult.rows[0].count) || 0;

      // Get this week's activity count
      const weekQuery = `
        SELECT COUNT(DISTINCT a.id) as count
        FROM workspace_activities a
        JOIN workspace_members wm ON wm.workspace_id = a.workspace_id
        WHERE wm.user_id = $1 
          AND wm.is_active = true
          AND a.created_at >= DATE_TRUNC('week', CURRENT_DATE)
          AND a.type IN ('task', 'comment', 'project', 'member')
      `;
      const weekResult = await client.query(weekQuery, [userId]);
      const weeklyActionsCount = parseInt(weekResult.rows[0].count) || 0;

      // Get total tasks assigned to user
      const tasksQuery = `
        SELECT COUNT(DISTINCT t.id) as count
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE wm.user_id = $1 
          AND t.assignee_id = $1
          AND t.is_active = true
          AND wm.is_active = true
      `;
      const tasksResult = await client.query(tasksQuery, [userId]);
      const totalAssignedTasks = parseInt(tasksResult.rows[0].count) || 0;

      // Get completed tasks count
      const completedQuery = `
        SELECT COUNT(DISTINCT t.id) as count
        FROM tasks t
        JOIN task_statuses ts ON t.status_id = ts.id
        JOIN projects p ON t.project_id = p.id
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE wm.user_id = $1 
          AND t.assignee_id = $1
          AND ts.slug = 'done'
          AND t.is_active = true
          AND wm.is_active = true
      `;
      const completedResult = await client.query(completedQuery, [userId]);
      const completedTasks = parseInt(completedResult.rows[0].count) || 0;

      res.json({
        success: true,
        data: {
          activeTodayCount,
          weeklyActionsCount,
          totalAssignedTasks,
          completedTasks,
          completionRate: totalAssignedTasks > 0 
            ? Math.round((completedTasks / totalAssignedTasks) * 100) 
            : 0
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching dashboard statistics'
    });
  }
};

module.exports = {
  getDashboardStats
};
