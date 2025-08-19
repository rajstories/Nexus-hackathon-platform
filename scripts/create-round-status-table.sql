-- Create table for tracking round finalization status
CREATE TABLE IF NOT EXISTS round_status (
  event_id NVARCHAR(255) NOT NULL,
  round_number INT NOT NULL,
  is_finalized BIT DEFAULT 0,
  finalized_at DATETIME NULL,
  finalized_by NVARCHAR(255) NULL,
  created_at DATETIME DEFAULT GETDATE(),
  PRIMARY KEY (event_id, round_number)
);

-- Index for quick lookups
CREATE INDEX idx_round_status_event ON round_status(event_id);
CREATE INDEX idx_round_status_finalized ON round_status(is_finalized);