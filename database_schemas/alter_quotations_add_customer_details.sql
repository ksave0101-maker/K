-- Add customer details and discount percent to quotations table
-- Created: 2026-03-26

ALTER TABLE quotations
  ADD COLUMN customer_address TEXT AFTER customer_phone,
  ADD COLUMN customer_company VARCHAR(255) AFTER customer_address,
  ADD COLUMN customer_tax_id VARCHAR(13) AFTER customer_company,
  ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0.00 AFTER subtotal;

-- Update existing records to set discount_percent to 0 if NULL
UPDATE quotations SET discount_percent = 0.00 WHERE discount_percent IS NULL;
