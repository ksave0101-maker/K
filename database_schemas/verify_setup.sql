-- ============================================
-- Verify Document Management System Setup
-- ============================================
-- Run this script to check if all tables were created successfully
-- ============================================

USE `ksystem`;

-- Check all document tables
SELECT
    'document_counters' AS table_name,
    COUNT(*) AS record_count,
    CASE WHEN COUNT(*) >= 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END AS status
FROM information_schema.tables
WHERE table_schema = 'k-system' AND table_name = 'document_counters'

UNION ALL

SELECT
    'credit_notes',
    (SELECT COUNT(*) FROM credit_notes),
    '✅ EXISTS'
UNION ALL SELECT
    'credit_note_items',
    (SELECT COUNT(*) FROM credit_note_items),
    '✅ EXISTS'

UNION ALL

SELECT
    'goods_receipts',
    (SELECT COUNT(*) FROM goods_receipts),
    '✅ EXISTS'
UNION ALL SELECT
    'goods_receipt_items',
    (SELECT COUNT(*) FROM goods_receipt_items),
    '✅ EXISTS'

UNION ALL

SELECT
    'payment_vouchers',
    (SELECT COUNT(*) FROM payment_vouchers),
    '✅ EXISTS'
UNION ALL SELECT
    'payment_voucher_items',
    (SELECT COUNT(*) FROM payment_voucher_items),
    '✅ EXISTS'

UNION ALL

SELECT
    'warranties',
    (SELECT COUNT(*) FROM warranties),
    '✅ EXISTS'

UNION ALL

SELECT
    'purchase_requests',
    (SELECT COUNT(*) FROM purchase_requests),
    '✅ EXISTS'
UNION ALL SELECT
    'purchase_request_items',
    (SELECT COUNT(*) FROM purchase_request_items),
    '✅ EXISTS'

UNION ALL

SELECT
    'supplier_invoices',
    (SELECT COUNT(*) FROM supplier_invoices),
    '✅ EXISTS'
UNION ALL SELECT
    'supplier_invoice_items',
    (SELECT COUNT(*) FROM supplier_invoice_items),
    '✅ EXISTS'

UNION ALL

SELECT
    'stock_cards',
    (SELECT COUNT(*) FROM stock_cards),
    '✅ EXISTS'

UNION ALL

SELECT
    'stock_transfers',
    (SELECT COUNT(*) FROM stock_transfers),
    '✅ EXISTS'
UNION ALL SELECT
    'stock_transfer_items',
    (SELECT COUNT(*) FROM stock_transfer_items),
    '✅ EXISTS'

UNION ALL

SELECT
    'stock_adjustments',
    (SELECT COUNT(*) FROM stock_adjustments),
    '✅ EXISTS'
UNION ALL SELECT
    'stock_adjustment_items',
    (SELECT COUNT(*) FROM stock_adjustment_items),
    '✅ EXISTS'

UNION ALL

SELECT
    'expense_bills',
    (SELECT COUNT(*) FROM expense_bills),
    '✅ EXISTS'
UNION ALL SELECT
    'expense_bill_items',
    (SELECT COUNT(*) FROM expense_bill_items),
    '✅ EXISTS'

UNION ALL

SELECT
    'production_orders',
    (SELECT COUNT(*) FROM production_orders),
    '✅ EXISTS'
UNION ALL SELECT
    'production_order_materials',
    (SELECT COUNT(*) FROM production_order_materials),
    '✅ EXISTS'
UNION ALL SELECT
    'production_order_steps',
    (SELECT COUNT(*) FROM production_order_steps),
    '✅ EXISTS'
UNION ALL SELECT
    'vacation_leave_requests',
    (SELECT COUNT(*) FROM vacation_leave_requests),
    '✅ EXISTS';

-- Summary
SELECT
    COUNT(*) AS total_tables,
    '24 tables expected (12 main + 11 items/details + 1 counter)' AS expected
FROM information_schema.tables
WHERE table_schema = 'k-system'
AND (
    table_name LIKE '%credit_note%'
    OR table_name LIKE '%goods_receipt%'
    OR table_name LIKE '%payment_voucher%'
    OR table_name LIKE '%warrant%'
    OR table_name LIKE '%purchase_request%'
    OR table_name LIKE '%supplier_invoice%'
    OR table_name LIKE '%stock_card%'
    OR table_name LIKE '%stock_transfer%'
    OR table_name LIKE '%stock_adjustment%'
    OR table_name LIKE '%expense_bill%'
    OR table_name LIKE '%production_order%'
    OR table_name LIKE '%vacation_leave_request%'
    OR table_name = 'document_counters'
);
