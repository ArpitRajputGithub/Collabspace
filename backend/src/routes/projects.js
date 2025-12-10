const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/auth');
const { isMember } = require('../middleware/rbac');
const { validateCreateProject } = require('../middleware/validation');

// All routes require JWT authentication
router.use(authenticateToken);

// Project routes within workspaces
router.post('/workspace/:workspaceId', isMember, validateCreateProject, projectController.createProject);
router.get('/workspace/:workspaceId', isMember, projectController.getWorkspaceProjects);

// Individual project routes
router.get('/:projectId', projectController.getProject);
router.get('/:projectId/board', projectController.getProjectBoard);
router.put('/:projectId', projectController.updateProject);
router.delete('/:projectId', projectController.deleteProject);

module.exports = router;
