-- Add Foreign Key: kr_hr_invoices -> production_orders
-- Links Korea HQ invoices to Thailand branch production orders

USE ksystem;

-- Add foreign key constraint
ALTER TABLE kr_hr_invoices
  ADD CONSTRAINT fk_kr_invoice_pdo
    FOREIGN KEY (pdo_number)
    REFERENCES production_orders(pdoNo)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Verify the constraint
SELECT
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME,
  DELETE_RULE,
  UPDATE_RULE
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'ksystem'
  AND TABLE_NAME = 'kr_hr_invoices'
  AND CONSTRAINT_NAME = 'fk_kr_invoice_pdo';
