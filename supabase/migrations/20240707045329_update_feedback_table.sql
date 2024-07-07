-- Create index on feedback column
CREATE INDEX idx_feedback_feedback ON feedback(feedback);

-- Create index on reason column
CREATE INDEX idx_feedback_reason ON feedback(reason);

-- Create index on model column
CREATE INDEX idx_feedback_model ON feedback(model);

-- Create index on plugin column
CREATE INDEX idx_feedback_plugin ON feedback(plugin);

-- Create index on rag_used column
CREATE INDEX idx_feedback_rag_used ON feedback(rag_used);


-- Create policies to allow moderators to view and update feedback
CREATE POLICY "Allow moderators full access to feedback"
    ON feedback
    USING (is_moderator(auth.uid()))
    WITH CHECK (is_moderator(auth.uid()));


