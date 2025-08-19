-- Add Firebase UID to users table for authentication integration

-- Add firebase_uid column to users table if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'firebase_uid')
BEGIN
    ALTER TABLE users ADD firebase_uid NVARCHAR(255) NULL UNIQUE;
END

-- Create index on firebase_uid for faster lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_firebase_uid')
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);

PRINT 'Firebase UID column added to users table successfully.';