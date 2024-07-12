CREATE OR REPLACE FUNCTION get_chat_messages_by_feedback_id(p_feedback_id UUID)
RETURNS TABLE (
    chat_id UUID,
    content TEXT,
    created_at TIMESTAMPTZ,
    id UUID,
    image_paths TEXT[],
    model TEXT,
    plugin VARCHAR(255),
    rag_id UUID,
    rag_used BOOLEAN,
    role TEXT,
    sequence_number INT,
    updated_at TIMESTAMPTZ,
    user_id UUID
) AS $$
BEGIN
    IF is_moderator(auth.uid()) THEN
        RETURN QUERY
        SELECT 
            m.chat_id,
            m.content,
            m.created_at,
            m.id,
            m.image_paths,
            m.model,
            m.plugin,
            m.rag_id,
            m.rag_used,
            m.role,
            m.sequence_number,
            m.updated_at,
            m.user_id
        FROM 
            messages m
        JOIN 
            feedback f ON m.chat_id = f.chat_id
        WHERE 
            f.id = p_feedback_id
            AND (
                (f.allow_sharing = true AND m.sequence_number <= (SELECT m.sequence_number FROM messages WHERE messages.id = f.message_id))
                OR (f.allow_sharing = false AND m.id = f.message_id)
            )
        ORDER BY 
            m.sequence_number;
    END IF;
END;
$$ LANGUAGE plpgsql;