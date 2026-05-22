const Workspace = require('../models/workspace');
const User = require('../models/user');
const Activity = require('../models/activity');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Helper function to get user from JWT auth
const getAuthenticatedUser = async (req) => {
  // RBAC middleware provides this for workspace-specific routes
  if (req.authenticatedUser) {
    return req.authenticatedUser;
  }
  
  // For routes without RBAC (like createWorkspace, getUserWorkspaces)
  if (req.user && req.user.id) {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new Error('User not found in database');
    }
    return user;
  } else {
    throw new Error('No authentication found');
  }
};

// Create new workspace
const createWorkspace = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    
    // Get user from JWT auth
    const user = await getAuthenticatedUser(req);
    const ownerId = user.id;

    // Check if slug is already taken
    const existingWorkspace = await Workspace.findBySlug(slug);
    if (existingWorkspace) {
      return sendError(res, 409, 'Workspace slug is already taken');
    }

    // Create workspace
    const workspace = await Workspace.create({
      name,
      slug,
      description,
      ownerId
    });

    return sendSuccess(res, {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        createdAt: workspace.createdAt
    }, {
      status: 201,
      message: 'Workspace created successfully'
    });

  } catch (error) {
    console.error('Create workspace error:', error);
    return sendError(res, 500, error.message || 'Internal server error while creating workspace');
  }
};

// Get user's workspaces
const getUserWorkspaces = async (req, res) => {
  try {
    // Get user from JWT auth
    const user = await getAuthenticatedUser(req);
    const userId = user.id;

    const workspaces = await Workspace.findByUser(userId);

    // Get statistics for each workspace
    const workspacesWithStats = await Promise.all(
      workspaces.map(async (workspace) => {
        try {
          const stats = await workspace.getStatistics();
          return {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            description: workspace.description,
            avatarUrl: workspace.avatarUrl,
            role: workspace.role,
            memberCount: workspace.memberCount,
            joinedAt: workspace.joinedAt,
            createdAt: workspace.createdAt,
            projectCount: stats.projectCount || 0,
            taskProgress: stats.taskProgress || 0
          };
        } catch (statsError) {
          console.error('Error fetching stats for workspace:', workspace.id, statsError);
          return {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            description: workspace.description,
            avatarUrl: workspace.avatarUrl,
            role: workspace.role,
            memberCount: workspace.memberCount,
            joinedAt: workspace.joinedAt,
            createdAt: workspace.createdAt,
            projectCount: 0,
            taskProgress: 0
          };
        }
      })
    );

    return sendSuccess(res, workspacesWithStats);

  } catch (error) {
    console.error('Get workspaces error:', error);
    return sendError(res, 500, error.message || 'Internal server error');
  }
};

// Get single workspace
const getWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return sendError(res, 404, 'Workspace not found');
    }

    const members = await workspace.getMembers();
    workspace.members = members.map(member => ({
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      email: member.email,
      avatarUrl: member.avatar_url,
      role: member.role,
      joinedAt: member.joined_at
    }));

    return sendSuccess(res, workspace.toJSON(), {
      meta: {
        userRole: req.userRole
      }
    });

  } catch (error) {
    console.error('Get workspace error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// Update workspace
const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const updates = req.body;
    
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return sendError(res, 404, 'Workspace not found');
    }

    await workspace.update(updates);

    return sendSuccess(res, workspace.toJSON(), {
      message: 'Workspace updated successfully'
    });

  } catch (error) {
    console.error('Update workspace error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// Invite member to workspace
const inviteMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role = 'member' } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return sendError(res, 404, 'Workspace not found');
    }

    // Find user by email
    const userToInvite = await User.findByEmail(email);
    if (!userToInvite) {
      return sendError(res, 404, 'User not found');
    }

    // Check if already a member
    const existingRole = await workspace.isMember(userToInvite.id);
    if (existingRole) {
      return sendError(res, 400, 'User is already a member of this workspace');
    }

    // Add member
    await workspace.addMember(userToInvite.id, role);
    await Activity.logMemberActivity(workspaceId, req.authenticatedUser.id, 'invited', userToInvite);

    return sendSuccess(res, {
        id: userToInvite.id,
        firstName: userToInvite.firstName,
        lastName: userToInvite.lastName,
        email: userToInvite.email,
        role
    }, {
      status: 201,
      message: 'Member invited successfully'
    });

  } catch (error) {
    console.error('Invite member error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// Update member role
const updateMemberRole = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return sendError(res, 404, 'Workspace not found');
    }

    // Check if target user is a member
    const currentRole = await workspace.isMember(memberId);
    if (!currentRole) {
      return sendError(res, 404, 'User is not a member of this workspace');
    }

    // Prevent changing owner's role
    if (currentRole === 'owner') {
      return sendError(res, 403, 'Cannot change the role of the workspace owner');
    }

    await workspace.updateMemberRole(memberId, role);
    const targetUser = await User.findById(memberId);
    if (targetUser) {
      await Activity.logMemberActivity(workspaceId, req.authenticatedUser.id, `changed role to ${role}`, targetUser);
    }

    return sendSuccess(res, null, {
      message: 'Member role updated successfully'
    });

  } catch (error) {
    console.error('Update member role error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

// Remove member from workspace
const removeMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return sendError(res, 404, 'Workspace not found');
    }

    // Check if target user is a member
    const currentRole = await workspace.isMember(memberId);
    if (!currentRole) {
      return sendError(res, 404, 'User is not a member of this workspace');
    }

    // Prevent removing owner
    if (currentRole === 'owner') {
      return sendError(res, 403, 'Cannot remove the workspace owner');
    }

    const targetUser = await User.findById(memberId);
    await workspace.removeMember(memberId);
    if (targetUser) {
      await Activity.logMemberActivity(workspaceId, req.authenticatedUser.id, 'removed', targetUser);
    }

    return sendSuccess(res, null, {
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

module.exports = {
  createWorkspace,
  getUserWorkspaces,
  getWorkspace,
  updateWorkspace,
  inviteMember,
  updateMemberRole,
  removeMember
};
