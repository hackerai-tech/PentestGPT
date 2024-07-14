--------------- USER_ROLE ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS user_role (
    -- RELATIONSHIPS
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (char_length(role) <= 50),

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- INDEXES --

CREATE INDEX idx_user_role_user_id ON user_role (user_id);

-- RLS --

ALTER TABLE user_role ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to own user roles"
    ON user_role
    FOR SELECT
    USING (user_id = auth.uid());


-- Let's do that later after this is rolled out to production
-- Remove role column from profiles table
-- ALTER TABLE profiles DROP COLUMN role;


-- Create a function to check if a user is a moderator
CREATE OR REPLACE FUNCTION is_moderator(test_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM user_role
    WHERE user_id = test_user_id;

    IF user_role IS NULL THEN
      RETURN FALSE;
    END IF;
    
    RETURN user_role = 'moderator';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to explain the function
COMMENT ON FUNCTION is_moderator(UUID) IS 'Checks if the given user ID belongs to a moderator';

