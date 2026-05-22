const Project = require('../models/project');
const Task = require('../models/task');
const Workspace = require('../models/workspace');
const User = require('../models/user');
const { sendError } = require('../utils/apiResponse');

const attachAuthenticatedUser = async (req) => {
  if (req.authenticatedUser) {
    return req.authenticatedUser;
  }

  if (!req.user?.id) {
    return null;
  }

  const user = await User.findById(req.user.id);
  req.authenticatedUser = user;
  return user;
};

const requireProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return sendError(res, 400, 'Project ID is required');
    }

    const user = await attachAuthenticatedUser(req);
    if (!user) {
      return sendError(res, 401, 'Authentication required');
    }

    const workspaceId = await Project.findWorkspaceId(projectId);
    if (!workspaceId) {
      return sendError(res, 404, 'Project not found');
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return sendError(res, 404, 'Workspace not found');
    }

    const role = await workspace.isMember(user.id);
    if (!role) {
      return sendError(res, 403, 'You do not have access to this project');
    }

    req.workspace = workspace;
    req.userRole = role;
    next();
  } catch (error) {
    console.error('Project access middleware error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

const requireTaskAccess = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return sendError(res, 400, 'Task ID is required');
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    req.task = task;
    req.params.projectId = task.projectId;
    return requireProjectAccess(req, res, next);
  } catch (error) {
    console.error('Task access middleware error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

module.exports = {
  requireProjectAccess,
  requireTaskAccess
};
