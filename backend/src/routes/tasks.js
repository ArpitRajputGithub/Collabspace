const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');
const { requireProjectAccess, requireTaskAccess } = require('../middleware/projectAccess');
const { 
  validateCreateTask, 
  validateUpdateTask, 
  validateMoveTask, 
  validateAddComment 
} = require('../middleware/validation');

router.use(authenticateToken);

// Task CRUD operations
router.post('/project/:projectId', requireProjectAccess, validateCreateTask, taskController.createTask);
router.get('/:taskId', requireTaskAccess, taskController.getTask);
router.put('/:taskId', requireTaskAccess, validateUpdateTask, taskController.updateTask);
router.delete('/:taskId', requireTaskAccess, taskController.deleteTask);

// Task movement (drag and drop)
router.put('/:taskId/move', requireTaskAccess, validateMoveTask, taskController.moveTask);

// Task comments
router.post('/:taskId/comments', requireTaskAccess, validateAddComment, taskController.addTaskComment);
router.get('/:taskId/comments', requireTaskAccess, taskController.getTaskComments);

module.exports = router;
