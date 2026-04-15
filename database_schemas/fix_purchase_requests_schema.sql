-- Fix purchase_requests table schema to match API expectations
-- Created: 2026-03-24

-- First, check if foreign key exists and drop it if needed
SET FOREIGN_KEY_CHECKS=0;

-- Rename id column to prID
ALTER TABLE purchase_requests
CHANGE COLUMN id prID INT NOT NULL AUTO_INCREMENT;

-- Add missing columns
ALTER TABLE purchase_requests
ADD COLUMN IF NOT EXISTS requested_by VARCHAR(150) NULL AFTER department,
ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'normal' AFTER purpose,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0.00 AFTER required_date,
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(150) NULL AFTER status,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL AFTER approved_by;

-- Update status enum if needed (keep existing values, add new ones)
ALTER TABLE purchase_requests
MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending';

-- If requester_name exists and we want to migrate data to requested_by
UPDATE purchase_requests SET requested_by = requester_name WHERE requested_by IS NULL;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Verify changes
DESCRIBE purchase_requests;
