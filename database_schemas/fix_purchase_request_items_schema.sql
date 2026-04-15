-- Fix purchase_request_items table schema to match API expectations
-- Created: 2026-03-24

SET FOREIGN_KEY_CHECKS=0;

-- Drop existing foreign key constraints
ALTER TABLE purchase_request_items DROP FOREIGN KEY IF EXISTS fk_purchase_request_items;
ALTER TABLE purchase_request_items DROP FOREIGN KEY IF EXISTS purchase_request_items_ibfk_1;

-- Rename columns
ALTER TABLE purchase_request_items CHANGE COLUMN id itemID INT NOT NULL AUTO_INCREMENT;
ALTER TABLE purchase_request_items CHANGE COLUMN purchase_request_id prID INT NOT NULL;

-- Add description column if it doesn't exist, or rename product_name to description
ALTER TABLE purchase_request_items ADD COLUMN IF NOT EXISTS description TEXT NULL AFTER product_code;
UPDATE purchase_request_items SET description = product_name WHERE description IS NULL;

-- Add notes column if missing
ALTER TABLE purchase_request_items ADD COLUMN IF NOT EXISTS notes TEXT NULL;

-- Re-add foreign key constraint with correct column name
ALTER TABLE purchase_request_items
ADD CONSTRAINT fk_pr_items_prID FOREIGN KEY (prID) REFERENCES purchase_requests(prID) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS=1;

-- Verify changes
DESCRIBE purchase_request_items;
