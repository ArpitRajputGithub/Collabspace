const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const { authenticateToken } = require('../middleware/auth');
const { canManageMembers, isMember, isOwner } = require('../middleware/rbac');
const { 
  validateCreateWorkspace, 
  validateInviteMember, 
  validateUpdateMemberRole 
} = require('../middleware/validation');

// All routes require JWT authentication
router.use(authenticateToken);

// Workspace routes
router.post('/', validateCreateWorkspace, workspaceController.createWorkspace);
router.get('/', workspaceController.getUserWorkspaces);

// Routes with workspace-specific permissions
router.get('/:workspaceId', isMember, workspaceController.getWorkspace);
router.put('/:workspaceId', isOwner, workspaceController.updateWorkspace);

// Member management routes
router.post('/:workspaceId/members', canManageMembers, validateInviteMember, workspaceController.inviteMember);
router.put('/:workspaceId/members/:memberId/role', canManageMembers, validateUpdateMemberRole, workspaceController.updateMemberRole);
router.delete('/:workspaceId/members/:memberId', canManageMembers, workspaceController.removeMember);

module.exports = router;
