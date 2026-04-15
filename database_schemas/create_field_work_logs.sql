-- Create Field Work Logs table
-- Migration: 2026-03-19
-- Purpose: Track field work and on-site activities

USE ksystem;

-- Field Work Logs (ใบบันทึกทำงานนอกสถานที่)
CREATE TABLE IF NOT EXISTS `field_work_logs` (
  `fwlID` int(11) NOT NULL AUTO_INCREMENT,
  `fwlNo` varchar(64) NOT NULL UNIQUE COMMENT 'Format: FWL-YYYYMMDD-####',
  `fwlDate` date NOT NULL,
  `work_date` date NOT NULL COMMENT 'Actual work date',
  `employee_id` int(11) DEFAULT NULL,
  `employee_name` varchar(255) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `site_location` text NOT NULL COMMENT 'Work site address',
  `site_contact_person` varchar(255) DEFAULT NULL,
  `site_contact_phone` varchar(50) DEFAULT NULL,
  `work_type` varchar(100) DEFAULT 'installation' COMMENT 'installation, maintenance, repair, inspection, survey',
  `work_description` text NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `total_hours` decimal(5,2) DEFAULT 0.00,
  `equipment_used` text DEFAULT NULL COMMENT 'Equipment and tools used',
  `materials_used` text DEFAULT NULL COMMENT 'Materials consumed',
  `work_status` varchar(50) DEFAULT 'in_progress' COMMENT 'pending, in_progress, completed, cancelled',
  `completion_percentage` int(11) DEFAULT 0 COMMENT '0-100',
  `issues_encountered` text DEFAULT NULL,
  `customer_signature` varchar(255) DEFAULT NULL COMMENT 'Signature image path or name',
  `customer_satisfaction` enum('very_satisfied','satisfied','neutral','unsatisfied','very_unsatisfied') DEFAULT NULL,
  `photos` longtext DEFAULT NULL COMMENT 'JSON array of photo URLs',
  `next_visit_required` tinyint(1) DEFAULT 0,
  `next_visit_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`fwlID`),
  UNIQUE KEY `idx_field_work_logs_fwlNo` (`fwlNo`),
  KEY `idx_field_work_logs_fwlDate` (`fwlDate`),
  KEY `idx_field_work_logs_work_date` (`work_date`),
  KEY `idx_field_work_logs_employee` (`employee_name`),
  KEY `idx_field_work_logs_customer` (`customer_name`),
  KEY `idx_field_work_logs_status` (`work_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Field work logs (ใบบันทึกทำงานนอกสถานที่)';

-- Field Work Log Tasks (รายการงานที่ทำ)
CREATE TABLE IF NOT EXISTS `field_work_log_tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fwlID` int(11) NOT NULL,
  `task_number` int(11) NOT NULL DEFAULT 1,
  `task_description` text NOT NULL,
  `task_status` varchar(50) DEFAULT 'pending' COMMENT 'pending, in_progress, completed',
  `time_spent_minutes` int(11) DEFAULT 0,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fwl_tasks_fwlID` (`fwlID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tasks in field work logs';

-- Add Foreign Keys
ALTER TABLE `field_work_log_tasks`
ADD CONSTRAINT `fk_fwl_tasks_field_work_logs`
  FOREIGN KEY (`fwlID`)
  REFERENCES `field_work_logs` (`fwlID`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Verify
SHOW TABLES LIKE 'field_work%';

SELECT '✅ Field Work Logs tables created successfully!' AS result;
