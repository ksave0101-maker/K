-- ตาราง Production Order (PO/MO) - ใบสั่งผลิต
CREATE TABLE IF NOT EXISTS `production_orders` (
  `poID` int NOT NULL AUTO_INCREMENT,
  `poNo` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `poDate` date DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `product_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity_ordered` decimal(10,2) DEFAULT 0.00,
  `quantity_produced` decimal(10,2) DEFAULT 0.00,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pcs',
  `start_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `actual_start_date` date DEFAULT NULL,
  `actual_end_date` date DEFAULT NULL,
  `priority` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `production_line` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shift` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supervisor` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quality_check_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `defect_quantity` decimal(10,2) DEFAULT 0.00,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`poID`),
  UNIQUE KEY `poNo` (`poNo`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_status` (`status`),
  KEY `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางวัตถุดิบที่ใช้ในการผลิต
CREATE TABLE IF NOT EXISTS `production_order_materials` (
  `materialID` int NOT NULL AUTO_INCREMENT,
  `poID` int NOT NULL,
  `material_id` int DEFAULT NULL,
  `material_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `material_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity_required` decimal(10,2) DEFAULT 0.00,
  `quantity_used` decimal(10,2) DEFAULT 0.00,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pcs',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  PRIMARY KEY (`materialID`),
  KEY `idx_poID` (`poID`),
  CONSTRAINT `fk_po_materials_poID` FOREIGN KEY (`poID`) REFERENCES `production_orders` (`poID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางขั้นตอนการผลิต
CREATE TABLE IF NOT EXISTS `production_order_steps` (
  `stepID` int NOT NULL AUTO_INCREMENT,
  `poID` int NOT NULL,
  `step_number` int DEFAULT 1,
  `step_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `duration_minutes` int DEFAULT 0,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `assigned_to` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`stepID`),
  KEY `idx_poID` (`poID`),
  CONSTRAINT `fk_po_steps_poID` FOREIGN KEY (`poID`) REFERENCES `production_orders` (`poID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
