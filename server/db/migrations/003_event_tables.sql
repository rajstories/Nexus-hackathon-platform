-- Create event management tables for hackathon platform

-- Events table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'events')
BEGIN
    CREATE TABLE events (
        id NVARCHAR(255) PRIMARY KEY,
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(2000) NOT NULL,
        mode NVARCHAR(10) NOT NULL CHECK (mode IN ('online', 'offline')),
        start_at DATETIME2 NOT NULL,
        end_at DATETIME2 NOT NULL,
        organizer_id NVARCHAR(255) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (organizer_id) REFERENCES users(id),
        CHECK (end_at > start_at)
    );
    
    CREATE INDEX idx_events_organizer ON events(organizer_id);
    CREATE INDEX idx_events_start_at ON events(start_at);
    CREATE INDEX idx_events_mode ON events(mode);
    
    PRINT 'Events table created successfully.';
END

-- Tracks table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'tracks')
BEGIN
    CREATE TABLE tracks (
        id NVARCHAR(255) PRIMARY KEY,
        event_id NVARCHAR(255) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(1000) NOT NULL,
        max_teams INT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
    
    CREATE INDEX idx_tracks_event ON tracks(event_id);
    CREATE UNIQUE INDEX idx_tracks_event_name ON tracks(event_id, name);
    
    PRINT 'Tracks table created successfully.';
END

-- Event judges table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'event_judges')
BEGIN
    CREATE TABLE event_judges (
        id NVARCHAR(255) PRIMARY KEY,
        event_id NVARCHAR(255) NOT NULL,
        user_id NVARCHAR(255) NOT NULL,
        assigned_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    CREATE INDEX idx_event_judges_event ON event_judges(event_id);
    CREATE INDEX idx_event_judges_user ON event_judges(user_id);
    CREATE UNIQUE INDEX idx_event_judges_unique ON event_judges(event_id, user_id);
    
    PRINT 'Event judges table created successfully.';
END

PRINT 'Event management tables migration completed successfully.';