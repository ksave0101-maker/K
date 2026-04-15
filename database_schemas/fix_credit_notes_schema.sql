-- Fix credit_notes table schema to match API expectations
-- Created: 2026-03-24

SET FOREIGN_KEY_CHECKS=0;

-- Rename id column to cnID
ALTER TABLE credit_notes
CHANGE COLUMN id cnID INT NOT NULL AUTO_INCREMENT;

-- Add missing columns
ALTER TABLE credit_notes
ADD COLUMN IF NOT EXISTS invID INT NULL AFTER cnDate,
ADD COLUMN IF NOT EXISTS invNo VARCHAR(64) NULL AFTER invID,
ADD COLUMN IF NOT EXISTS cusID INT NULL AFTER invNo;

-- Rename invoice_ref to match if it exists
UPDATE credit_notes SET invNo = invoice_ref WHERE invNo IS NULL AND invoice_ref IS NOT NULL;

-- Update status to VARCHAR if needed
ALTER TABLE credit_notes
MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending';

-- Add indexes
ALTER TABLE credit_notes ADD INDEX IF NOT EXISTS idx_invID (invID);
ALTER TABLE credit_notes ADD INDEX IF NOT EXISTS idx_cusID (cusID);

SET FOREIGN_KEY_CHECKS=1;

-- Verify changes
DESCRIBE credit_notes;
