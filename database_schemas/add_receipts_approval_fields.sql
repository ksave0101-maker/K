-- Add approval workflow fields for receipts (Pending Bills)
ALTER TABLE receipts
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NULL DEFAULT 'pending' AFTER payment_method,
  ADD COLUMN IF NOT EXISTS approved_by VARCHAR(150) NULL AFTER status,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL AFTER approved_by,
  ADD COLUMN IF NOT EXISTS approved_signature LONGTEXT NULL AFTER approved_at;

-- Normalize existing records to pending status if empty
UPDATE receipts
SET status = 'pending'
WHERE status IS NULL OR TRIM(status) = '';
