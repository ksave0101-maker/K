-- Fix suppliers table: Add AUTO_INCREMENT and PRIMARY KEY to supplier_id
-- Created: 2026-03-24

-- Add PRIMARY KEY and AUTO_INCREMENT to supplier_id
ALTER TABLE suppliers
MODIFY COLUMN supplier_id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
ADD PRIMARY KEY (supplier_id);

-- Verify the change
SHOW CREATE TABLE suppliers;
