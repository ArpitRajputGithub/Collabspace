const Task = require('../models/task');
const Project = require('../models/project');

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, assigneeId, priority, dueDate, labels, estimatedHours } = req.body;
    const { projectId } = req.params;
    const createdBy = req.user.id;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assigneeId,
      createdBy,
      priority,
      dueDate,
      labels,
      estimatedHours
    });

    // Get task with related data for response
    const taskWithData = await Task.findById(task.id);

    // Emit real-time event (we'll implement this next)
    req.io.to(`project:${projectId}`).emit('taskCreated', {
      task: taskWithData,
      projectId
    });

    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: taskWithData.id,
        title: taskWithData.title,
        description: taskWithData.description,
        priority: taskWithData.priority,
        dueDate: taskWithData.dueDate,
        labels: taskWithData.labels,
        status: taskWithData.status,
        assignee: taskWithData.assignee,
        createdAt: taskWithData.createdAt
      }
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      error: 'Internal server error while creating task'
    });
  }
};

// Get task details
const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    // Get task comments
    const comments = await task.getComments();

    res.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        labels: task.labels,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        status: task.status,
        assignee: task.assignee,
        projectName: task.projectName,
        createdBy: task.createdByName,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      },
      comments: comments
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    await task.update(updates);
    
    // Get updated task with related data
    const updatedTask = await Task.findById(taskId);

    // Emit real-time event
    req.io.to(`project:${task.projectId}`).emit('taskUpdated', {
      task: updatedTask,
      changes: updates,
      updatedBy: req.user.id
    });

    res.json({
      message: 'Task updated successfully',
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate,
        labels: updatedTask.labels,
        status: updatedTask.status,
        assignee: updatedTask.assignee,
        updatedAt: updatedTask.updatedAt
      }
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Move task (drag and drop)
const moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { statusId, position } = req.body;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    await task.updatePosition(statusId, position);
    
    // Get updated task
    const updatedTask = await Task.findById(taskId);

    // Emit real-time event for board synchronization
    req.io.to(`project:${task.projectId}`).emit('taskMoved', {
      taskId: task.id,
      oldStatusId: task.statusId,
      newStatusId: statusId,
      newPosition: position,
      movedBy: req.user.id
    });

    res.json({
      message: 'Task moved successfully',
      task: {
        id: updatedTask.id,
        statusId: updatedTask.statusId,
        position: updatedTask.position
      }
    });

  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Add comment to task
const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, mentions = [] } = req.body;
    const userId = req.user.id;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    const comment = await task.addComment(userId, content, mentions);

    // Get comment with author data
    const comments = await task.getComments();
    const newComment = comments.find(c => c.id === comment.id);

    // Emit real-time event
    req.io.to(`project:${task.projectId}`).emit('taskCommentAdded', {
      taskId: task.id,
      comment: newComment
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (error) {
    console.error('Add task comment error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get task comments
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    const comments = await task.getComments();

    res.json({
      comments: comments
    });

  } catch (error) {
    console.error('Get task comments error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    await task.delete();

    // Emit real-time event
    req.io.to(`project:${task.projectId}`).emit('taskDeleted', {
      taskId: task.id,
      projectId: task.projectId,
      deletedBy: req.user.id
    });

    res.json({
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = {
  createTask,
  getTask,
  updateTask,
  moveTask,
  addTaskComment,
  getTaskComments,
  deleteTask
};
