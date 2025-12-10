-- Migration: Create workspace_activities table
-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create workspace_activities table
CREATE TABLE IF NOT EXISTS workspace_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  target_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workspace_activities_workspace_id ON workspace_activities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_user_id ON workspace_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_created_at ON workspace_activities(created_at DESC);
