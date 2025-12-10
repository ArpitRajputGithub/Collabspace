const emitTaskUpdate = (io, projectId, eventType, data) => {
  io.to(`project:${projectId}`).emit(eventType, {
    ...data,
    timestamp: new Date().toISOString()
  });
};

const emitWorkspaceUpdate = (io, workspaceId, eventType, data) => {
  io.to(`workspace:${workspaceId}`).emit(eventType, {
    ...data,
    timestamp: new Date().toISOString()
  });
};

const emitUserNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
    read: false
  });
};

// Task-specific events
const taskEvents = {
  created: (io, projectId, task, createdBy) => {
    emitTaskUpdate(io, projectId, 'task-created', {
      task,
      createdBy,
      message: `${createdBy.firstName} ${createdBy.lastName} created task "${task.title}"`
    });
  },

  updated: (io, projectId, task, updatedBy, changes) => {
    emitTaskUpdate(io, projectId, 'task-updated', {
      taskId: task.id,
      changes,
      updatedBy,
      message: `${updatedBy.firstName} ${updatedBy.lastName} updated task "${task.title}"`
    });
  },

  moved: (io, projectId, taskId, oldStatusId, newStatusId, movedBy) => {
    emitTaskUpdate(io, projectId, 'task-moved', {
      taskId,
      oldStatusId,
      newStatusId,
      movedBy,
      message: `${movedBy.firstName} ${movedBy.lastName} moved a task`
    });
  },

  commentAdded: (io, projectId, taskId, comment) => {
    emitTaskUpdate(io, projectId, 'task-comment-added', {
      taskId,
      comment,
      message: `${comment.author.name} commented on a task`
    });
  },

  deleted: (io, projectId, taskId, deletedBy) => {
    emitTaskUpdate(io, projectId, 'task-deleted', {
      taskId,
      deletedBy,
      message: `${deletedBy.firstName} ${deletedBy.lastName} deleted a task`
    });
  }
};

// Project-specific events
const projectEvents = {
  created: (io, workspaceId, project, createdBy) => {
    emitWorkspaceUpdate(io, workspaceId, 'project-created', {
      project,
      createdBy,
      message: `${createdBy.firstName} ${createdBy.lastName} created project "${project.name}"`
    });
  },

  updated: (io, workspaceId, project, updatedBy) => {
    emitWorkspaceUpdate(io, workspaceId, 'project-updated', {
      project,
      updatedBy,
      message: `${updatedBy.firstName} ${updatedBy.lastName} updated project "${project.name}"`
    });
  }
};

// Workspace-specific events
const workspaceEvents = {
  memberAdded: (io, workspaceId, member, addedBy) => {
    emitWorkspaceUpdate(io, workspaceId, 'member-added', {
      member,
      addedBy,
      message: `${addedBy.firstName} ${addedBy.lastName} added ${member.firstName} ${member.lastName} to the workspace`
    });
  },

  memberRemoved: (io, workspaceId, member, removedBy) => {
    emitWorkspaceUpdate(io, workspaceId, 'member-removed', {
      member,
      removedBy,
      message: `${removedBy.firstName} ${removedBy.lastName} removed ${member.firstName} ${member.lastName} from the workspace`
    });
  }
};

module.exports = {
  emitTaskUpdate,
  emitWorkspaceUpdate,
  emitUserNotification,
  taskEvents,
  projectEvents,
  workspaceEvents
};
