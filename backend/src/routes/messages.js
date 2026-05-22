const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireProjectAccess } = require('../middleware/projectAccess');
const Message = require('../models/Message');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// All routes require authentication
router.use(authenticateToken);

// GET /api/projects/:projectId/messages - Get project messages with pagination
router.get('/:projectId/messages', requireProjectAccess, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, before } = req.query;
    
    const messages = await Message.getProjectMessages(projectId, {
      limit: parseInt(limit, 10),
      before
    });
    
    // Reverse to get oldest first for display
    messages.reverse();
    
    return sendSuccess(res, messages, {
      meta: {
        count: messages.length,
        hasMore: messages.length === parseInt(limit, 10)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return sendError(res, 500, 'Failed to fetch messages');
  }
});

// POST /api/projects/:projectId/messages - Send message via REST (fallback)
router.post('/:projectId/messages', requireProjectAccess, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return sendError(res, 400, 'Message content is required');
    }
    
    const message = await Message.createMessage({
      projectId,
      userId: req.user.id,
      userInfo: {
        firstName: req.authenticatedUser.firstName,
        lastName: req.authenticatedUser.lastName,
        email: req.authenticatedUser.email,
        avatarUrl: req.authenticatedUser.avatarUrl
      },
      content: content.trim(),
      messageType: 'text'
    });
    
    // Emit via Socket.io if available
    if (req.io) {
      req.io.to(`project:${projectId}`).emit('message-received', {
        message,
        projectId
      });
    }
    
    return sendSuccess(res, message, {
      status: 201
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return sendError(res, 500, 'Failed to send message');
  }
});

module.exports = router;
