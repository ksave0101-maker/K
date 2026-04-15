-- Fix missing document tables
USE ksystem;

-- Create warranties table (if missing)
CREATE TABLE IF NOT EXISTS `warranties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wtNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: WT-YYYYMM-####',
  `wtDate` date NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `warranty_start_date` date NOT NULL,
  `warranty_period` int NOT NULL COMMENT 'Period in months',
  `warranty_end_date` date NOT NULL,
  `warranty_type` enum('manufacturer','extended','store') DEFAULT 'manufacturer',
  `coverage_details` text,
  `notes` text,
  `status` enum('active','expired','claimed','cancelled') DEFAULT 'active',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_wtNo` (`wtNo`),
  INDEX `idx_customer` (`customer_name`),
  INDEX `idx_expiry` (`warranty_end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create other potentially missing tables
CREATE TABLE IF NOT EXISTS `document_counters` (
  `prefix` varchar(10) NOT NULL COMMENT 'Document prefix (CN, GR, PV, etc.)',
  `year_month` varchar(6) NOT NULL COMMENT 'Format: YYYYMM',
  `counter` int NOT NULL DEFAULT 0 COMMENT 'Auto-increment counter',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prefix`, `year_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stock_cards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scNo` varchar(50) NOT NULL UNIQUE COMMENT 'Format: SC-YYYYMM-####',
  `scDate` date NOT NULL,
  `product_code` varchar(100) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `transaction_type` enum('in','out','adjustment') NOT NULL,
  `quantity_in` decimal(10,2) DEFAULT 0.00,
  `quantity_out` decimal(10,2) DEFAULT 0.00,
  `balance` decimal(10,2) DEFAULT 0.00,
  `unit` varchar(50) DEFAULT 'pcs',
  `reference_no` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_scNo` (`scNo`),
  INDEX `idx_product` (`product_code`),
  INDEX `idx_date` (`scDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify created tables
SELECT
    'warranties' AS table_name,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END AS status
FROM information_schema.tables
WHERE table_schema = 'ksystem' AND table_name = 'warranties'

UNION ALL

SELECT
    'document_counters',
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END
FROM information_schema.tables
WHERE table_schema = 'ksystem' AND table_name = 'document_counters'

UNION ALL

SELECT
    'stock_cards',
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ MISSING' END
FROM information_schema.tables
WHERE table_schema = 'ksystem' AND table_name = 'stock_cards';

SELECT '✅ Missing tables created!' AS result;
