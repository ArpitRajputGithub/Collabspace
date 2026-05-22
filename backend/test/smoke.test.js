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
