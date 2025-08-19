-- Initial schema for Fusion X event management system

-- Users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'participant',
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Events table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='events' AND xtype='U')
CREATE TABLE events (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL,
    description NTEXT,
    mode NVARCHAR(50) NOT NULL DEFAULT 'hybrid',
    start_at DATETIME2 NOT NULL,
    end_at DATETIME2 NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

-- Tracks table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tracks' AND xtype='U')
CREATE TABLE tracks (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    event_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Teams table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='teams' AND xtype='U')
CREATE TABLE teams (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    event_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(255) NOT NULL,
    invite_code NVARCHAR(10) NOT NULL UNIQUE,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Team members table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='team_members' AND xtype='U')
CREATE TABLE team_members (
    team_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'member',
    joined_at DATETIME2 DEFAULT GETUTCDATE(),
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Submissions table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='submissions' AND xtype='U')
CREATE TABLE submissions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    team_id UNIQUEIDENTIFIER NOT NULL,
    event_id UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(255) NOT NULL,
    repo_url NVARCHAR(500),
    demo_url NVARCHAR(500),
    blob_path NVARCHAR(500),
    round INT NOT NULL DEFAULT 1,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Judges table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='judges' AND xtype='U')
CREATE TABLE judges (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    event_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    UNIQUE (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Scores table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='scores' AND xtype='U')
CREATE TABLE scores (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    submission_id UNIQUEIDENTIFIER NOT NULL,
    judge_id UNIQUEIDENTIFIER NOT NULL,
    criteria NVARCHAR(100) NOT NULL,
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    feedback NTEXT,
    round INT NOT NULL DEFAULT 1,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    UNIQUE (submission_id, judge_id, criteria, round),
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (judge_id) REFERENCES judges(id) ON DELETE CASCADE
);

-- Announcements table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='announcements' AND xtype='U')
CREATE TABLE announcements (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    event_id UNIQUEIDENTIFIER NOT NULL,
    message NTEXT NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_tracks_event_id')
CREATE INDEX IX_tracks_event_id ON tracks(event_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_teams_event_id')
CREATE INDEX IX_teams_event_id ON teams(event_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_team_members_user_id')
CREATE INDEX IX_team_members_user_id ON team_members(user_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_submissions_event_id')
CREATE INDEX IX_submissions_event_id ON submissions(event_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_judges_event_id')
CREATE INDEX IX_judges_event_id ON judges(event_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_scores_submission_id')
CREATE INDEX IX_scores_submission_id ON scores(submission_id);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_announcements_event_id')
CREATE INDEX IX_announcements_event_id ON announcements(event_id);

PRINT 'Initial schema migration completed successfully';