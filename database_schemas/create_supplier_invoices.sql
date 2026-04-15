-- ตาราง Supplier Invoice (SI) - ใบแจ้งหนี้จากผู้ขาย
CREATE TABLE IF NOT EXISTS `supplier_invoices` (
  `siID` int NOT NULL AUTO_INCREMENT,
  `siNo` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `siDate` date DEFAULT NULL,
  `supplier_invoice_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poID` int DEFAULT NULL,
  `poNo` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplierID` int DEFAULT NULL,
  `supplier_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(12,2) DEFAULT 0.00,
  `discount` decimal(12,2) DEFAULT 0.00,
  `vat` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `due_date` date DEFAULT NULL,
  `payment_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'unpaid',
  `payment_date` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`siID`),
  UNIQUE KEY `siNo` (`siNo`),
  KEY `idx_poID` (`poID`),
  KEY `idx_supplierID` (`supplierID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางรายการในใบแจ้งหนี้จากผู้ขาย
CREATE TABLE IF NOT EXISTS `supplier_invoice_items` (
  `itemID` int NOT NULL AUTO_INCREMENT,
  `siID` int NOT NULL,
  `product_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `quantity` decimal(10,2) DEFAULT 1.00,
  `unit_price` decimal(12,2) DEFAULT 0.00,
  `total_price` decimal(12,2) DEFAULT 0.00,
  PRIMARY KEY (`itemID`),
  KEY `idx_siID` (`siID`),
  CONSTRAINT `fk_si_items_siID` FOREIGN KEY (`siID`) REFERENCES `supplier_invoices` (`siID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
