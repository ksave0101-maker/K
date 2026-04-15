-- Create Import and Export tables
-- Migration: 2026-03-19
-- Purpose: Track import and export documents for inventory management

USE ksystem;

-- Imports (ใบนำเข้า)
CREATE TABLE IF NOT EXISTS `imports` (
  `impID` int(11) NOT NULL AUTO_INCREMENT,
  `impNo` varchar(64) NOT NULL UNIQUE COMMENT 'Format: IMP-YYYYMMDD-####',
  `impDate` date NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `supplier_invoice_no` varchar(100) DEFAULT NULL,
  `warehouse` varchar(100) DEFAULT NULL COMMENT 'Destination warehouse',
  `receiver_name` varchar(255) DEFAULT NULL,
  `transport_method` varchar(100) DEFAULT NULL COMMENT 'By sea, air, land, etc.',
  `customs_declaration_no` varchar(100) DEFAULT NULL,
  `total_items` int(11) DEFAULT 0,
  `total_quantity` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'THB',
  `exchange_rate` decimal(10,4) DEFAULT 1.0000,
  `notes` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending' COMMENT 'pending, received, completed, cancelled',
  `created_by` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`impID`),
  UNIQUE KEY `idx_imports_impNo` (`impNo`),
  KEY `idx_imports_impDate` (`impDate`),
  KEY `idx_imports_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Import documents (ใบนำเข้า)';

-- Import Items (รายการสินค้านำเข้า)
CREATE TABLE IF NOT EXISTS `import_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `impID` int(11) NOT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(50) DEFAULT 'pcs',
  `unit_price` decimal(12,2) DEFAULT 0.00,
  `total_price` decimal(12,2) DEFAULT 0.00,
  `hs_code` varchar(50) DEFAULT NULL COMMENT 'Harmonized System code for customs',
  `country_of_origin` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_import_items_impID` (`impID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Items in import documents';

-- Exports (ใบส่งออก)
CREATE TABLE IF NOT EXISTS `exports` (
  `expID` int(11) NOT NULL AUTO_INCREMENT,
  `expNo` varchar(64) NOT NULL UNIQUE COMMENT 'Format: EXP-YYYYMMDD-####',
  `expDate` date NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `destination_country` varchar(100) DEFAULT NULL,
  `destination_address` text DEFAULT NULL,
  `warehouse` varchar(100) DEFAULT NULL COMMENT 'Source warehouse',
  `shipper_name` varchar(255) DEFAULT NULL,
  `transport_method` varchar(100) DEFAULT NULL COMMENT 'By sea, air, land, etc.',
  `customs_declaration_no` varchar(100) DEFAULT NULL,
  `shipping_company` varchar(255) DEFAULT NULL,
  `tracking_no` varchar(100) DEFAULT NULL,
  `total_items` int(11) DEFAULT 0,
  `total_quantity` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'THB',
  `exchange_rate` decimal(10,4) DEFAULT 1.0000,
  `notes` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending' COMMENT 'pending, shipped, delivered, cancelled',
  `created_by` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`expID`),
  UNIQUE KEY `idx_exports_expNo` (`expNo`),
  KEY `idx_exports_expDate` (`expDate`),
  KEY `idx_exports_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Export documents (ใบส่งออก)';

-- Export Items (รายการสินค้าส่งออก)
CREATE TABLE IF NOT EXISTS `export_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `expID` int(11) NOT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(50) DEFAULT 'pcs',
  `unit_price` decimal(12,2) DEFAULT 0.00,
  `total_price` decimal(12,2) DEFAULT 0.00,
  `hs_code` varchar(50) DEFAULT NULL COMMENT 'Harmonized System code for customs',
  PRIMARY KEY (`id`),
  KEY `idx_export_items_expID` (`expID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Items in export documents';

-- Add Foreign Keys
ALTER TABLE `import_items`
ADD CONSTRAINT `fk_import_items_imports`
  FOREIGN KEY (`impID`)
  REFERENCES `imports` (`impID`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `export_items`
ADD CONSTRAINT `fk_export_items_exports`
  FOREIGN KEY (`expID`)
  REFERENCES `exports` (`expID`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Verify
SHOW TABLES LIKE '%import%';
SHOW TABLES LIKE '%export%';

SELECT '✅ Import and Export tables created successfully!' AS result;
