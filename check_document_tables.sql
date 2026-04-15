-- Check if all 23 document management tables exist

USE ksystem;

SELECT
    table_name,
    CASE
        WHEN table_name LIKE '%counter%' THEN '📊 System'
        WHEN table_name LIKE '%credit%' THEN '💰 Finance'
        WHEN table_name LIKE '%goods%' THEN '🛒 Purchase'
        WHEN table_name LIKE '%payment%' THEN '💰 Finance'
        WHEN table_name LIKE '%warrant%' THEN '🛡️ After Sales'
        WHEN table_name LIKE '%purchase%' THEN '🛒 Purchase'
        WHEN table_name LIKE '%supplier%' THEN '🛒 Purchase'
        WHEN table_name LIKE '%stock%' THEN '📦 Inventory'
        WHEN table_name LIKE '%expense%' THEN '💰 Finance'
        WHEN table_name LIKE '%production%' THEN '⚙️ Production'
        ELSE '❓ Other'
    END AS category,
    table_rows AS estimated_rows,
    ROUND((data_length + index_length) / 1024, 2) AS size_kb
FROM information_schema.tables
WHERE table_schema = 'ksystem'
  AND (
    table_name = 'document_counters'
    OR table_name LIKE '%credit_note%'
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
  )
ORDER BY category, table_name;

-- Count total document tables
SELECT
    COUNT(*) AS total_document_tables,
    '23 expected' AS expected_count
FROM information_schema.tables
WHERE table_schema = 'ksystem'
  AND (
    table_name = 'document_counters'
    OR table_name LIKE '%credit_note%'
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
  );
