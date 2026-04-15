-- Change expected_delivery to product_type in suppliers table
-- Created: 2026-03-24

-- Change column from expected_delivery (date) to product_type (varchar)
ALTER TABLE suppliers
CHANGE COLUMN expected_delivery product_type VARCHAR(255) NULL
COMMENT 'ประเภทสินค้าที่จำหน่าย';

-- Verify the change
DESCRIBE suppliers;
