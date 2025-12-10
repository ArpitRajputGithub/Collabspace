-- Create task statuses enum (reusable across projects)
CREATE TABLE IF NOT EXISTS task_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6b7280',
    position INTEGER NOT NULL DEFAULT 0,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, slug),
    UNIQUE(project_id, position)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    status_id UUID REFERENCES task_statuses(id),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    position INTEGER DEFAULT 0, -- For ordering within status columns
    labels JSONB DEFAULT '[]', -- Array of labels: ["bug", "feature", "urgent"]
    metadata JSONB DEFAULT '{}', -- Additional task data
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status_id ON tasks(status_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default task statuses function
CREATE OR REPLACE FUNCTION create_default_task_statuses(project_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO task_statuses (name, slug, color, position, project_id, is_default) VALUES
    ('To Do', 'todo', '#ef4444', 0, project_uuid, true),
    ('In Progress', 'in_progress', '#f59e0b', 1, project_uuid, false),
    ('Review', 'review', '#8b5cf6', 2, project_uuid, false),
    ('Done', 'done', '#10b981', 3, project_uuid, false);
END;
$$ LANGUAGE plpgsql;
