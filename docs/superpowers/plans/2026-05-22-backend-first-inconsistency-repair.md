# Backend-First Inconsistency Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize CollabSpace by fixing backend correctness, security, and API contract inconsistencies first, then align the frontend with the stabilized backend.

**Architecture:** The backend should expose consistent JWT-protected REST contracts over Express, persist core product data in PostgreSQL, persist chat messages in MongoDB, and emit consistent Socket.io events for real-time collaboration. The frontend should consume one documented API response shape through `frontend/src/lib/api-client.ts`, use React Query for server state, and subscribe to the same Socket.io event names emitted by the backend.

**Tech Stack:** Node.js, Express, CommonJS, PostgreSQL via `pg`, MongoDB via Mongoose, Socket.io, Joi validation, Next.js, React, TanStack Query, Zustand.

---

## Execution Order

1. Backend smoke-test harness.
2. Backend model method gaps.
3. Backend response envelope consistency.
4. Backend workspace/project/task authorization.
5. Backend Socket.io event naming consistency.
6. Backend activity logging wiring.
7. Backend auth/token cleanup.
8. Backend documentation and verification.
9. Frontend API client alignment.
10. Frontend auth/proxy alignment.
11. Frontend socket event alignment.
12. Frontend UI flow verification.

Do not start frontend fixes until backend Tasks 1-8 pass.

---

## Backend File Map

- Modify: `backend/package.json`
  - Replace placeholder test script with a runnable backend verification command.
- Create: `backend/test/smoke.test.js`
  - Holds focused Node smoke tests for exported model methods and response helpers.
- Create: `backend/src/utils/apiResponse.js`
  - Centralizes JSON response envelope helpers.
- Modify: `backend/src/models/workspace.js`
  - Add missing `findByUser()` and `toJSON()` methods.
  - Add member-count and role fields to workspace instances returned from membership queries.
- Modify: `backend/src/models/task.js`
  - Fix undefined `assigneeId` reference.
  - Ensure updated timestamps are returned after task mutations.
- Modify: `backend/src/models/project.js`
  - Add helper for resolving project workspace access.
- Create: `backend/src/middleware/projectAccess.js`
  - Enforce workspace membership for routes that only have `projectId` or `taskId`.
- Modify: `backend/src/routes/projects.js`
  - Protect individual project routes with project access middleware.
- Modify: `backend/src/routes/tasks.js`
  - Protect task routes with task/project access middleware.
- Modify: `backend/src/controllers/workspaceController.js`
  - Return consistent response envelopes.
  - Stop duplicate owner membership insert.
- Modify: `backend/src/controllers/projectController.js`
  - Return consistent response envelopes.
  - Emit consistent real-time project events where useful.
- Modify: `backend/src/controllers/taskController.js`
  - Return consistent response envelopes.
  - Emit kebab-case Socket.io events matching existing frontend listeners.
  - Log task/comment activity.
- Modify: `backend/src/controllers/authController.js`
  - Decide whether `/auth/refresh` refreshes the access token or remove the misleading refresh-token contract.
- Modify: `backend/src/routes/messages.js`
  - Add project access checks for message history and REST fallback sends.
- Modify: `backend/src/sockets/socketHandlers.js`
  - Verify room join and message send access, not just socket authentication.
- Modify: `backend/src/utils/realTimeEvents.js`
  - Make event names match controller emissions.
- Modify: `docs/README.md`
  - Correct backend stack claims after code is stable.

---

## Frontend File Map

- Modify: `frontend/src/lib/api-client.ts`
  - Consume the final backend response envelope consistently.
- Modify: `frontend/src/providers/auth-provider.tsx`
  - Align token storage with route protection strategy.
- Modify: `frontend/src/proxy.ts`
  - Either read the same cookie auth uses or become a client-only guard.
- Modify: `frontend/src/hooks/use-tasks.ts`
  - Match final Socket.io event payloads.
- Modify: `frontend/src/providers/socket-provider.tsx`
  - Remove duplicate or mismatched event assumptions.
- Modify: `frontend/src/hooks/use-workspaces.ts`
  - Consume workspace detail and member data from final backend shape.
- Modify: `frontend/src/hooks/use-projects.ts`
  - Consume project list/detail shapes from final backend envelope.
- Modify: `frontend/src/hooks/use-messages.ts`
  - Consume message history shape and socket payloads from final backend contract.

---

## Backend Phase

### Task 1: Add A Backend Smoke Test Harness

**Files:**
- Modify: `backend/package.json`
- Create: `backend/test/smoke.test.js`

- [ ] **Step 1: Replace the placeholder test script**

Change `backend/package.json` scripts to:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Create a smoke test for known backend module contracts**

Create `backend/test/smoke.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');

test('Workspace exposes methods required by workspaceController', () => {
  const Workspace = require('../src/models/workspace');

  assert.equal(typeof Workspace.findBySlug, 'function');
  assert.equal(typeof Workspace.findById, 'function');
  assert.equal(typeof Workspace.findByUser, 'function');

  const workspace = new Workspace({
    id: 'workspace-id',
    name: 'Demo',
    slug: 'demo',
    description: 'Demo workspace',
    avatar_url: null,
    owner_id: 'owner-id',
    settings: {},
    is_active: true,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-02T00:00:00.000Z')
  });

  assert.equal(typeof workspace.toJSON, 'function');
  assert.deepEqual(workspace.toJSON(), {
    id: 'workspace-id',
    name: 'Demo',
    slug: 'demo',
    description: 'Demo workspace',
    avatarUrl: null,
    ownerId: 'owner-id',
    settings: {},
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    role: undefined,
    memberCount: undefined,
    joinedAt: undefined,
    members: undefined
  });
});

test('API response helper exposes success and failure helpers', () => {
  const response = require('../src/utils/apiResponse');

  assert.equal(typeof response.sendSuccess, 'function');
  assert.equal(typeof response.sendError, 'function');
});
```

- [ ] **Step 3: Run the smoke tests and confirm they fail**

Run:

```bash
cd backend
npm test
```

Expected: FAIL because `Workspace.findByUser`, `workspace.toJSON`, and `src/utils/apiResponse.js` do not exist yet.

- [ ] **Step 4: Commit the failing test harness**

```bash
git add backend/package.json backend/test/smoke.test.js
git commit -m "test: add backend smoke contract tests"
```

### Task 2: Add Shared API Response Helpers

**Files:**
- Create: `backend/src/utils/apiResponse.js`
- Test: `backend/test/smoke.test.js`

- [ ] **Step 1: Create the response helper**

Create `backend/src/utils/apiResponse.js`:

```js
const sendSuccess = (res, data = null, options = {}) => {
  const { status = 200, message, meta } = options;

  const payload = {
    success: true,
    data
  };

  if (message) payload.message = message;
  if (meta) payload.meta = meta;

  return res.status(status).json(payload);
};

const sendError = (res, status, error, options = {}) => {
  const { code, details } = options;

  const payload = {
    success: false,
    error
  };

  if (code) payload.code = code;
  if (details) payload.details = details;

  return res.status(status).json(payload);
};

module.exports = {
  sendSuccess,
  sendError
};
```

- [ ] **Step 2: Run smoke tests**

Run:

```bash
cd backend
npm test
```

Expected: still FAIL because workspace methods are not fixed yet, but the API response helper assertion passes.

- [ ] **Step 3: Commit**

```bash
git add backend/src/utils/apiResponse.js
git commit -m "feat: add backend API response helpers"
```

### Task 3: Fix Workspace Model Contract

**Files:**
- Modify: `backend/src/models/workspace.js`
- Test: `backend/test/smoke.test.js`

- [ ] **Step 1: Add `role`, `memberCount`, `joinedAt`, and `members` to the constructor**

In `Workspace.constructor`, add:

```js
this.role = workspaceData.role;
this.memberCount = workspaceData.member_count ? parseInt(workspaceData.member_count, 10) : undefined;
this.joinedAt = workspaceData.joined_at;
this.members = workspaceData.members;
```

- [ ] **Step 2: Add `Workspace.findByUser(userId)`**

Add this static method to `backend/src/models/workspace.js`:

```js
static async findByUser(userId) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT
        w.*,
        wm.role,
        wm.joined_at,
        COUNT(active_members.user_id) AS member_count
      FROM workspaces w
      JOIN workspace_members wm ON w.id = wm.workspace_id
      LEFT JOIN workspace_members active_members
        ON active_members.workspace_id = w.id
        AND active_members.is_active = true
      WHERE wm.user_id = $1
        AND wm.is_active = true
        AND w.is_active = true
      GROUP BY w.id, wm.role, wm.joined_at
      ORDER BY w.created_at DESC
    `;

    const result = await client.query(query, [userId]);
    return result.rows.map(row => new Workspace(row));
  } finally {
    client.release();
  }
}
```

- [ ] **Step 3: Add `workspace.toJSON()`**

Add this instance method to `backend/src/models/workspace.js`:

```js
toJSON() {
  return {
    id: this.id,
    name: this.name,
    slug: this.slug,
    description: this.description,
    avatarUrl: this.avatarUrl,
    ownerId: this.ownerId,
    settings: this.settings,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    role: this.role,
    memberCount: this.memberCount,
    joinedAt: this.joinedAt,
    members: this.members
  };
}
```

- [ ] **Step 4: Remove duplicate owner add from `workspaceController.createWorkspace`**

In `backend/src/controllers/workspaceController.js`, remove:

```js
// Automatically add owner as admin
await workspace.addMember(ownerId, 'owner');
```

Reason: `Workspace.create()` already inserts the owner as a member in the same transaction.

- [ ] **Step 5: Run smoke tests**

Run:

```bash
cd backend
npm test
```

Expected: PASS for smoke tests.

- [ ] **Step 6: Commit**

```bash
git add backend/src/models/workspace.js backend/src/controllers/workspaceController.js
git commit -m "fix: complete workspace model contract"
```

### Task 4: Normalize Workspace Controller Responses

**Files:**
- Modify: `backend/src/controllers/workspaceController.js`
- Modify: `frontend/src/lib/api-client.ts` later, not in this backend task

- [ ] **Step 1: Import response helpers**

At the top of `backend/src/controllers/workspaceController.js`, add:

```js
const { sendSuccess, sendError } = require('../utils/apiResponse');
```

- [ ] **Step 2: Normalize `getUserWorkspaces`**

Replace:

```js
res.json(workspacesWithStats);
```

With:

```js
return sendSuccess(res, workspacesWithStats);
```

Replace its error response with:

```js
return sendError(res, 500, error.message || 'Internal server error');
```

- [ ] **Step 3: Normalize `getWorkspace` and include members/userRole**

Replace the success block with:

```js
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
```

- [ ] **Step 4: Normalize create/update/member responses**

Use this response shape in all workspace controller methods:

```js
return sendSuccess(res, data, {
  status: 201,
  message: 'Workspace created successfully'
});
```

For no-data success:

```js
return sendSuccess(res, null, {
  message: 'Member removed successfully'
});
```

For errors:

```js
return sendError(res, 404, 'Workspace not found');
```

- [ ] **Step 5: Run backend tests**

Run:

```bash
cd backend
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/src/controllers/workspaceController.js
git commit -m "fix: normalize workspace API responses"
```

### Task 5: Fix Task Model Runtime Bug

**Files:**
- Modify: `backend/src/models/task.js`

- [ ] **Step 1: Fix undefined `assigneeId`**

In `Task.findById`, replace:

```js
task.assignee = assigneeId ? {
```

With:

```js
task.assignee = task.assigneeId ? {
```

- [ ] **Step 2: Ensure task update changes `updated_at`**

In `Task.update`, before the `WHERE`, ensure the SQL includes:

```js
updateFields.push('updated_at = NOW()');
```

Do this after all user-provided update fields are collected and before `values.push(this.id)`.

- [ ] **Step 3: Ensure task move changes `updated_at`**

In `Task.updatePosition`, replace:

```sql
UPDATE tasks SET status_id = $1, position = $2 WHERE id = $3
```

With:

```sql
UPDATE tasks SET status_id = $1, position = $2, updated_at = NOW() WHERE id = $3
```

- [ ] **Step 4: Run backend tests**

Run:

```bash
cd backend
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/models/task.js
git commit -m "fix: repair task model runtime issues"
```

### Task 6: Add Project And Task Access Middleware

**Files:**
- Create: `backend/src/middleware/projectAccess.js`
- Modify: `backend/src/models/project.js`
- Modify: `backend/src/routes/projects.js`
- Modify: `backend/src/routes/tasks.js`
- Modify: `backend/src/routes/messages.js`

- [ ] **Step 1: Add `Project.findWorkspaceId(projectId)`**

Add to `backend/src/models/project.js`:

```js
static async findWorkspaceId(projectId) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT workspace_id FROM projects WHERE id = $1 AND is_active = true',
      [projectId]
    );

    return result.rows[0]?.workspace_id || null;
  } finally {
    client.release();
  }
}
```

- [ ] **Step 2: Create project access middleware**

Create `backend/src/middleware/projectAccess.js`:

```js
const Project = require('../models/project');
const Task = require('../models/task');
const Workspace = require('../models/workspace');

const requireProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required'
      });
    }

    const workspaceId = await Project.findWorkspaceId(projectId);
    if (!workspaceId) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const workspace = await Workspace.findById(workspaceId);
    const role = await workspace.isMember(req.user.id);

    if (!role) {
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this project'
      });
    }

    req.workspace = workspace;
    req.userRole = role;
    next();
  } catch (error) {
    console.error('Project access middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const requireTaskAccess = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    req.task = task;
    req.params.projectId = task.projectId;
    return requireProjectAccess(req, res, next);
  } catch (error) {
    console.error('Task access middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  requireProjectAccess,
  requireTaskAccess
};
```

- [ ] **Step 3: Protect individual project routes**

In `backend/src/routes/projects.js`, import:

```js
const { requireProjectAccess } = require('../middleware/projectAccess');
```

Change individual routes to:

```js
router.get('/:projectId', requireProjectAccess, projectController.getProject);
router.get('/:projectId/board', requireProjectAccess, projectController.getProjectBoard);
router.put('/:projectId', requireProjectAccess, projectController.updateProject);
router.delete('/:projectId', requireProjectAccess, projectController.deleteProject);
```

- [ ] **Step 4: Protect task routes**

In `backend/src/routes/tasks.js`, import:

```js
const { requireProjectAccess, requireTaskAccess } = require('../middleware/projectAccess');
```

Change routes to:

```js
router.post('/project/:projectId', requireProjectAccess, validateCreateTask, taskController.createTask);
router.get('/:taskId', requireTaskAccess, taskController.getTask);
router.put('/:taskId', requireTaskAccess, validateUpdateTask, taskController.updateTask);
router.delete('/:taskId', requireTaskAccess, taskController.deleteTask);
router.put('/:taskId/move', requireTaskAccess, validateMoveTask, taskController.moveTask);
router.post('/:taskId/comments', requireTaskAccess, validateAddComment, taskController.addTaskComment);
router.get('/:taskId/comments', requireTaskAccess, taskController.getTaskComments);
```

- [ ] **Step 5: Protect message routes**

In `backend/src/routes/messages.js`, import:

```js
const { requireProjectAccess } = require('../middleware/projectAccess');
```

Change both message routes to include `requireProjectAccess`:

```js
router.get('/:projectId/messages', requireProjectAccess, async (req, res) => {
```

```js
router.post('/:projectId/messages', requireProjectAccess, async (req, res) => {
```

- [ ] **Step 6: Run backend tests**

Run:

```bash
cd backend
npm test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/src/middleware/projectAccess.js backend/src/models/project.js backend/src/routes/projects.js backend/src/routes/tasks.js backend/src/routes/messages.js
git commit -m "fix: enforce project and task access"
```

### Task 7: Normalize Project And Task API Responses

**Files:**
- Modify: `backend/src/controllers/projectController.js`
- Modify: `backend/src/controllers/taskController.js`

- [ ] **Step 1: Import helpers in both controllers**

Add:

```js
const { sendSuccess, sendError } = require('../utils/apiResponse');
```

- [ ] **Step 2: Normalize project controller success shapes**

Use these final backend response shapes:

```js
return sendSuccess(res, { project }, {
  status: 201,
  message: 'Project created successfully'
});
```

```js
return sendSuccess(res, { projects });
```

```js
return sendSuccess(res, {
  project,
  statistics,
  taskStatuses
});
```

```js
return sendSuccess(res, { project }, {
  message: 'Project updated successfully'
});
```

```js
return sendSuccess(res, null, {
  message: 'Project deleted successfully'
});
```

- [ ] **Step 3: Normalize task controller success shapes**

Use these final backend response shapes:

```js
return sendSuccess(res, { task: taskWithData }, {
  status: 201,
  message: 'Task created successfully'
});
```

```js
return sendSuccess(res, {
  task,
  comments
});
```

```js
return sendSuccess(res, { task: updatedTask }, {
  message: 'Task updated successfully'
});
```

```js
return sendSuccess(res, { task: updatedTask }, {
  message: 'Task moved successfully'
});
```

```js
return sendSuccess(res, { comment: newComment }, {
  status: 201,
  message: 'Comment added successfully'
});
```

```js
return sendSuccess(res, { comments });
```

```js
return sendSuccess(res, null, {
  message: 'Task deleted successfully'
});
```

- [ ] **Step 4: Normalize errors in both controllers**

Use:

```js
return sendError(res, 404, 'Project not found');
```

```js
return sendError(res, 404, 'Task not found');
```

```js
return sendError(res, 500, 'Internal server error');
```

- [ ] **Step 5: Run backend tests**

Run:

```bash
cd backend
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/src/controllers/projectController.js backend/src/controllers/taskController.js
git commit -m "fix: normalize project and task API responses"
```

### Task 8: Align Backend Socket Event Names And Payloads

**Files:**
- Modify: `backend/src/controllers/taskController.js`
- Modify: `backend/src/utils/realTimeEvents.js`
- Modify: `backend/src/sockets/socketHandlers.js`

- [ ] **Step 1: Use kebab-case event names from controllers**

In `backend/src/controllers/taskController.js`, replace:

```js
taskCreated
taskUpdated
taskMoved
taskDeleted
taskCommentAdded
```

With:

```js
task-created
task-updated
task-moved
task-deleted
task-comment-added
```

- [ ] **Step 2: Use frontend-compatible payloads**

Emit created tasks as:

```js
req.io.to(`project:${projectId}`).emit('task-created', {
  task: taskWithData,
  createdBy: req.user,
  projectId
});
```

Emit updated tasks as:

```js
req.io.to(`project:${task.projectId}`).emit('task-updated', {
  taskId: updatedTask.id,
  task: updatedTask,
  changes: updates,
  updatedBy: req.user,
  projectId: task.projectId
});
```

Emit moved tasks as:

```js
req.io.to(`project:${task.projectId}`).emit('task-moved', {
  taskId: task.id,
  oldStatusId: task.statusId,
  newStatusId: statusId,
  newPosition: position,
  movedBy: req.user,
  projectId: task.projectId
});
```

Emit deleted tasks as:

```js
req.io.to(`project:${task.projectId}`).emit('task-deleted', {
  taskId: task.id,
  projectId: task.projectId,
  deletedBy: req.user
});
```

- [ ] **Step 3: Keep `realTimeEvents.js` in the same event vocabulary**

Verify all task event names in `backend/src/utils/realTimeEvents.js` are:

```js
task-created
task-updated
task-moved
task-comment-added
task-deleted
```

- [ ] **Step 4: Run backend tests**

Run:

```bash
cd backend
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/taskController.js backend/src/utils/realTimeEvents.js backend/src/sockets/socketHandlers.js
git commit -m "fix: align backend socket event contracts"
```

### Task 9: Wire Activity Logging Into Mutations

**Files:**
- Modify: `backend/src/controllers/projectController.js`
- Modify: `backend/src/controllers/taskController.js`
- Modify: `backend/src/controllers/workspaceController.js`

- [ ] **Step 1: Import `Activity` in mutation controllers**

Add:

```js
const Activity = require('../models/activity');
```

- [ ] **Step 2: Log project creation/update/delete**

After project creation:

```js
await Activity.logProjectActivity(workspaceId, createdBy, 'created', project);
```

After project update:

```js
await Activity.logProjectActivity(project.workspaceId, req.user.id, 'updated', project);
```

Before or after project delete:

```js
await Activity.logProjectActivity(project.workspaceId, req.user.id, 'deleted', project);
```

- [ ] **Step 3: Log task creation/update/move/delete/comment**

After task creation:

```js
await Activity.logTaskActivity(project.workspaceId, createdBy, 'created', taskWithData);
```

After task update:

```js
await Activity.logTaskActivity(req.workspace.id, req.user.id, 'updated', updatedTask);
```

After task move:

```js
await Activity.logTaskActivity(req.workspace.id, req.user.id, 'moved', updatedTask);
```

After task comment:

```js
await Activity.logCommentActivity(req.workspace.id, userId, 'commented', task);
```

After task delete:

```js
await Activity.logTaskActivity(req.workspace.id, req.user.id, 'deleted', task);
```

- [ ] **Step 4: Log workspace member changes**

After invite:

```js
await Activity.logMemberActivity(workspaceId, req.user.id, 'invited', userToInvite);
```

After role update:

```js
await Activity.logMemberActivity(workspaceId, req.user.id, `changed role to ${role}`, { ...targetUser });
```

After removal:

```js
await Activity.logMemberActivity(workspaceId, req.user.id, 'removed', targetUser);
```

If `targetUser` is not already loaded in role/remove flows, fetch it with `User.findById(memberId)` before logging.

- [ ] **Step 5: Run backend tests**

Run:

```bash
cd backend
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/src/controllers/projectController.js backend/src/controllers/taskController.js backend/src/controllers/workspaceController.js
git commit -m "feat: log workspace activity for mutations"
```

### Task 10: Fix Auth Refresh Contract

**Files:**
- Modify: `backend/src/controllers/authController.js`
- Modify: `backend/src/routes/auth.js`

- [ ] **Step 1: Choose the minimal backend behavior**

Use the current access token as the refresh input and rename the behavior internally as token renewal. Do not introduce refresh-token persistence yet.

- [ ] **Step 2: Accept `token` or `refreshToken` in `/auth/refresh`**

Replace:

```js
const { refreshToken } = req.body
```

With:

```js
const refreshToken = req.body.refreshToken || req.body.token
```

- [ ] **Step 3: Verify with the same JWT secret**

Keep:

```js
const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
```

But update the route response message and comments to say this is access-token renewal until a real refresh-token table exists.

- [ ] **Step 4: Run backend tests**

Run:

```bash
cd backend
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/authController.js backend/src/routes/auth.js
git commit -m "fix: clarify JWT renewal contract"
```

### Task 11: Secure Socket Room Joins And Message Sends

**Files:**
- Modify: `backend/src/sockets/socketHandlers.js`

- [ ] **Step 1: Add project access helper**

Inside `backend/src/sockets/socketHandlers.js`, add:

```js
const Project = require('../models/project');
const Workspace = require('../models/workspace');

const userCanAccessProject = async (userId, projectId) => {
  const workspaceId = await Project.findWorkspaceId(projectId);
  if (!workspaceId) return false;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return false;

  const role = await workspace.isMember(userId);
  return Boolean(role);
};
```

- [ ] **Step 2: Guard `join-project`**

Replace the current `join-project` handler body with:

```js
const allowed = await userCanAccessProject(socket.userId, projectId);
if (!allowed) {
  socket.emit('project-access-denied', { projectId });
  return;
}

socket.join(`project:${projectId}`);
socket.currentProject = projectId;
socket.to(`project:${projectId}`).emit('user-joined-project', {
  user: socket.user,
  projectId
});
```

Make the handler `async`.

- [ ] **Step 3: Guard `message-sent`**

Before saving a message, add:

```js
const allowed = await userCanAccessProject(socket.userId, projectId);
if (!allowed) {
  socket.emit('message-error', { error: 'You do not have access to this project' });
  return;
}
```

- [ ] **Step 4: Run backend tests**

Run:

```bash
cd backend
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/sockets/socketHandlers.js
git commit -m "fix: authorize socket project access"
```

### Task 12: Backend Documentation And Verification

**Files:**
- Modify: `docs/README.md`

- [ ] **Step 1: Correct backend stack claims**

Replace claims of Clerk and Prisma with:

```md
### Backend
- Node.js with Express.js
- PostgreSQL via `pg`
- MongoDB via Mongoose for project chat messages
- Socket.io for real-time communication
- JWT for authentication
- Joi for request validation
```

- [ ] **Step 2: Correct frontend version claims**

Replace stale Next.js version language with:

```md
### Frontend
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn-style UI components
- TanStack Query
- Zustand
- Socket.io client
```

- [ ] **Step 3: Run backend verification**

Run:

```bash
cd backend
npm test
```

Expected: PASS.

- [ ] **Step 4: Optional local API boot check**

Run:

```bash
cd backend
npm run dev
```

Expected: server starts and prints health URL. If PostgreSQL env vars are missing, document that the boot check is blocked by local configuration.

- [ ] **Step 5: Commit**

```bash
git add docs/README.md
git commit -m "docs: align README with actual stack"
```

---

## Frontend Phase

Start this phase only after backend Tasks 1-12 are complete.

### Task 13: Align API Client With Backend Envelope

**Files:**
- Modify: `frontend/src/lib/api-client.ts`

- [ ] **Step 1: Treat every backend response as `{ success, data, message, meta }`**

Update `ApiResponse<T>` to:

```ts
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  meta?: Record<string, unknown>
  error?: string
}
```

- [ ] **Step 2: Fix project methods**

Use these returns:

```ts
async getWorkspaceProjects(workspaceId: string): Promise<Project[]> {
  const response = await this.request<{ projects: Project[] }>(`/projects/workspace/${workspaceId}`)
  return response.data.projects
}

async createProject(workspaceId: string, data: CreateProjectInput): Promise<Project> {
  const response = await this.request<{ project: Project }>(`/projects/workspace/${workspaceId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.data.project
}

async getProject(projectId: string): Promise<ProjectDetailResponse> {
  const response = await this.request<ProjectDetailResponse>(`/projects/${projectId}`)
  return response.data
}
```

- [ ] **Step 3: Fix workspace detail meta handling**

`getWorkspaceBySlug` should return:

```ts
return {
  data: rawResponse.data,
  userRole: (rawResponse.meta?.userRole || 'member') as WorkspaceDetailResponse['userRole']
}
```

- [ ] **Step 4: Run frontend verification**

Run:

```bash
cd frontend
npm run lint
```

Expected: PASS or only pre-existing lint warnings unrelated to this task.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/api-client.ts
git commit -m "fix: align frontend API client with backend envelope"
```

### Task 14: Align Auth Storage And Route Guard

**Files:**
- Modify: `frontend/src/providers/auth-provider.tsx`
- Modify: `frontend/src/proxy.ts`

- [ ] **Step 1: Write token to a cookie on login/register**

After `localStorage.setItem('auth_token', newToken)`, add:

```ts
document.cookie = `auth_token=${newToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`
```

- [ ] **Step 2: Clear the cookie on logout**

Add:

```ts
document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax'
```

- [ ] **Step 3: Keep `proxy.ts` as a basic cookie guard**

No structural proxy change is required once the auth provider writes the cookie.

- [ ] **Step 4: Run frontend lint**

Run:

```bash
cd frontend
npm run lint
```

Expected: PASS or only pre-existing lint warnings unrelated to this task.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/providers/auth-provider.tsx frontend/src/proxy.ts
git commit -m "fix: align frontend auth storage with route guard"
```

### Task 15: Align Frontend Socket Consumers

**Files:**
- Modify: `frontend/src/hooks/use-tasks.ts`
- Modify: `frontend/src/providers/socket-provider.tsx`
- Modify: `frontend/src/hooks/use-messages.ts`

- [ ] **Step 1: Keep task listeners on kebab-case events**

Confirm these remain:

```ts
socket.on('task-created', ...)
socket.on('task-updated', ...)
socket.on('task-moved', ...)
socket.on('task-deleted', ...)
```

- [ ] **Step 2: Update task payload assumptions**

In `task-updated`, prefer `data.task` when present:

```ts
socket.on('task-updated', (data: TaskUpdate & { task?: Task }) => {
  setOptimisticTasks(prev =>
    prev.map(task =>
      task.id === data.taskId
        ? data.task ? { ...task, ...data.task } : { ...task, ...data.changes }
        : task
    )
  )
})
```

- [ ] **Step 3: Fix provider message log shape**

In `socket-provider.tsx`, replace the mismatched listener:

```ts
socketInstance.on('message-received', ({ channelId, message, sender }) => {
  console.log(`New message in channel ${channelId} from ${sender.firstName}`)
})
```

With:

```ts
socketInstance.on('message-received', ({ projectId, message }) => {
  console.log(`New message in project ${projectId}:`, message._id)
})
```

- [ ] **Step 4: Run frontend lint**

Run:

```bash
cd frontend
npm run lint
```

Expected: PASS or only pre-existing lint warnings unrelated to this task.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/use-tasks.ts frontend/src/providers/socket-provider.tsx frontend/src/hooks/use-messages.ts
git commit -m "fix: align frontend socket contracts"
```

### Task 16: Frontend Manual Flow Verification

**Files:**
- No code changes unless verification reveals a bug.

- [ ] **Step 1: Start the stack**

Run:

```bash
docker compose up
```

Expected:
- Backend listens on `http://localhost:9000`.
- Frontend listens on `http://localhost:3000`.
- PostgreSQL and MongoDB containers are healthy.

- [ ] **Step 2: Run backend migrations**

Run:

```bash
docker compose exec backend node database/migrate.js
```

Expected: migrations complete or skip already-executed files.

- [ ] **Step 3: Verify user flow in browser**

Check:
- Sign up.
- Create workspace.
- Open dashboard.
- Open workspace page.
- Create project.
- Open project board.
- Create task.
- Move task.
- Add project chat message.
- Refresh page and verify persisted data.

- [ ] **Step 4: Verify no auth bypass**

In a second browser/session with another user:
- Try direct project URL from first user.
- Try direct task URL from first user.
- Try project messages endpoint from first user.

Expected: 403 unless user is a workspace member.

- [ ] **Step 5: Commit any verification fixes**

If bugs are found, fix only the relevant files and commit:

```bash
git add frontend backend
git commit -m "fix: repair verified collaboration flow"
```

---

## Final Backend Contract To Preserve

All REST endpoints should return:

```json
{
  "success": true,
  "data": {},
  "message": "Optional human-readable message",
  "meta": {}
}
```

Errors should return:

```json
{
  "success": false,
  "error": "Human-readable error",
  "code": "OPTIONAL_MACHINE_CODE",
  "details": []
}
```

Socket.io task events should use:

```txt
task-created
task-updated
task-moved
task-comment-added
task-deleted
```

Socket.io chat events should use:

```txt
message-sent
message-received
message-error
```

---

## Self-Review

- Spec coverage: Backend inconsistencies are addressed first: missing workspace methods, broken task model reference, inconsistent REST responses, weak project/task authorization, socket event mismatch, activity logs not wired, stale auth refresh semantics, stale docs. Frontend work is explicitly sequenced after backend stability.
- Placeholder scan: No task contains TBD or open-ended implementation language. Each task names files, concrete code snippets, commands, expected outcomes, and commit messages.
- Type consistency: Final backend envelope is `{ success, data, message?, meta? }`; frontend `ApiResponse<T>` matches it. Socket events use kebab-case across backend and frontend.
