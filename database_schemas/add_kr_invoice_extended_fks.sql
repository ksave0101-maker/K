-- Add Extended Foreign Keys for Korea HR Invoices
-- Created: 2026-03-26

-- 1. Add customer_id to kr_hr_invoices and FK to kr_customers
ALTER TABLE kr_hr_invoices
  ADD COLUMN customer_id INT NULL AFTER customer,
  ADD INDEX idx_customer_id (customer_id);

ALTER TABLE kr_hr_invoices
  ADD CONSTRAINT fk_kr_hr_invoices_customer
    FOREIGN KEY (customer_id)
    REFERENCES kr_customers(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- 2. Add contract_id to kr_hr_invoices
-- Note: We keep salesContractNumber for display, but add contract_id for FK
ALTER TABLE kr_hr_invoices
  ADD COLUMN contract_id INT NULL AFTER salesContractNumber,
  ADD COLUMN contract_type ENUM('domestic', 'international') NULL AFTER contract_id,
  ADD INDEX idx_contract_id (contract_id);

-- Note: Cannot create FK to multiple tables based on contract_type
-- Will need application-level logic to maintain referential integrity
-- Or create separate tables for domestic/international invoices

-- 3. Add korea_invoice_id to payment vouchers for tracking payments
ALTER TABLE acc_payment_vouchers
  ADD COLUMN korea_invoice_id VARCHAR(50) NULL AFTER description,
  ADD INDEX idx_korea_invoice_id (korea_invoice_id);

ALTER TABLE acc_payment_vouchers
  ADD CONSTRAINT fk_acc_payment_vouchers_korea_invoice
    FOREIGN KEY (korea_invoice_id)
    REFERENCES kr_hr_invoices(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- 4. Also add to payment_vouchers table
ALTER TABLE payment_vouchers
  ADD COLUMN korea_invoice_id VARCHAR(50) NULL AFTER notes,
  ADD INDEX idx_korea_invoice_id (korea_invoice_id);

ALTER TABLE payment_vouchers
  ADD CONSTRAINT fk_payment_vouchers_korea_invoice
    FOREIGN KEY (korea_invoice_id)
    REFERENCES kr_hr_invoices(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
