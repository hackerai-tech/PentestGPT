-- REMOVE COLLECTIONS

-- DROP TRIGGERS FOR COLLECTIONS
DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
DROP TRIGGER IF EXISTS update_collection_workspaces_updated_at ON collection_workspaces;
DROP TRIGGER IF EXISTS update_collection_files_updated_at ON collection_files;

-- DROP POLICIES FOR COLLECTIONS
-- DROP POLICY IF EXISTS "Allow full access to own collections" ON collections;
-- DROP POLICY IF EXISTS "Allow view access to non-private collections" ON collections;
-- DROP POLICY IF EXISTS "Allow full access to own collection_workspaces" ON collection_workspaces;
-- DROP POLICY IF EXISTS "Allow view access to collection files for non-private collections" ON collection_files;
-- DROP POLICY IF EXISTS "Allow full access to own collection_files" ON collection_files;

-- DROP INDEXES FOR COLLECTION FILES
DROP INDEX IF EXISTS collection_files_pkey;
DROP INDEX IF EXISTS idx_collection_files_collection_id;
DROP INDEX IF EXISTS idx_collection_files_file_id;

-- DROP INDEXES FOR COLLECTION WORKSPACES
DROP INDEX IF EXISTS collection_workspaces_collection_id_idx;
DROP INDEX IF EXISTS collection_workspaces_pkey;
DROP INDEX IF EXISTS collection_workspaces_user_id_idx;
DROP INDEX IF EXISTS collection_workspaces_workspace_id_idx;

-- DROP INDEXES FOR COLLECTIONS
DROP INDEX IF EXISTS collections_pkey;
DROP INDEX IF EXISTS collections_user_id_idx;

-- DROP TABLES FOR COLLECTIONS
DROP TABLE IF EXISTS collection_files;
DROP TABLE IF EXISTS collection_workspaces;
DROP TABLE IF EXISTS collections;