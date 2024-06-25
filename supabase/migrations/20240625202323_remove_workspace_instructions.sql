CREATE OR REPLACE FUNCTION create_profile_and_workspace() 
RETURNS TRIGGER
security definer set search_path = public
AS $$
DECLARE
    random_username TEXT;
BEGIN
    -- Generate a random username
    random_username := 'user' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);

    -- Create a profile for the new user
    INSERT INTO public.profiles(user_id, has_onboarded, image_url, image_path, mistral_api_key, display_name, bio, openai_api_key, openai_organization_id, profile_context, username)
    VALUES(
        NEW.id,
        FALSE,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        random_username
    );

    -- Create the home workspace for the new user
    INSERT INTO public.workspaces(user_id, is_home, name, default_context_length, default_model, default_prompt, default_temperature, description, embeddings_provider, include_profile_context)
    VALUES(
        NEW.id,
        TRUE,
        'Home',
        1024,
        'mistral-medium',
        'You are a friendly, helpful AI assistant.',
        0.4,
        'My home workspace.',
        'openai',
        TRUE
    );

    RETURN NEW;
END;
$$ language 'plpgsql';



CREATE OR REPLACE FUNCTION create_profile_and_workspace() 
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    random_username TEXT;
BEGIN
    -- Generate a random username
    random_username := 'user' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);

    -- Create a profile for the new user
    INSERT INTO public.profiles(user_id, has_onboarded, image_url, image_path, mistral_api_key, display_name, bio, openai_api_key, openai_organization_id, profile_context, username)
    VALUES(
        NEW.id,
        FALSE,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        random_username
    );

    INSERT INTO public.workspaces(user_id, is_home, name, default_context_length, default_model, default_prompt, default_temperature, description, embeddings_provider, include_profile_context)
    VALUES(
        NEW.id,
        TRUE,
        'Home',
        4096,
        'gpt-4-turbo-preview', -- Updated default model
        'You are a friendly, helpful AI assistant.',
        0.5,
        'My home workspace.',
        'openai',
        TRUE
    );

    RETURN NEW;
END;
$$;


-- Remove columns from workspaces table
ALTER TABLE workspaces
DROP COLUMN IF EXISTS include_workspace_instructions,
DROP COLUMN IF EXISTS instructions;

-- Remove column from chats table
ALTER TABLE chats
DROP COLUMN IF EXISTS include_workspace_instructions;
