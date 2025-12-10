const { pool } = require('../config/database');

class Activity {
  constructor(activityData) {
    this.id = activityData.id;
    this.workspaceId = activityData.workspace_id;
    this.userId = activityData.user_id;
    this.type = activityData.type;
    this.action = activityData.action;
    this.targetType = activityData.target_type;
    this.targetId = activityData.target_id;
    this.targetName = activityData.target_name;
    this.metadata = activityData.metadata;
    this.createdAt = activityData.created_at;
  }

  // Create new activity log
  static async create({ workspaceId, userId, type, action, targetType, targetId, targetName, metadata = {} }) {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO workspace_activities 
        (workspace_id, user_id, type, action, target_type, target_id, target_name, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const result = await client.query(query, [
        workspaceId, userId, type, action, targetType, targetId, targetName, JSON.stringify(metadata)
      ]);
      
      return new Activity(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Get activities for a workspace with user details
  static async getByWorkspace(workspaceId, limit = 50) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          a.*,
          u.first_name,
          u.last_name,
          u.email,
          u.avatar_url
        FROM workspace_activities a
        JOIN users u ON a.user_id = u.id
        WHERE a.workspace_id = $1
        ORDER BY a.created_at DESC
        LIMIT $2
      `;
      
      const result = await client.query(query, [workspaceId, limit]);
      
      return result.rows.map(row => ({
        id: row.id,
        type: row.type,
        action: row.action,
        target: row.target_name,
        targetType: row.target_type,
        targetId: row.target_id,
        timestamp: row.created_at,
        user: {
          id: row.user_id,
          name: `${row.first_name} ${row.last_name}`,
          email: row.email,
          avatar: row.avatar_url
        },
        metadata: row.metadata
      }));
    } finally {
      client.release();
    }
  }

  // Get recent activities across all user's workspaces
  static async getRecentForUser(userId, limit = 20) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          a.*,
          u.first_name,
          u.last_name,
          u.email,
          u.avatar_url,
          w.name as workspace_name
        FROM workspace_activities a
        JOIN users u ON a.user_id = u.id
        JOIN workspaces w ON a.workspace_id = w.id
        JOIN workspace_members wm ON wm.workspace_id = w.id
        WHERE wm.user_id = $1 AND wm.is_active = true
        ORDER BY a.created_at DESC
        LIMIT $2
      `;
      
      const result = await client.query(query, [userId, limit]);
      
      return result.rows.map(row => ({
        id: row.id,
        type: row.type,
        action: row.action,
        target: row.target_name,
        targetType: row.target_type,
        targetId: row.target_id,
        timestamp: row.created_at,
        workspaceName: row.workspace_name,
        user: {
          id: row.user_id,
          name: `${row.first_name} ${row.last_name}`,
          email: row.email,
          avatar: row.avatar_url
        },
        metadata: row.metadata
      }));
    } finally {
      client.release();
    }
  }

  // Helper to log task-related activities
  static async logTaskActivity(workspaceId, userId, action, task) {
    return await Activity.create({
      workspaceId,
      userId,
      type: 'task',
      action,
      targetType: 'task',
      targetId: task.id,
      targetName: task.title,
      metadata: {
        projectId: task.projectId,
        statusId: task.statusId,
        priority: task.priority
      }
    });
  }

  // Helper to log project-related activities
  static async logProjectActivity(workspaceId, userId, action, project) {
    return await Activity.create({
      workspaceId,
      userId,
      type: 'project',
      action,
      targetType: 'project',
      targetId: project.id,
      targetName: project.name,
      metadata: {
        color: project.color
      }
    });
  }

  // Helper to log member-related activities
  static async logMemberActivity(workspaceId, userId, action, targetUser) {
    return await Activity.create({
      workspaceId,
      userId,
      type: 'member',
      action,
      targetType: 'user',
      targetId: targetUser.id,
      targetName: `${targetUser.firstName} ${targetUser.lastName}`,
      metadata: {
        email: targetUser.email
      }
    });
  }

  // Helper to log comment-related activities
  static async logCommentActivity(workspaceId, userId, action, task) {
    return await Activity.create({
      workspaceId,
      userId,
      type: 'comment',
      action,
      targetType: 'task',
      targetId: task.id,
      targetName: task.title,
      metadata: {}
    });
  }
}

module.exports = Activity;
