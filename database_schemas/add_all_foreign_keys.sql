-- ============================================
-- Add Foreign Keys for All Document Tables
-- Migration: 2026-03-19
-- ============================================
-- This script adds UNIQUE constraints and Foreign Key relationships
-- for the Document Management System tables

USE ksystem;

-- ============================================
-- Step 1: Add UNIQUE Constraints to Reference Tables
-- ============================================

-- 1.1 contracts.contractNo (should already exist)
SET @sql_contract = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE contracts ADD UNIQUE KEY uk_contractNo (contractNo)',
        'SELECT "UNIQUE constraint already exists on contracts.contractNo" AS info'
    )
    FROM information_schema.statistics
    WHERE table_schema = 'ksystem'
      AND table_name = 'contracts'
      AND column_name = 'contractNo'
      AND non_unique = 0
);

PREPARE stmt FROM @sql_contract;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 1.2 purchase_orders.orderNo
SET @sql_po = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE purchase_orders ADD UNIQUE KEY uk_orderNo (orderNo)',
        'SELECT "UNIQUE constraint already exists on purchase_orders.orderNo" AS info'
    )
    FROM information_schema.statistics
    WHERE table_schema = 'ksystem'
      AND table_name = 'purchase_orders'
      AND column_name = 'orderNo'
      AND non_unique = 0
);

PREPARE stmt FROM @sql_po;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Step 2: Add Foreign Keys - Items to Main Tables
-- ============================================
-- Note: Most of these should already exist from setup_all_documents.sql
-- These statements are idempotent (will skip if already exists)

-- 2.1 Credit Note Items → Credit Notes
SET @fk1 = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'credit_note_items'
    AND CONSTRAINT_NAME = 'fk_credit_note_items');

SET @sql1 = IF(@fk1 = 0,
    'ALTER TABLE credit_note_items
     ADD CONSTRAINT fk_credit_note_items
     FOREIGN KEY (credit_note_id) REFERENCES credit_notes(id) ON DELETE CASCADE',
    'SELECT "FK credit_note_items already exists" AS info');
PREPARE stmt FROM @sql1; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2.2 Goods Receipt Items → Goods Receipts
SET @fk2 = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'goods_receipt_items'
    AND CONSTRAINT_NAME = 'fk_goods_receipt_items');

SET @sql2 = IF(@fk2 = 0,
    'ALTER TABLE goods_receipt_items
     ADD CONSTRAINT fk_goods_receipt_items
     FOREIGN KEY (goods_receipt_id) REFERENCES goods_receipts(id) ON DELETE CASCADE',
    'SELECT "FK goods_receipt_items already exists" AS info');
PREPARE stmt FROM @sql2; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2.3 Payment Voucher Items → Payment Vouchers
SET @fk3 = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'payment_voucher_items'
    AND CONSTRAINT_NAME = 'fk_payment_voucher_items');

SET @sql3 = IF(@fk3 = 0,
    'ALTER TABLE payment_voucher_items
     ADD CONSTRAINT fk_payment_voucher_items
     FOREIGN KEY (payment_voucher_id) REFERENCES payment_vouchers(id) ON DELETE CASCADE',
    'SELECT "FK payment_voucher_items already exists" AS info');
PREPARE stmt FROM @sql3; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2.4 Purchase Request Items → Purchase Requests
SET @fk4 = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'purchase_request_items'
    AND CONSTRAINT_NAME = 'fk_purchase_request_items');

SET @sql4 = IF(@fk4 = 0,
    'ALTER TABLE purchase_request_items
     ADD CONSTRAINT fk_purchase_request_items
     FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id) ON DELETE CASCADE',
    'SELECT "FK purchase_request_items already exists" AS info');
PREPARE stmt FROM @sql4; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2.5 Supplier Invoice Items → Supplier Invoices
SET @fk5 = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'supplier_invoice_items'
    AND CONSTRAINT_NAME = 'fk_supplier_invoice_items');

SET @sql5 = IF(@fk5 = 0,
    'ALTER TABLE supplier_invoice_items
     ADD CONSTRAINT fk_supplier_invoice_items
     FOREIGN KEY (supplier_invoice_id) REFERENCES supplier_invoices(id) ON DELETE CASCADE',
    'SELECT "FK supplier_invoice_items already exists" AS info');
PREPARE stmt FROM @sql5; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2.6 Stock Transfer Items → Stock Transfers
SET @fk6 = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'stock_transfer_items'
    AND CONSTRAINT_NAME = 'fk_stock_transfer_items');

SET @sql6 = IF(@fk6 = 0,
    'ALTER TABLE stock_transfer_items
     ADD CONSTRAINT fk_stock_transfer_items
     FOREIGN KEY (stock_transfer_id) REFERENCES stock_transfers(id) ON DELETE CASCADE',
    'SELECT "FK stock_transfer_items already exists" AS info');
PREPARE stmt FROM @sql6; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2.7 Stock Adjustment Items → Stock Adjustments
SET @fk7 = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'stock_adjustment_items'
    AND CONSTRAINT_NAME = 'fk_stock_adjustment_items');

SET @sql7 = IF(@fk7 = 0,
    'ALTER TABLE stock_adjustment_items
     ADD CONSTRAINT fk_stock_adjustment_items
     FOREIGN KEY (stock_adjustment_id) REFERENCES stock_adjustments(id) ON DELETE CASCADE',
    'SELECT "FK stock_adjustment_items already exists" AS info');
PREPARE stmt FROM @sql7; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2.8 Expense Bill Items → Expense Bills
SET @fk8 = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'expense_bill_items'
    AND CONSTRAINT_NAME = 'fk_expense_bill_items');

SET @sql8 = IF(@fk8 = 0,
    'ALTER TABLE expense_bill_items
     ADD CONSTRAINT fk_expense_bill_items
     FOREIGN KEY (expense_bill_id) REFERENCES expense_bills(id) ON DELETE CASCADE',
    'SELECT "FK expense_bill_items already exists" AS info');
PREPARE stmt FROM @sql8; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2.9 Production Order Materials → Production Orders
SET @fk9 = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'production_order_materials'
    AND CONSTRAINT_NAME = 'fk_production_order_materials');

SET @sql9 = IF(@fk9 = 0,
    'ALTER TABLE production_order_materials
     ADD CONSTRAINT fk_production_order_materials
     FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE',
    'SELECT "FK production_order_materials already exists" AS info');
PREPARE stmt FROM @sql9; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2.10 Production Order Steps → Production Orders
SET @fk10 = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'production_order_steps'
    AND CONSTRAINT_NAME = 'fk_production_order_steps');

SET @sql10 = IF(@fk10 = 0,
    'ALTER TABLE production_order_steps
     ADD CONSTRAINT fk_production_order_steps
     FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE',
    'SELECT "FK production_order_steps already exists" AS info');
PREPARE stmt FROM @sql10; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================
-- Step 3: Add Foreign Keys - Cross-Document References
-- ============================================

-- 3.1 Warranties → Contracts
SET @fk_warranty = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'warranties'
    AND CONSTRAINT_NAME = 'fk_warranty_contract');

SET @sql_warranty = IF(@fk_warranty = 0,
    'ALTER TABLE warranties
     ADD CONSTRAINT fk_warranty_contract
     FOREIGN KEY (contract_no) REFERENCES contracts(contractNo)
     ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT "FK warranties→contracts already exists" AS info');
PREPARE stmt FROM @sql_warranty; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.2 Goods Receipts → Purchase Orders (via po_ref)
SET @fk_gr_po = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'goods_receipts'
    AND CONSTRAINT_NAME = 'fk_goods_receipt_po');

SET @sql_gr_po = IF(@fk_gr_po = 0,
    'ALTER TABLE goods_receipts
     ADD CONSTRAINT fk_goods_receipt_po
     FOREIGN KEY (po_ref) REFERENCES purchase_orders(orderNo)
     ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT "FK goods_receipts→purchase_orders already exists" AS info');
PREPARE stmt FROM @sql_gr_po; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3.3 Supplier Invoices → Purchase Orders (via po_ref)
SET @fk_si_po = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'ksystem' AND TABLE_NAME = 'supplier_invoices'
    AND CONSTRAINT_NAME = 'fk_supplier_invoice_po');

SET @sql_si_po = IF(@fk_si_po = 0,
    'ALTER TABLE supplier_invoices
     ADD CONSTRAINT fk_supplier_invoice_po
     FOREIGN KEY (po_ref) REFERENCES purchase_orders(orderNo)
     ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT "FK supplier_invoices→purchase_orders already exists" AS info');
PREPARE stmt FROM @sql_si_po; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================================
-- Verification
-- ============================================

SELECT '========================================' AS ' ';
SELECT 'UNIQUE CONSTRAINTS CHECK' AS ' ';
SELECT '========================================' AS ' ';

SELECT
    CONCAT(table_name, '.', column_name) AS table_column,
    IF(non_unique = 0, '✅ UNIQUE', '❌ NOT UNIQUE') AS status
FROM information_schema.statistics
WHERE table_schema = 'ksystem'
    AND table_name IN ('contracts', 'purchase_orders')
    AND column_name IN ('contractNo', 'orderNo')
ORDER BY table_name;

SELECT '========================================' AS ' ';
SELECT 'FOREIGN KEYS CHECK' AS ' ';
SELECT '========================================' AS ' ';

SELECT
    CONCAT(TABLE_NAME, ' → ', REFERENCED_TABLE_NAME) AS relationship,
    COLUMN_NAME,
    REFERENCED_COLUMN_NAME,
    CONSTRAINT_NAME,
    '✅' AS status
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'ksystem'
    AND REFERENCED_TABLE_NAME IS NOT NULL
    AND TABLE_NAME IN (
        'credit_note_items', 'goods_receipt_items', 'payment_voucher_items',
        'purchase_request_items', 'supplier_invoice_items', 'stock_transfer_items',
        'stock_adjustment_items', 'expense_bill_items',
        'production_order_materials', 'production_order_steps',
        'warranties', 'goods_receipts', 'supplier_invoices'
    )
ORDER BY TABLE_NAME;

SELECT '✅ Foreign Key migration completed!' AS result;
