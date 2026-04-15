-- ตาราง Expense Bill (EB) - บิลค่าใช้จ่าย
CREATE TABLE IF NOT EXISTS `expense_bills` (
  `ebID` int NOT NULL AUTO_INCREMENT,
  `ebNo` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ebDate` date DEFAULT NULL,
  `expense_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendor_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendor_invoice_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT 0.00,
  `vat` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `payment_method` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'unpaid',
  `payment_date` date DEFAULT NULL,
  `department` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `approved_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ebID`),
  UNIQUE KEY `ebNo` (`ebNo`),
  KEY `idx_expense_type` (`expense_type`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางรายละเอียดค่าใช้จ่าย (สำหรับแยกรายการย่อย)
CREATE TABLE IF NOT EXISTS `expense_bill_items` (
  `itemID` int NOT NULL AUTO_INCREMENT,
  `ebID` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `quantity` decimal(10,2) DEFAULT 1.00,
  `unit_price` decimal(12,2) DEFAULT 0.00,
  `total_price` decimal(12,2) DEFAULT 0.00,
  PRIMARY KEY (`itemID`),
  KEY `idx_ebID` (`ebID`),
  CONSTRAINT `fk_eb_items_ebID` FOREIGN KEY (`ebID`) REFERENCES `expense_bills` (`ebID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
