-- Fix expense_bills and expense_bill_items tables schema
-- Created: 2026-03-24

SET FOREIGN_KEY_CHECKS=0;

-- Fix expense_bills table
ALTER TABLE expense_bills
CHANGE COLUMN id ebID INT NOT NULL AUTO_INCREMENT;

-- Add missing columns if they don't exist
ALTER TABLE expense_bills
ADD COLUMN IF NOT EXISTS category VARCHAR(100) NULL AFTER expense_type,
ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS vendor_invoice_no VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS vat DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS payment_date DATE NULL,
ADD COLUMN IF NOT EXISTS department VARCHAR(150) NULL,
ADD COLUMN IF NOT EXISTS project_code VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS description TEXT NULL,
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(150) NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL;

-- Update expense_type to VARCHAR if it's ENUM
ALTER TABLE expense_bills
MODIFY COLUMN expense_type VARCHAR(100) NULL;

-- Update status to VARCHAR if needed
ALTER TABLE expense_bills
MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending';

-- Fix expense_bill_items table if it exists
-- Drop existing foreign keys
ALTER TABLE expense_bill_items DROP FOREIGN KEY IF EXISTS fk_expense_bill_items;
ALTER TABLE expense_bill_items DROP FOREIGN KEY IF EXISTS expense_bill_items_ibfk_1;

-- Rename columns
ALTER TABLE expense_bill_items CHANGE COLUMN id itemID INT NOT NULL AUTO_INCREMENT;
ALTER TABLE expense_bill_items CHANGE COLUMN expense_bill_id ebID INT NOT NULL;

-- Re-add foreign key
ALTER TABLE expense_bill_items
ADD CONSTRAINT fk_eb_items_ebID FOREIGN KEY (ebID) REFERENCES expense_bills(ebID) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS=1;

-- Verify changes
SELECT 'expense_bills table:' as '';
DESCRIBE expense_bills;
SELECT '' as '';
SELECT 'expense_bill_items table:' as '';
DESCRIBE expense_bill_items;
