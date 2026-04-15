-- ตาราง Payment Voucher (PV) - ใบชำระเงิน
CREATE TABLE IF NOT EXISTS `payment_vouchers` (
  `pvID` int NOT NULL AUTO_INCREMENT,
  `pvNo` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pvDate` date DEFAULT NULL,
  `payment_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'supplier',
  `payee_id` int DEFAULT NULL,
  `payee_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT 0.00,
  `payment_method` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Bank Transfer',
  `bank_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cheque_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_no` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approved_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pvID`),
  UNIQUE KEY `pvNo` (`pvNo`),
  KEY `idx_payment_type` (`payment_type`),
  KEY `idx_payee_id` (`payee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางรายการในใบชำระเงิน (สำหรับกรณีที่จ่ายหลายรายการพร้อมกัน)
CREATE TABLE IF NOT EXISTS `payment_voucher_items` (
  `itemID` int NOT NULL AUTO_INCREMENT,
  `pvID` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `amount` decimal(12,2) DEFAULT 0.00,
  `reference_doc` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`itemID`),
  KEY `idx_pvID` (`pvID`),
  CONSTRAINT `fk_pv_items_pvID` FOREIGN KEY (`pvID`) REFERENCES `payment_vouchers` (`pvID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
