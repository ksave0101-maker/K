-- Add Foreign Keys for Korea HR Invoices
-- Created: 2026-03-26

-- Add FK from kr_hr_invoice_items to kr_hr_invoices
ALTER TABLE kr_hr_invoice_items
  ADD CONSTRAINT fk_kr_hr_invoice_items_invoice
    FOREIGN KEY (invoiceId)
    REFERENCES kr_hr_invoices(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Add index for better query performance
ALTER TABLE kr_hr_invoice_items
  ADD INDEX idx_invoiceId (invoiceId);

-- Note: Additional FKs could be added:
-- 1. Link to kr_customers if customer_id field is added
-- 2. Link to contracts if contract_id field is added
-- 3. Link to payment records when payments are made
