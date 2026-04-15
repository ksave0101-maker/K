-- Rename subject column to tax_id in cus_detail table
-- Created: 2026-03-24

ALTER TABLE cus_detail
CHANGE COLUMN subject tax_id VARCHAR(255) NULL COMMENT 'เลขผู้เสียภาษีอากร';

-- Optional: Clear old subject data that is not a tax ID (uncomment if needed)
-- UPDATE cus_detail SET tax_id = NULL WHERE LENGTH(tax_id) > 13;

-- Verify the change
DESCRIBE cus_detail;
