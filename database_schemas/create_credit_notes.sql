-- ตาราง Credit Note (CN) - ใบลดหนี้
CREATE TABLE IF NOT EXISTS `credit_notes` (
  `cnID` int NOT NULL AUTO_INCREMENT,
  `cnNo` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cnDate` date DEFAULT NULL,
  `invID` int DEFAULT NULL,
  `invNo` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cusID` int DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `subtotal` decimal(12,2) DEFAULT 0.00,
  `discount` decimal(12,2) DEFAULT 0.00,
  `vat` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cnID`),
  UNIQUE KEY `cnNo` (`cnNo`),
  KEY `idx_invID` (`invID`),
  KEY `idx_cusID` (`cusID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางรายการสินค้าในใบลดหนี้
CREATE TABLE IF NOT EXISTS `credit_note_items` (
  `itemID` int NOT NULL AUTO_INCREMENT,
  `cnID` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `quantity` decimal(10,2) DEFAULT 1.00,
  `unit_price` decimal(12,2) DEFAULT 0.00,
  `total_price` decimal(12,2) DEFAULT 0.00,
  PRIMARY KEY (`itemID`),
  KEY `idx_cnID` (`cnID`),
  CONSTRAINT `fk_cn_items_cnID` FOREIGN KEY (`cnID`) REFERENCES `credit_notes` (`cnID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
