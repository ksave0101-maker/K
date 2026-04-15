-- Rename production_orders primary key from id to pdoID
-- Migration: 2026-03-19
-- Purpose: Match naming convention with other document tables

USE ksystem;

-- Check if production_orders table exists
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = 'ksystem'
      AND TABLE_NAME = 'production_orders'
);

-- Only proceed if table exists
SET @sql = IF(@table_exists > 0,
    'SELECT "Table production_orders exists, proceeding with rename..." AS info',
    'SELECT "Table production_orders does not exist, skipping..." AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename id to pdoID
-- Note: Need to drop foreign keys first, then rename, then recreate
ALTER TABLE `production_orders`
CHANGE COLUMN `id` `pdoID` int(11) NOT NULL AUTO_INCREMENT;

-- Update foreign key references in related tables
ALTER TABLE `production_order_materials`
CHANGE COLUMN `production_order_id` `pdoID` int(11) NOT NULL;

ALTER TABLE `production_order_steps`
CHANGE COLUMN `production_order_id` `pdoID` int(11) NOT NULL;

-- Verify changes
SELECT 'production_orders columns:' AS ' ';
SHOW COLUMNS FROM production_orders LIKE 'pdoID';

SELECT 'production_order_materials columns:' AS ' ';
SHOW COLUMNS FROM production_order_materials LIKE 'pdoID';

SELECT 'production_order_steps columns:' AS ' ';
SHOW COLUMNS FROM production_order_steps LIKE 'pdoID';

SELECT '✅ Migration completed! All tables now use pdoID' AS result;
