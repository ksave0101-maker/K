SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `device_notifications`;
CREATE TABLE `device_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `device_id` int(11) NOT NULL,
  `alarm_enabled` tinyint(1) DEFAULT 1,
  `high_active_enabled` tinyint(1) DEFAULT 0,
  `low_active_enabled` tinyint(1) DEFAULT 0,
  `message_enabled` tinyint(1) DEFAULT 0,
  `email_enabled` tinyint(1) DEFAULT 0,
  `output_enabled` tinyint(1) DEFAULT 0,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `created_by` varchar(100) DEFAULT 'system',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_device_notification` (`device_id`),
  CONSTRAINT `fk_device_notifications_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`deviceID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `device_status_log`;
CREATE TABLE `device_status_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `device_id` int(11) NOT NULL,
  `previous_status` enum('online','offline') NOT NULL,
  `new_status` enum('online','offline') NOT NULL,
  `changed_at` timestamp NULL DEFAULT current_timestamp(),
  `notification_sent` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_device` (`device_id`),
  KEY `idx_changed` (`changed_at`),
  CONSTRAINT `device_status_log_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `devices` (`deviceID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `goods_receipts`;
CREATE TABLE `goods_receipts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gr_number` varchar(50) NOT NULL,
  `po_number` varchar(50) DEFAULT NULL,
  `supplier_name` varchar(200) DEFAULT NULL,
  `received_date` date DEFAULT NULL,
  `status` enum('draft','received','verified','cancelled') DEFAULT 'draft',
  `notes` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `branch` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gr_number` (`gr_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `production_orders`;
CREATE TABLE `production_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `po_number` varchar(50) NOT NULL,
  `product_name` varchar(200) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `branch` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_number` (`po_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'ksystem';
