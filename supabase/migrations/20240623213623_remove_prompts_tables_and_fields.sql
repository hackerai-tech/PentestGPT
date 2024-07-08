--------------- DELETE PROMPTS ---------------

-- DROP TRIGGERS IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_prompts_updated_at') THEN
        DROP TRIGGER update_prompts_updated_at ON prompts;
    END IF;
END $$;

-- DROP POLICIES IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to own prompts') THEN
        DROP POLICY "Allow full access to own prompts" ON prompts;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow view access to non-private prompts') THEN
        DROP POLICY "Allow view access to non-private prompts" ON prompts;
    END IF;
END $$;

-- DROP INDEXES IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'prompts_user_id_idx') THEN
        DROP INDEX prompts_user_id_idx;
    END IF;
END $$;


--------------- DELETE PROMPT WORKSPACES ---------------

-- DROP TRIGGERS IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_prompt_workspaces_updated_at') THEN
        DROP TRIGGER update_prompt_workspaces_updated_at ON prompt_workspaces;
    END IF;
END $$;

-- DROP POLICIES IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to own prompt_workspaces') THEN
        DROP POLICY "Allow full access to own prompt_workspaces" ON prompt_workspaces;
    END IF;
END $$;

-- DROP INDEXES IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'prompt_workspaces_user_id_idx') THEN
        DROP INDEX prompt_workspaces_user_id_idx;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'prompt_workspaces_prompt_id_idx') THEN
        DROP INDEX prompt_workspaces_prompt_id_idx;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'prompt_workspaces_workspace_id_idx') THEN
        DROP INDEX prompt_workspaces_workspace_id_idx;
    END IF;
END $$;

-- DROP TABLE IF EXISTS --
DROP TABLE IF EXISTS prompt_workspaces;

-- DROP TABLE IF EXISTS --
DROP TABLE IF EXISTS prompts;