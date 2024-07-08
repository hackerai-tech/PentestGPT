-- Add rag_used and rag_id columns to messages table
ALTER TABLE messages
ADD COLUMN rag_used BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN rag_id UUID;

-- Add rag_used and rag_id columns to feedback table
ALTER TABLE feedback
ADD COLUMN rag_used BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN rag_id UUID;
