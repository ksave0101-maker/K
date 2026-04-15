-- ตาราง Stock Transfer (ST) - ใบโอนสินค้า
CREATE TABLE IF NOT EXISTS `stock_transfers` (
  `stID` int NOT NULL AUTO_INCREMENT,
  `stNo` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stDate` date DEFAULT NULL,
  `from_location` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_location` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transfer_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'internal',
  `total_items` int DEFAULT 0,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `requested_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `received_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `received_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`stID`),
  UNIQUE KEY `stNo` (`stNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางรายการสินค้าในใบโอนสินค้า
CREATE TABLE IF NOT EXISTS `stock_transfer_items` (
  `itemID` int NOT NULL AUTO_INCREMENT,
  `stID` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `product_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `quantity` decimal(10,2) DEFAULT 0.00,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pcs',
  `condition_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'good',
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`itemID`),
  KEY `idx_stID` (`stID`),
  CONSTRAINT `fk_st_items_stID` FOREIGN KEY (`stID`) REFERENCES `stock_transfers` (`stID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
