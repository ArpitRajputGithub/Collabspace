const Task = require('../models/task');
const Project = require('../models/project');
const Activity = require('../models/activity');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const getActor = (req) => req.authenticatedUser || req.user;

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, assigneeId, priority, dueDate, labels, estimatedHours } = req.body;
    const { projectId } = req.params;
    const actor = getActor(req);
    const createdBy = actor.id;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 404, 'Project not found');
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
    await Activity.logTaskActivity(project.workspaceId, createdBy, 'created', taskWithData);

    // Emit real-time event for connected project collaborators.
    req.io.to(`project:${projectId}`).emit('task-created', {
      task: taskWithData,
      createdBy: actor,
      projectId
    });

    return sendSuccess(res, {
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
    }, {
      status: 201,
      message: 'Task created successfully',
    });

  } catch (error) {
    console.error('Create task error:', error);
    return sendError(res, 500, 'Internal server error while creating task');
  }
};

// Get task details
const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = req.task || await Task.findById(taskId);
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    // Get task comments
    const comments = await task.getComments();

    return sendSuccess(res, {
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
      comments
    });

  } catch (error) {
    console.error('Get task error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    
    const actor = getActor(req);
    const task = req.task || await Task.findById(taskId);
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    await task.update(updates);
    
    // Get updated task with related data
    const updatedTask = await Task.findById(taskId);
    await Activity.logTaskActivity(req.workspace.id, actor.id, 'updated', updatedTask);

    // Emit real-time event
    req.io.to(`project:${task.projectId}`).emit('task-updated', {
      taskId: updatedTask.id,
      task: updatedTask,
      changes: updates,
      updatedBy: actor,
      projectId: task.projectId
    });

    return sendSuccess(res, {
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
    }, {
      message: 'Task updated successfully',
    });

  } catch (error) {
    console.error('Update task error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// Move task (drag and drop)
const moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { statusId, position } = req.body;
    
    const actor = getActor(req);
    const task = req.task || await Task.findById(taskId);
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    await task.updatePosition(statusId, position);
    
    // Get updated task
    const updatedTask = await Task.findById(taskId);
    await Activity.logTaskActivity(req.workspace.id, actor.id, 'moved', updatedTask);

    // Emit real-time event for board synchronization
    req.io.to(`project:${task.projectId}`).emit('task-moved', {
      taskId: task.id,
      oldStatusId: task.statusId,
      newStatusId: statusId,
      newPosition: position,
      movedBy: actor,
      projectId: task.projectId
    });

    return sendSuccess(res, {
      task: {
        id: updatedTask.id,
        statusId: updatedTask.statusId,
        position: updatedTask.position
      }
    }, {
      message: 'Task moved successfully',
    });

  } catch (error) {
    console.error('Move task error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// Add comment to task
const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, mentions = [] } = req.body;
    const userId = getActor(req).id;
    
    const task = req.task || await Task.findById(taskId);
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    const comment = await task.addComment(userId, content, mentions);

    // Get comment with author data
    const comments = await task.getComments();
    const newComment = comments.find(c => c.id === comment.id);
    await Activity.logCommentActivity(req.workspace.id, userId, 'commented', task);

    // Emit real-time event
    req.io.to(`project:${task.projectId}`).emit('task-comment-added', {
      taskId: task.id,
      comment: newComment,
      projectId: task.projectId
    });

    return sendSuccess(res, {
      comment: newComment
    }, {
      status: 201,
      message: 'Comment added successfully',
    });

  } catch (error) {
    console.error('Add task comment error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// Get task comments
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = req.task || await Task.findById(taskId);
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    const comments = await task.getComments();

    return sendSuccess(res, {
      comments
    });

  } catch (error) {
    console.error('Get task comments error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const actor = getActor(req);
    const task = req.task || await Task.findById(taskId);
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    await task.delete();
    await Activity.logTaskActivity(req.workspace.id, actor.id, 'deleted', task);

    // Emit real-time event
    req.io.to(`project:${task.projectId}`).emit('task-deleted', {
      taskId: task.id,
      projectId: task.projectId,
      deletedBy: actor
    });

    return sendSuccess(res, null, {
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    return sendError(res, 500, 'Internal server error');
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
