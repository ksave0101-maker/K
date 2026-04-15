-- Create tables for Pre-Installation Materials and Steps
-- Migration: 2026-03-19
-- Purpose: Store materials and production steps for pre-installation analysis
--          These will be referenced when creating Production Orders from Contracts

USE ksystem;

-- Pre-Installation Materials (วัตถุดิบ)
CREATE TABLE IF NOT EXISTS `pre_installation_materials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pre_inst_id` int(11) NOT NULL COMMENT 'FK to pre_installation_forms.formID',
  `material_code` varchar(100) DEFAULT NULL,
  `material_name` varchar(255) NOT NULL,
  `quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `unit` varchar(50) DEFAULT 'pcs',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pre_inst_materials_pre_inst_id` (`pre_inst_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Materials required for each pre-installation (linked to production orders)';

-- Pre-Installation Steps (ขั้นตอนการผลิต)
CREATE TABLE IF NOT EXISTS `pre_installation_steps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pre_inst_id` int(11) NOT NULL COMMENT 'FK to pre_installation_forms.formID',
  `step_number` int(11) NOT NULL,
  `step_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT 0,
  `assigned_to` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pre_inst_steps_pre_inst_id` (`pre_inst_id`),
  KEY `idx_pre_inst_steps_step_number` (`step_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Production steps for each pre-installation (linked to production orders)';

-- Add Foreign Keys
ALTER TABLE `pre_installation_materials`
ADD CONSTRAINT `fk_pre_inst_materials_pre_inst`
  FOREIGN KEY (`pre_inst_id`)
  REFERENCES `pre_installation_forms` (`formID`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `pre_installation_steps`
ADD CONSTRAINT `fk_pre_inst_steps_pre_inst`
  FOREIGN KEY (`pre_inst_id`)
  REFERENCES `pre_installation_forms` (`formID`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Verify
SHOW TABLES LIKE 'pre_installation_%';

SELECT '✅ Pre-Installation Materials and Steps tables created!' AS result;
