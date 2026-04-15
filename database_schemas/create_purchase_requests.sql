-- ตาราง Purchase Request (PR) - ใบขอซื้อ
CREATE TABLE IF NOT EXISTS `purchase_requests` (
  `prID` int NOT NULL AUTO_INCREMENT,
  `prNo` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prDate` date DEFAULT NULL,
  `department` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requester_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requested_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci,
  `priority` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `required_date` date DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `branch` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `approved_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`prID`),
  UNIQUE KEY `prNo` (`prNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางรายการสินค้าในใบขอซื้อ
CREATE TABLE IF NOT EXISTS `purchase_request_items` (
  `itemID` int NOT NULL AUTO_INCREMENT,
  `prID` int NOT NULL,
  `product_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `quantity` decimal(10,2) DEFAULT 1.00,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pcs',
  `estimated_price` decimal(12,2) DEFAULT 0.00,
  `total_price` decimal(12,2) DEFAULT 0.00,
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`itemID`),
  KEY `idx_prID` (`prID`),
  CONSTRAINT `fk_pr_items_prID` FOREIGN KEY (`prID`) REFERENCES `purchase_requests` (`prID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
