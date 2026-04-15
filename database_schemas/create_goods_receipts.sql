-- ตาราง Goods Receipt (GR) - ใบรับสินค้า
CREATE TABLE IF NOT EXISTS `goods_receipts` (
  `grID` int NOT NULL AUTO_INCREMENT,
  `grNo` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grDate` date DEFAULT NULL,
  `poID` int DEFAULT NULL,
  `poNo` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplierID` int DEFAULT NULL,
  `supplier_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_items` int DEFAULT 0,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'received',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `received_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`grID`),
  UNIQUE KEY `grNo` (`grNo`),
  KEY `idx_poID` (`poID`),
  KEY `idx_supplierID` (`supplierID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางรายการสินค้าในใบรับสินค้า
CREATE TABLE IF NOT EXISTS `goods_receipt_items` (
  `itemID` int NOT NULL AUTO_INCREMENT,
  `grID` int NOT NULL,
  `product_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `quantity_ordered` decimal(10,2) DEFAULT 0.00,
  `quantity_received` decimal(10,2) DEFAULT 0.00,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condition_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'good',
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`itemID`),
  KEY `idx_grID` (`grID`),
  CONSTRAINT `fk_gr_items_grID` FOREIGN KEY (`grID`) REFERENCES `goods_receipts` (`grID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
