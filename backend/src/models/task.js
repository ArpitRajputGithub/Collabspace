const { pool } = require('../config/database');

class Task {
  constructor(taskData) {
    this.id = taskData.id;
    this.title = taskData.title;
    this.description = taskData.description;
    this.projectId = taskData.project_id;
    this.assigneeId = taskData.assignee_id;
    this.createdBy = taskData.created_by;
    this.statusId = taskData.status_id;
    this.priority = taskData.priority;
    this.dueDate = taskData.due_date;
    this.completedAt = taskData.completed_at;
    this.position = taskData.position;
    this.labels = taskData.labels;
    this.metadata = taskData.metadata;
    this.estimatedHours = taskData.estimated_hours;
    this.actualHours = taskData.actual_hours;
    this.isActive = taskData.is_active;
    this.createdAt = taskData.created_at;
    this.updatedAt = taskData.updated_at;
  }

  // Create new task
  static async create({ title, description, projectId, assigneeId, createdBy, statusId, priority, dueDate, labels, estimatedHours }) {
    const client = await pool.connect();
    try {
      // Get default status if none provided
      let finalStatusId = statusId;
      if (!statusId) {
        const defaultStatus = await client.query(
          'SELECT id FROM task_statuses WHERE project_id = $1 AND is_default = true LIMIT 1',
          [projectId]
        );
        finalStatusId = defaultStatus.rows[0]?.id;
      }

      // Get next position in status column
      const positionResult = await client.query(
        'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM tasks WHERE status_id = $1 AND is_active = true',
        [finalStatusId]
      );
      const nextPosition = positionResult.rows[0].next_position;

      const query = `
        INSERT INTO tasks (title, description, project_id, assignee_id, created_by, status_id, priority, due_date, labels, estimated_hours, position)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const result = await client.query(query, [
        title, description, projectId, assigneeId, createdBy, 
        finalStatusId, priority, dueDate, JSON.stringify(labels || []), 
        estimatedHours, nextPosition
      ]);
      
      return new Task(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Find task by ID with related data
  static async findById(id) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT t.*, 
               ts.name as status_name, ts.slug as status_slug, ts.color as status_color,
               assignee.first_name || ' ' || assignee.last_name as assignee_name,
               assignee.email as assignee_email,
               creator.first_name || ' ' || creator.last_name as created_by_name,
               p.name as project_name
        FROM tasks t
        LEFT JOIN task_statuses ts ON t.status_id = ts.id
        LEFT JOIN users assignee ON t.assignee_id = assignee.id
        JOIN users creator ON t.created_by = creator.id
        JOIN projects p ON t.project_id = p.id
        WHERE t.id = $1 AND t.is_active = true
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const taskData = result.rows[0];
      const task = new Task(taskData);
      
      // Add related data
      task.status = {
        id: task.statusId,
        name: taskData.status_name,
        slug: taskData.status_slug,
        color: taskData.status_color
      };
      task.assignee = assigneeId ? {
        id: task.assigneeId,
        name: taskData.assignee_name,
        email: taskData.assignee_email
      } : null;
      task.createdByName = taskData.created_by_name;
      task.projectName = taskData.project_name;
      
      return task;
    } finally {
      client.release();
    }
  }

  // Get tasks by project (for Kanban board)
  static async findByProject(projectId) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT t.*, 
               ts.name as status_name, ts.slug as status_slug, ts.color as status_color, ts.position as status_position,
               assignee.first_name || ' ' || assignee.last_name as assignee_name,
               assignee.avatar_url as assignee_avatar,
               creator.first_name || ' ' || creator.last_name as created_by_name,
               COUNT(tc.id) as comment_count
        FROM tasks t
        LEFT JOIN task_statuses ts ON t.status_id = ts.id
        LEFT JOIN users assignee ON t.assignee_id = assignee.id
        JOIN users creator ON t.created_by = creator.id
        LEFT JOIN task_comments tc ON t.id = tc.task_id AND tc.is_active = true
        WHERE t.project_id = $1 AND t.is_active = true
        GROUP BY t.id, ts.id, ts.name, ts.slug, ts.color, ts.position, 
                 assignee.first_name, assignee.last_name, assignee.avatar_url,
                 creator.first_name, creator.last_name
        ORDER BY ts.position ASC, t.position ASC
      `;
      
      const result = await client.query(query, [projectId]);
      
      return result.rows.map(row => {
        const task = new Task(row);
        task.status = {
          id: task.statusId,
          name: row.status_name,
          slug: row.status_slug,
          color: row.status_color,
          position: row.status_position
        };
        task.assignee = task.assigneeId ? {
          id: task.assigneeId,
          name: row.assignee_name,
          avatar: row.assignee_avatar
        } : null;
        task.createdByName = row.created_by_name;
        task.commentCount = parseInt(row.comment_count);
        return task;
      });
    } finally {
      client.release();
    }
  }

  // Update task
  async update(updates) {
    const client = await pool.connect();
    try {
      const allowedUpdates = [
        'title', 'description', 'assignee_id', 'status_id', 
        'priority', 'due_date', 'labels', 'estimated_hours', 'actual_hours'
      ];
      
      const updateFields = [];
      const values = [];
      let valueIndex = 1;
      
      for (const [key, value] of Object.entries(updates)) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (allowedUpdates.includes(dbField)) {
          updateFields.push(`${dbField} = $${valueIndex}`);
          values.push(key === 'labels' ? JSON.stringify(value) : value);
          valueIndex++;
        }
      }
      
      if (updateFields.length === 0) {
        return this;
      }
      
      // Handle status change completion
      if (updates.statusId) {
        const statusResult = await client.query(
          'SELECT slug FROM task_statuses WHERE id = $1',
          [updates.statusId]
        );
        
        if (statusResult.rows[0]?.slug === 'done' && !this.completedAt) {
          updateFields.push(`completed_at = NOW()`);
        } else if (statusResult.rows[0]?.slug !== 'done') {
          updateFields.push(`completed_at = NULL`);
        }
      }
      
      values.push(this.id);
      
      const query = `
        UPDATE tasks 
        SET ${updateFields.join(', ')}
        WHERE id = $${valueIndex}
        RETURNING *
      `;
      
      const result = await client.query(query, values);
      Object.assign(this, new Task(result.rows[0]));
      
      return this;
    } finally {
      client.release();
    }
  }

  // Update task position (for drag and drop)
  async updatePosition(newStatusId, newPosition) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If moving to different status, update positions in both columns
      if (newStatusId !== this.statusId) {
        // Shift down tasks in old status
        await client.query(
          'UPDATE tasks SET position = position - 1 WHERE status_id = $1 AND position > $2 AND is_active = true',
          [this.statusId, this.position]
        );

        // Shift up tasks in new status
        await client.query(
          'UPDATE tasks SET position = position + 1 WHERE status_id = $1 AND position >= $2 AND is_active = true',
          [newStatusId, newPosition]
        );
      } else {
        // Moving within same status
        if (newPosition > this.position) {
          // Moving down
          await client.query(
            'UPDATE tasks SET position = position - 1 WHERE status_id = $1 AND position > $2 AND position <= $3 AND is_active = true',
            [this.statusId, this.position, newPosition]
          );
        } else if (newPosition < this.position) {
          // Moving up
          await client.query(
            'UPDATE tasks SET position = position + 1 WHERE status_id = $1 AND position >= $2 AND position < $3 AND is_active = true',
            [this.statusId, newPosition, this.position]
          );
        }
      }

      // Update this task
      await client.query(
        'UPDATE tasks SET status_id = $1, position = $2 WHERE id = $3',
        [newStatusId, newPosition, this.id]
      );

      await client.query('COMMIT');
      
      this.statusId = newStatusId;
      this.position = newPosition;
      
      return this;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get task comments
  async getComments() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT tc.*, 
               u.first_name || ' ' || u.last_name as author_name,
               u.avatar_url as author_avatar,
               u.email as author_email
        FROM task_comments tc
        JOIN users u ON tc.user_id = u.id
        WHERE tc.task_id = $1 AND tc.is_active = true
        ORDER BY tc.created_at ASC
      `;
      
      const result = await client.query(query, [this.id]);
      
      return result.rows.map(comment => ({
        id: comment.id,
        content: comment.content,
        mentions: comment.mentions,
        attachments: comment.attachments,
        isEdited: comment.is_edited,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        author: {
          id: comment.user_id,
          name: comment.author_name,
          email: comment.author_email,
          avatar: comment.author_avatar
        }
      }));
    } finally {
      client.release();
    }
  }

  // Add comment to task
  async addComment(userId, content, mentions = []) {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO task_comments (task_id, user_id, content, mentions)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await client.query(query, [
        this.id, userId, content, JSON.stringify(mentions)
      ]);
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Delete task (soft delete)
  async delete() {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE tasks SET is_active = false WHERE id = $1',
        [this.id]
      );
      
      this.isActive = false;
    } finally {
      client.release();
    }
  }
}

module.exports = Task;
