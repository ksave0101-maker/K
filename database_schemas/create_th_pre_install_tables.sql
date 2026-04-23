-- Thailand Pre-Installation Analysis Tables
-- Created: 2026-04-23

CREATE TABLE IF NOT EXISTS `th_pre_install_batches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `batchId` VARCHAR(100) NOT NULL UNIQUE,
  `customerName` VARCHAR(255) DEFAULT '',
  `location` VARCHAR(500) DEFAULT '',
  `createdAt` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_batchId` (`batchId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Batch headers for pre-installation current records';

CREATE TABLE IF NOT EXISTS `th_pre_install_batch_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `batchId` VARCHAR(100) NOT NULL,
  `record_order` INT DEFAULT 0,
  `date` VARCHAR(50) DEFAULT '',
  `time` VARCHAR(20) DEFAULT '',
  `L1` VARCHAR(50) DEFAULT '',
  `L2` VARCHAR(50) DEFAULT '',
  `L3` VARCHAR(50) DEFAULT '',
  `N` VARCHAR(50) DEFAULT '',
  `voltage` VARCHAR(50) DEFAULT '380',
  `pf` VARCHAR(50) DEFAULT '0.85',
  `note` TEXT,
  KEY `idx_batchId` (`batchId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Manual 7-day current entry rows per batch (form table)';

CREATE TABLE IF NOT EXISTS `th_pre_install_phase_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `batchId` VARCHAR(100) NOT NULL,
  `meter` INT DEFAULT 1,
  `phase` VARCHAR(10) NOT NULL,
  `record_time` VARCHAR(100) DEFAULT '',
  `value` FLOAT DEFAULT 0,
  `voltage` VARCHAR(50) DEFAULT '',
  `pf` VARCHAR(50) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_batchId_meter_phase` (`batchId`, `meter`, `phase`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='CSV/Excel/PDF parsed records per phase (Upload tab)';

CREATE TABLE IF NOT EXISTS `th_pre_install_analysis` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `branch` VARCHAR(100) DEFAULT '',
  `location` VARCHAR(500) DEFAULT '',
  `equipment` VARCHAR(255) DEFAULT '',
  `datetime` DATETIME DEFAULT NULL,
  `measurementPeriod` VARCHAR(100) DEFAULT '',
  `technician` VARCHAR(255) DEFAULT '',
  `voltage` VARCHAR(50) DEFAULT '380',
  `frequency` FLOAT DEFAULT 50,
  `powerFactor` FLOAT DEFAULT 0.85,
  `thd` FLOAT DEFAULT 0,
  `current_L1` FLOAT DEFAULT 0,
  `current_L2` FLOAT DEFAULT 0,
  `current_L3` FLOAT DEFAULT 0,
  `current_N` FLOAT DEFAULT 0,
  `balance` VARCHAR(20) DEFAULT 'Good',
  `result` VARCHAR(50) DEFAULT 'Recommended',
  `recommendation` TEXT,
  `notes` TEXT,
  `recommendedProduct` VARCHAR(255) DEFAULT NULL,
  `engineerName` VARCHAR(255) DEFAULT '',
  `engineerLicense` VARCHAR(100) DEFAULT '',
  `approvalStatus` VARCHAR(20) DEFAULT 'Pending',
  `approvalDate` DATETIME DEFAULT NULL,
  `approverName` VARCHAR(255) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Analysis form results saved from Form tab';
