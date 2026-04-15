-- Fix credit_note_items table schema to match API expectations
-- Created: 2026-03-24

SET FOREIGN_KEY_CHECKS=0;

-- Drop existing foreign key constraints if they exist
ALTER TABLE credit_note_items DROP FOREIGN KEY IF EXISTS fk_credit_note_items;
ALTER TABLE credit_note_items DROP FOREIGN KEY IF EXISTS credit_note_items_ibfk_1;

-- Rename columns
ALTER TABLE credit_note_items CHANGE COLUMN id itemID INT NOT NULL AUTO_INCREMENT;
ALTER TABLE credit_note_items CHANGE COLUMN credit_note_id cnID INT NOT NULL;

-- Re-add foreign key constraint with correct column name
ALTER TABLE credit_note_items
ADD CONSTRAINT fk_cn_items_cnID FOREIGN KEY (cnID) REFERENCES credit_notes(cnID) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS=1;

-- Verify changes
DESCRIBE credit_note_items;
