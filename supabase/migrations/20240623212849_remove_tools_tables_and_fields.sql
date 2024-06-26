--------------- DELETE TOOLS ---------------

-- DROP TRIGGERS IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tools_updated_at') THEN
        DROP TRIGGER update_tools_updated_at ON tools;
    END IF;
END $$;

-- DROP POLICIES IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to own tools') THEN
        DROP POLICY "Allow full access to own tools" ON tools;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow view access to non-private tools') THEN
        DROP POLICY "Allow view access to non-private tools" ON tools;
    END IF;
END $$;

-- DROP INDEXES IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tools_user_id_idx') THEN
        DROP INDEX tools_user_id_idx;
    END IF;
END $$;


--------------- DELETE TOOL WORKSPACES ---------------

-- DROP TRIGGERS IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tool_workspaces_updated_at') THEN
        DROP TRIGGER update_tool_workspaces_updated_at ON tool_workspaces;
    END IF;
END $$;

-- DROP POLICIES IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to own tool_workspaces') THEN
        DROP POLICY "Allow full access to own tool_workspaces" ON tool_workspaces;
    END IF;
END $$;

-- DROP INDEXES IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tool_workspaces_user_id_idx') THEN
        DROP INDEX tool_workspaces_user_id_idx;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tool_workspaces_tool_id_idx') THEN
        DROP INDEX tool_workspaces_tool_id_idx;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'tool_workspaces_workspace_id_idx') THEN
        DROP INDEX tool_workspaces_workspace_id_idx;
    END IF;
END $$;

-- DROP TABLE IF EXISTS --
DROP TABLE IF EXISTS tool_workspaces;

--------------- REMOVE TOOL IMPROVEMENTS ---------------

-- Check and drop columns if they exist
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tools' AND column_name = 'custom_headers') THEN
        ALTER TABLE tools DROP COLUMN custom_headers;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tools' AND column_name = 'request_in_body') THEN
        ALTER TABLE tools DROP COLUMN request_in_body;
    END IF;
END $$;

-- Revert the default value change for the schema column
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tools' AND column_name = 'schema') THEN
        ALTER TABLE tools ALTER COLUMN schema SET DEFAULT NULL;
    END IF;
END $$;


-- DROP TABLE IF EXISTS --
DROP TABLE IF EXISTS tools;
