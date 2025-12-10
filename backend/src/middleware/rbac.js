const Workspace = require('../models/Workspace');
const User = require('../models/User');

// Helper function to get user from JWT auth
const getAuthenticatedUser = async (req) => {
  if (req.user && req.user.id) {
    // JWT authentication - user is available from token
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new Error('User not found in database');
    }
    return user;
  } else {
    throw new Error('No authentication found');
  }
};

// Check if user has specific role in workspace
const requireWorkspaceRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { workspaceId } = req.params;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          error: 'Workspace ID is required'
        });
      }

      // Get authenticated user
      const user = await getAuthenticatedUser(req);
      const userId = user.id;

      // Find workspace
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({
          success: false,
          error: 'Workspace not found'
        });
      }

      // Check if user is member and get their role
      const userRole = await workspace.isMember(userId);
      
      if (!userRole) {
        return res.status(403).json({
          success: false,
          error: 'You are not a member of this workspace'
        });
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: `Insufficient permissions. Required: ${allowedRoles.join(' or ')}, Your role: ${userRole}`
        });
      }

      // Add workspace, user role, and authenticated user to request
      req.workspace = workspace;
      req.userRole = userRole;
      req.authenticatedUser = user;
      
      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  };
};

// Check if user can manage members (owner or admin)
const canManageMembers = requireWorkspaceRole(['owner', 'admin']);

// Check if user can view workspace (any member)
const isMember = requireWorkspaceRole(['owner', 'admin', 'member', 'guest']);

// Check if user is workspace owner
const isOwner = requireWorkspaceRole(['owner']);

module.exports = {
  requireWorkspaceRole,
  canManageMembers,
  isMember,
  isOwner
};
