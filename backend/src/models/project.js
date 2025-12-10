const { pool } = require('../config/database');

class Project {
  constructor(projectData) {
    this.id = projectData.id;
    this.name = projectData.name;
    this.description = projectData.description;
    this.workspaceId = projectData.workspace_id;
    this.createdBy = projectData.created_by;
    this.status = projectData.status;
    this.color = projectData.color;
    this.settings = projectData.settings;
    this.startDate = projectData.start_date;
    this.endDate = projectData.end_date;
    this.isActive = projectData.is_active;
    this.createdAt = projectData.created_at;
    this.updatedAt = projectData.updated_at;
  }

  // Create new project
  static async create({ name, description, workspaceId, createdBy, color, startDate, endDate }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create project
      const projectQuery = `
        INSERT INTO projects (name, description, workspace_id, created_by, color, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const projectResult = await client.query(projectQuery, [
        name, description, workspaceId, createdBy, color, startDate, endDate
      ]);
      
      const project = new Project(projectResult.rows[0]);

      // Create default task statuses for the project
      await client.query('SELECT create_default_task_statuses($1)', [project.id]);

      await client.query('COMMIT');
      return project;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Find project by ID
  static async findById(id) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT p.*, 
               u.first_name || ' ' || u.last_name as created_by_name,
               w.name as workspace_name
        FROM projects p
        JOIN users u ON p.created_by = u.id
        JOIN workspaces w ON p.workspace_id = w.id
        WHERE p.id = $1 AND p.is_active = true
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const projectData = result.rows[0];
      const project = new Project(projectData);
      project.createdByName = projectData.created_by_name;
      project.workspaceName = projectData.workspace_name;
      
      return project;
    } finally {
      client.release();
    }
  }

  // Get projects by workspace
  static async findByWorkspace(workspaceId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT p.*, 
               u.first_name || ' ' || u.last_name as created_by_name,
               COUNT(t.id) as task_count,
               COUNT(CASE WHEN ts.slug = 'done' THEN 1 END) as completed_tasks
        FROM projects p
        JOIN users u ON p.created_by = u.id
        LEFT JOIN tasks t ON p.id = t.project_id AND t.is_active = true
        LEFT JOIN task_statuses ts ON t.status_id = ts.id
        WHERE p.workspace_id = $1 AND p.is_active = true
        GROUP BY p.id, u.first_name, u.last_name
        ORDER BY p.created_at DESC
      `;
      
      const result = await client.query(query, [workspaceId]);
      
      return result.rows.map(row => {
        const project = new Project(row);
        project.createdByName = row.created_by_name;
        project.taskCount = parseInt(row.task_count);
        project.completedTasks = parseInt(row.completed_tasks);
        return project;
      });
    } finally {
      client.release();
    }
  }

  // Update project
  async update({ name, description, color, startDate, endDate, status }) {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE projects 
        SET name = $1, description = $2, color = $3, start_date = $4, end_date = $5, status = $6
        WHERE id = $7
        RETURNING *
      `;
      
      const result = await client.query(query, [
        name || this.name,
        description !== undefined ? description : this.description,
        color || this.color,
        startDate !== undefined ? startDate : this.startDate,
        endDate !== undefined ? endDate : this.endDate,
        status || this.status,
        this.id
      ]);
      
      const updatedData = result.rows[0];
      Object.assign(this, new Project(updatedData));
      
      return this;
    } finally {
      client.release();
    }
  }

  // Get project task statuses
  async getTaskStatuses() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM task_statuses 
        WHERE project_id = $1 
        ORDER BY position ASC
      `;
      
      const result = await client.query(query, [this.id]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Get project statistics
  async getStatistics() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          COUNT(t.id) as total_tasks,
          COUNT(CASE WHEN ts.slug = 'done' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN t.due_date < NOW() AND ts.slug != 'done' THEN 1 END) as overdue_tasks,
          COUNT(CASE WHEN t.assignee_id IS NOT NULL THEN 1 END) as assigned_tasks,
          COALESCE(AVG(CASE WHEN ts.slug = 'done' AND t.completed_at IS NOT NULL 
            THEN EXTRACT(epoch FROM (t.completed_at - t.created_at))/3600 
          END), 0) as avg_completion_hours
        FROM tasks t
        LEFT JOIN task_statuses ts ON t.status_id = ts.id
        WHERE t.project_id = $1 AND t.is_active = true
      `;
      
      const result = await client.query(query, [this.id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Delete project (soft delete)
  async delete() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Soft delete all tasks in project
      await client.query(
        'UPDATE tasks SET is_active = false WHERE project_id = $1',
        [this.id]
      );

      // Soft delete project
      await client.query(
        'UPDATE projects SET is_active = false WHERE id = $1',
        [this.id]
      );

      await client.query('COMMIT');
      this.isActive = false;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Project;
