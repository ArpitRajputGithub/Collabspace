-- Add clerk_id column to users table
ALTER TABLE users 
ADD COLUMN clerk_id VARCHAR(255);

-- Create unique index for clerk_id (allows NULL values)
CREATE UNIQUE INDEX idx_users_clerk_id ON users(clerk_id);

-- Make password_hash optional for Clerk users
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Add constraint to ensure either password_hash OR clerk_id exists
ALTER TABLE users 
ADD CONSTRAINT check_auth_method 
CHECK (
  (password_hash IS NOT NULL AND clerk_id IS NULL) OR 
  (password_hash IS NULL AND clerk_id IS NOT NULL)
);

-- Add comment for documentation
COMMENT ON COLUMN users.clerk_id IS 'Clerk authentication user ID for OAuth users';
