-- TABLE --

CREATE TABLE IF NOT EXISTS voice_assistant_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    room_name TEXT NOT NULL,
    participant_identity TEXT,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES --

CREATE INDEX idx_voice_assistant_events_room_name ON voice_assistant_events (room_name);
CREATE INDEX idx_voice_assistant_events_event_type ON voice_assistant_events (event_type);
CREATE INDEX idx_voice_assistant_events_is_active ON voice_assistant_events (is_active);

-- RLS --

ALTER TABLE voice_assistant_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own voice_assistant_events"
    ON voice_assistant_events
    USING (true)
    WITH CHECK (true);