-- Fix supplier_id to allow NULL values
-- Created: 2026-03-24

-- Make supplier_id nullable in acc_purchase_orders
ALTER TABLE acc_purchase_orders
MODIFY COLUMN supplier_id INT NULL
COMMENT 'รหัสผู้จำหน่าย (สามารถเป็น NULL ได้)';

-- Verify the change
DESCRIBE acc_purchase_orders;
