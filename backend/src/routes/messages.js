const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Message = require('../models/Message');

// All routes require authentication
router.use(authenticateToken);

// GET /api/projects/:projectId/messages - Get project messages with pagination
router.get('/:projectId/messages', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, before } = req.query;
    
    const messages = await Message.getProjectMessages(projectId, {
      limit: parseInt(limit, 10),
      before
    });
    
    // Reverse to get oldest first for display
    messages.reverse();
    
    res.json({
      success: true,
      data: messages,
      count: messages.length,
      hasMore: messages.length === parseInt(limit, 10)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

// POST /api/projects/:projectId/messages - Send message via REST (fallback)
router.post('/:projectId/messages', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }
    
    const message = await Message.createMessage({
      projectId,
      userId: req.user.id,
      userInfo: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl
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
    
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

module.exports = router;
