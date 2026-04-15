-- ตาราง Stock Adjustment (SA) - ใบปรับสต๊อค
CREATE TABLE IF NOT EXISTS `stock_adjustments` (
  `saID` int NOT NULL AUTO_INCREMENT,
  `saNo` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `saDate` date DEFAULT NULL,
  `adjustment_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'adjustment',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_items` int DEFAULT 0,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `approved_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`saID`),
  UNIQUE KEY `saNo` (`saNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางรายการสินค้าในใบปรับสต๊อค
CREATE TABLE IF NOT EXISTS `stock_adjustment_items` (
  `itemID` int NOT NULL AUTO_INCREMENT,
  `saID` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `product_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `current_quantity` decimal(10,2) DEFAULT 0.00,
  `adjusted_quantity` decimal(10,2) DEFAULT 0.00,
  `difference` decimal(10,2) DEFAULT 0.00,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pcs',
  `reason` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`itemID`),
  KEY `idx_saID` (`saID`),
  CONSTRAINT `fk_sa_items_saID` FOREIGN KEY (`saID`) REFERENCES `stock_adjustments` (`saID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
