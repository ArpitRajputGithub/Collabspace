const { pool } = require('../config/database');

class Workspace {
  constructor(workspaceData) {
    this.id = workspaceData.id;
    this.name = workspaceData.name;
    this.slug = workspaceData.slug;
    this.description = workspaceData.description;
    this.avatarUrl = workspaceData.avatar_url;
    this.ownerId = workspaceData.owner_id;
    this.settings = workspaceData.settings;
    this.isActive = workspaceData.is_active;
    this.createdAt = workspaceData.created_at;
    this.updatedAt = workspaceData.updated_at;
  }

  // Create new workspace
  static async create({ name, slug, description, ownerId }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create workspace
      const workspaceQuery = `
        INSERT INTO workspaces (name, slug, description, owner_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const workspaceResult = await client.query(workspaceQuery, [name, slug, description, ownerId]);
      const workspace = new Workspace(workspaceResult.rows[0]);

      // Add owner as workspace member
      const memberQuery = `
        INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
        VALUES ($1, $2, 'owner', NOW())
      `;
      
      await client.query(memberQuery, [workspace.id, ownerId]);

      await client.query('COMMIT');
      return workspace;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Find workspace by slug
  static async findBySlug(slug) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM workspaces 
        WHERE slug = $1 AND is_active = true
      `;
      
      const result = await client.query(query, [slug]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Workspace(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Find workspace by ID
  static async findById(id) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM workspaces 
        WHERE id = $1 AND is_active = true
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Workspace(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Get workspace members
  async getMembers() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.avatar_url,
          wm.role,
          wm.joined_at
        FROM users u
        JOIN workspace_members wm ON u.id = wm.user_id
        WHERE wm.workspace_id = $1 AND wm.is_active = true AND u.is_active = true
        ORDER BY wm.joined_at ASC
      `;
      
      const result = await client.query(query, [this.id]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Add member to workspace
  async addMember(userId, role = 'member', invitedBy = null) {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO workspace_members (workspace_id, user_id, role, invited_by, joined_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (workspace_id, user_id) 
        DO UPDATE SET 
          role = EXCLUDED.role,
          is_active = true,
          invited_by = EXCLUDED.invited_by,
          joined_at = NOW()
        RETURNING *
      `;
      
      const result = await client.query(query, [this.id, userId, role, invitedBy]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Check if user is member
  async isMember(userId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT role FROM workspace_members 
        WHERE workspace_id = $1 AND user_id = $2 AND is_active = true
      `;
      
      const result = await client.query(query, [this.id, userId]);
      return result.rows.length > 0 ? result.rows[0].role : null;
    } finally {
      client.release();
    }
  }

  // Get workspace statistics (project count and task progress)
  async getStatistics() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT p.id) as project_count,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN ts.slug = 'done' THEN t.id END) as completed_tasks
        FROM workspaces w
        LEFT JOIN projects p ON p.workspace_id = w.id AND p.is_active = true
        LEFT JOIN tasks t ON t.project_id = p.id AND t.is_active = true
        LEFT JOIN task_statuses ts ON t.status_id = ts.id
        WHERE w.id = $1
        GROUP BY w.id
      `;
      
      const result = await client.query(query, [this.id]);
      
      if (result.rows.length === 0) {
        return {
          projectCount: 0,
          totalTasks: 0,
          completedTasks: 0,
          taskProgress: 0
        };
      }
      
      const stats = result.rows[0];
      const totalTasks = parseInt(stats.total_tasks) || 0;
      const completedTasks = parseInt(stats.completed_tasks) || 0;
      const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        projectCount: parseInt(stats.project_count) || 0,
        totalTasks,
        completedTasks,
        taskProgress
      };
    } finally {
      client.release();
    }
  }

  // Update workspace
  async update({ name, description }) {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE workspaces 
        SET name = $1, description = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `;
      
      const result = await client.query(query, [name, description, this.id]);
      
      // Update current instance
      this.name = result.rows[0].name;
      this.description = result.rows[0].description;
      this.updatedAt = result.rows[0].updated_at;
      
      return this;
    } finally {
      client.release();
    }
  }

// Update member role
  async updateMemberRole(userId, newRole) {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE workspace_members 
        SET role = $1, updated_at = NOW()
        WHERE workspace_id = $2 AND user_id = $3 AND is_active = true
        RETURNING *
      `;
      
      const result = await client.query(query, [newRole, this.id, userId]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

// Remove member
  async removeMember(userId) {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE workspace_members 
        SET is_active = false
        WHERE workspace_id = $1 AND user_id = $2
      `;
      
      await client.query(query, [this.id, userId]);
    } finally {
      client.release();
    }
  }
}



module.exports = Workspace;
