--------------- DELETE MODELS ---------------

-- DROP TRIGGERS IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_models_updated_at') THEN
        DROP TRIGGER update_models_updated_at ON models;
    END IF;
END $$;

-- DROP POLICIES IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to own models') THEN
        DROP POLICY "Allow full access to own models" ON models;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow view access to non-private models') THEN
        DROP POLICY "Allow view access to non-private models" ON models;
    END IF;
END $$;

-- DROP INDEXES IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'models_user_id_idx') THEN
        DROP INDEX models_user_id_idx;
    END IF;
END $$;

--------------- DELETE MODEL WORKSPACES ---------------

-- DROP TRIGGERS IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_model_workspaces_updated_at') THEN
        DROP TRIGGER update_model_workspaces_updated_at ON model_workspaces;
    END IF;
END $$;

-- DROP POLICIES IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access to own model_workspaces') THEN
        DROP POLICY "Allow full access to own model_workspaces" ON model_workspaces;
    END IF;
END $$;

-- DROP INDEXES IF EXISTS --
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'model_workspaces_user_id_idx') THEN
        DROP INDEX model_workspaces_user_id_idx;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'model_workspaces_model_id_idx') THEN
        DROP INDEX model_workspaces_model_id_idx;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'model_workspaces_workspace_id_idx') THEN
        DROP INDEX model_workspaces_workspace_id_idx;
    END IF;
END $$;

-- DROP TABLE IF EXISTS --
DROP TABLE IF EXISTS model_workspaces;

-- DROP TABLE IF EXISTS --
DROP TABLE IF EXISTS models;
