CREATE TABLE IF NOT EXISTS `kr_production_reports` (
  `report_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_no` VARCHAR(32) NOT NULL,
  `branch_key` VARCHAR(32) NOT NULL,
  `branch_name` VARCHAR(64) NOT NULL,
  `pdo_id` VARCHAR(64) NOT NULL,
  `pdo_no` VARCHAR(64) NOT NULL,
  `product_name` VARCHAR(255) DEFAULT NULL,
  `quantity` DECIMAL(18,2) NOT NULL DEFAULT 0,
  `created_by` VARCHAR(120) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  UNIQUE KEY `uq_report_no` (`report_no`),
  UNIQUE KEY `uq_branch_pdo` (`branch_key`, `pdo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
