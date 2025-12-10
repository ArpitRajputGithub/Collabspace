const Project = require('../models/project');
const Task = require('../models/task');

// Create new project
const createProject = async (req, res) => {
  try {
    const { name, description, color, startDate, endDate } = req.body;
    const { workspaceId } = req.params;
    // Use authenticatedUser from RBAC middleware or req.user from JWT
    const createdBy = req.authenticatedUser ? req.authenticatedUser.id : req.user?.id;
    
    if (!createdBy) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const project = await Project.create({
      name,
      description,
      workspaceId,
      createdBy,
      color,
      startDate,
      endDate
    });

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: project.createdAt
      }
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      error: 'Internal server error while creating project'
    });
  }
};

// Get workspace projects
const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const projects = await Project.findByWorkspace(workspaceId);

    res.json({
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        createdBy: project.createdByName,
        taskCount: project.taskCount,
        completedTasks: project.completedTasks,
        createdAt: project.createdAt
      }))
    });

  } catch (error) {
    console.error('Get workspace projects error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get project details
const getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    // Get project statistics and task statuses
    const [statistics, taskStatuses] = await Promise.all([
      project.getStatistics(),
      project.getTaskStatuses()
    ]);

    res.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        createdBy: project.createdByName,
        workspaceName: project.workspaceName,
        createdAt: project.createdAt
      },
      statistics: {
        totalTasks: parseInt(statistics.total_tasks),
        completedTasks: parseInt(statistics.completed_tasks),
        overdueTasks: parseInt(statistics.overdue_tasks),
        assignedTasks: parseInt(statistics.assigned_tasks),
        avgCompletionHours: parseFloat(statistics.avg_completion_hours).toFixed(1)
      },
      taskStatuses: taskStatuses.map(status => ({
        id: status.id,
        name: status.name,
        slug: status.slug,
        color: status.color,
        position: status.position,
        isDefault: status.is_default
      }))
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get project Kanban board
const getProjectBoard = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Verify project exists and user has access (done by middleware)
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    const [tasks, taskStatuses] = await Promise.all([
      Task.findByProject(projectId),
      project.getTaskStatuses()
    ]);

    // Group tasks by status
    const tasksByStatus = taskStatuses.reduce((acc, status) => {
      acc[status.id] = {
        ...status,
        tasks: tasks.filter(task => task.statusId === status.id)
      };
      return acc;
    }, {});

    res.json({
      project: {
        id: project.id,
        name: project.name,
        color: project.color
      },
      board: Object.values(tasksByStatus).map(column => ({
        id: column.id,
        name: column.name,
        slug: column.slug,
        color: column.color,
        position: column.position,
        tasks: column.tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate,
          labels: task.labels,
          position: task.position,
          assignee: task.assignee,
          commentCount: task.commentCount,
          createdAt: task.createdAt
        }))
      })).sort((a, b) => a.position - b.position)
    });

  } catch (error) {
    console.error('Get project board error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updates = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    await project.update(updates);

    res.json({
      message: 'Project updated successfully',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        updatedAt: project.updatedAt
      }
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    await project.delete();

    res.json({
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = {
  createProject,
  getWorkspaceProjects,
  getProject,
  getProjectBoard,
  updateProject,
  deleteProject
};
