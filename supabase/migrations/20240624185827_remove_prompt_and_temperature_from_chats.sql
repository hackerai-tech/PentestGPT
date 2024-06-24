-- Remove 'prompt' column if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chats' AND column_name = 'prompt') THEN
        ALTER TABLE chats DROP COLUMN prompt;
    END IF;
END $$;

-- Remove 'temperature' column if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chats' AND column_name = 'temperature') THEN
        ALTER TABLE chats DROP COLUMN temperature;
    END IF;
END $$;
