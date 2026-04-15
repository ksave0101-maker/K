-- ตาราง Warranty (WT) - ใบรับประกัน
CREATE TABLE IF NOT EXISTS `warranties` (
  `wtID` int NOT NULL AUTO_INCREMENT,
  `wtNo` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `wtDate` date DEFAULT NULL,
  `cusID` int DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serial_number` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `warranty_start_date` date DEFAULT NULL,
  `warranty_end_date` date DEFAULT NULL,
  `warranty_period` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warranty_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'standard',
  `coverage_details` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`wtID`),
  UNIQUE KEY `wtNo` (`wtNo`),
  KEY `idx_cusID` (`cusID`),
  KEY `idx_serial_number` (`serial_number`),
  KEY `idx_warranty_end_date` (`warranty_end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางประวัติการซ่อมภายใต้การรับประกัน
CREATE TABLE IF NOT EXISTS `warranty_claims` (
  `claimID` int NOT NULL AUTO_INCREMENT,
  `wtID` int NOT NULL,
  `claim_date` date DEFAULT NULL,
  `issue_description` text COLLATE utf8mb4_unicode_ci,
  `resolution` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `resolved_date` date DEFAULT NULL,
  `technician` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`claimID`),
  KEY `idx_wtID` (`wtID`),
  CONSTRAINT `fk_claims_wtID` FOREIGN KEY (`wtID`) REFERENCES `warranties` (`wtID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
