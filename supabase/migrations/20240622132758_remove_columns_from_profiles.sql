-- Migration to remove specific columns from profiles table if they exist

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='anthropic_api_key') THEN
        ALTER TABLE profiles DROP COLUMN anthropic_api_key;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='azure_openai_35_turbo_id') THEN
        ALTER TABLE profiles DROP COLUMN azure_openai_35_turbo_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='azure_openai_45_turbo_id') THEN
        ALTER TABLE profiles DROP COLUMN azure_openai_45_turbo_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='azure_openai_45_vision_id') THEN
        ALTER TABLE profiles DROP COLUMN azure_openai_45_vision_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='azure_openai_api_key') THEN
        ALTER TABLE profiles DROP COLUMN azure_openai_api_key;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='azure_openai_endpoint') THEN
        ALTER TABLE profiles DROP COLUMN azure_openai_endpoint;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='use_azure_openai') THEN
        ALTER TABLE profiles DROP COLUMN use_azure_openai;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='perplexity_api_key') THEN
        ALTER TABLE profiles DROP COLUMN perplexity_api_key;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='google_gemini_api_key') THEN
        ALTER TABLE profiles DROP COLUMN google_gemini_api_key;
    END IF;
END $$;