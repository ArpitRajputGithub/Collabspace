const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Socket.io authentication middleware (JWT only)
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // JWT authentication
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Set user data on socket
      socket.userId = user.id;
      socket.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatarUrl
      };
      
      console.log('Socket authenticated via JWT:', user.firstName, user.email);
      next();
    } catch (jwtError) {
      console.error('JWT socket auth failed:', jwtError.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: ' + error.message));
  }
};

// Main socket handler
const socketHandlers = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.firstName} ${socket.user.lastName} connected (${socket.id})`);
    
    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining project rooms
    socket.on('join-project', ({ projectId }) => {
      socket.join(`project:${projectId}`);
      socket.currentProject = projectId;
      console.log(`User ${socket.user.firstName} joined project ${projectId}`);
      
      // Notify others in the project
      socket.to(`project:${projectId}`).emit('user-joined-project', {
        user: socket.user,
        projectId: projectId
      });
    });

    // Handle leaving project rooms
    socket.on('leave-project', ({ projectId }) => {
      socket.leave(`project:${projectId}`);
      if (socket.currentProject === projectId) {
        socket.currentProject = null;
      }
      console.log(`User ${socket.user.firstName} left project ${projectId}`);
      
      // Notify others in the project
      socket.to(`project:${projectId}`).emit('user-left-project', {
        user: socket.user,
        projectId: projectId
      });
    });

    // Handle workspace rooms
    socket.on('join-workspace', ({ workspaceId }) => {
      socket.join(`workspace:${workspaceId}`);
      socket.currentWorkspace = workspaceId;
      console.log(`User ${socket.user.firstName} joined workspace ${workspaceId}`);
      
      // Send online status to workspace members
      socket.to(`workspace:${workspaceId}`).emit('user-online', {
        user: socket.user,
        workspaceId: workspaceId
      });
    });

    socket.on('leave-workspace', ({ workspaceId }) => {
      socket.leave(`workspace:${workspaceId}`);
      if (socket.currentWorkspace === workspaceId) {
        socket.currentWorkspace = null;
      }
      console.log(`User ${socket.user.firstName} left workspace ${workspaceId}`);
      
      socket.to(`workspace:${workspaceId}`).emit('user-offline', {
        user: socket.user,
        workspaceId: workspaceId
      });
    });

    // Handle real-time task updates
    socket.on('task-updated', ({ taskId, projectId, task }) => {
      socket.to(`project:${projectId}`).emit('task-updated', {
        taskId,
        task,
        updatedBy: socket.user
      });
      console.log(`Task ${taskId} updated by ${socket.user.firstName}`);
    });

    // Handle real-time task editing
    socket.on('task-editing', ({ taskId, isEditing }) => {
      if (socket.currentProject) {
        socket.to(`project:${socket.currentProject}`).emit('task-editing-status', {
          taskId,
          user: socket.user,
          isEditing
        });
      }
    });

    // Handle typing indicators for comments
    socket.on('typing-comment', ({ taskId, isTyping }) => {
      if (socket.currentProject) {
        socket.to(`project:${socket.currentProject}`).emit('user-typing-comment', {
          taskId,
          user: socket.user,
          isTyping
        });
      }
    });

    // Handle cursor position sharing for collaborative editing
    socket.on('cursor-position', ({ taskId, position }) => {
      if (socket.currentProject) {
        socket.to(`project:${socket.currentProject}`).emit('cursor-updated', {
          taskId,
          user: socket.user,
          position
        });
      }
    });

    // Handle real-time messages (with MongoDB persistence)
    socket.on('message-sent', async ({ projectId, content }) => {
      try {
        const Message = require('../models/Message');
        
        // Save message to MongoDB
        const savedMessage = await Message.createMessage({
          projectId,
          userId: socket.userId,
          userInfo: {
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            email: socket.user.email,
            avatarUrl: socket.user.avatarUrl
          },
          content,
          messageType: 'text'
        });
        
        // Broadcast to all users in the project room (including sender)
        io.to(`project:${projectId}`).emit('message-received', {
          message: savedMessage,
          projectId
        });
        
        console.log(`Message saved and sent by ${socket.user.firstName} in project ${projectId}`);
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.user.firstName} ${socket.user.lastName} disconnected: ${reason}`);
      
      // Notify current workspace about offline status
      if (socket.currentWorkspace) {
        socket.to(`workspace:${socket.currentWorkspace}`).emit('user-offline', {
          user: socket.user,
          workspaceId: socket.currentWorkspace
        });
      }
      
      // Notify current project about user leaving
      if (socket.currentProject) {
        socket.to(`project:${socket.currentProject}`).emit('user-left-project', {
          user: socket.user,
          projectId: socket.currentProject
        });
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error for user', socket.user?.firstName, ':', error);
    });
  });

  // Broadcast system-wide messages
  const broadcastSystemMessage = (message) => {
    io.emit('system-message', {
      message,
      timestamp: new Date().toISOString()
    });
  };

  // Add system message broadcaster to io object
  io.broadcastSystemMessage = broadcastSystemMessage;

  console.log('Socket.io handlers initialized with JWT auth');
};

module.exports = socketHandlers;
