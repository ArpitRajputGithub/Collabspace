const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateCreateTask, 
  validateUpdateTask, 
  validateMoveTask, 
  validateAddComment 
} = require('../middleware/validation');

router.use(authenticateToken);

// Task CRUD operations
router.post('/project/:projectId', validateCreateTask, taskController.createTask);
router.get('/:taskId', taskController.getTask);
router.put('/:taskId', validateUpdateTask, taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);

// Task movement (drag and drop)
router.put('/:taskId/move', validateMoveTask, taskController.moveTask);

// Task comments
router.post('/:taskId/comments', validateAddComment, taskController.addTaskComment);
router.get('/:taskId/comments', taskController.getTaskComments);

module.exports = router;
