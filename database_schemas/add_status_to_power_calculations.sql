-- Add status column to power_calculations table to support draft/completed states
-- Run this SQL to add draft functionality to power calculator

ALTER TABLE power_calculations
ADD COLUMN status VARCHAR(20) DEFAULT 'completed'
COMMENT 'Status: draft, completed';

-- Update existing records to 'completed' status
UPDATE power_calculations SET status = 'completed' WHERE status IS NULL;

-- Add index for filtering by status
CREATE INDEX idx_power_calc_status ON power_calculations(status);
