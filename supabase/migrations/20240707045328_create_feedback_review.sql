
-- Create feedback_reviews table
CREATE TABLE feedback_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feedback_id UUID NOT NULL REFERENCES feedback(id),
    reviewed_by UUID NOT NULL REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    UNIQUE(feedback_id)
);

-- Add index on feedback_id for faster lookups
CREATE INDEX idx_feedback_reviews_feedback_id ON feedback_reviews(feedback_id);

-- Enable row level security for feedback_reviews table
ALTER TABLE feedback_reviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only moderators to access feedback_reviews
CREATE POLICY "Allow moderators to access feedback_reviews"
ON feedback_reviews
USING (is_moderator(auth.uid()))
WITH CHECK (is_moderator(auth.uid()));

