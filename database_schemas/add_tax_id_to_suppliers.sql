-- Add tax_id column to suppliers table
-- Created: 2026-03-24

ALTER TABLE suppliers
ADD COLUMN tax_id VARCHAR(20) NULL
COMMENT 'เลขประจำตัวผู้เสียภาษี'
AFTER company;

-- Verify the change
DESCRIBE suppliers;
