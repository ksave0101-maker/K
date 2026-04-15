CREATE TABLE IF NOT EXISTS `kr_production_updates` (
  `id` VARCHAR(64) NOT NULL,
  `orderNumber` VARCHAR(64) NOT NULL,
  `productName` VARCHAR(255) DEFAULT NULL,
  `branch` VARCHAR(64) NOT NULL,
  `branchCode` VARCHAR(8) NOT NULL,
  `totalQuantity` DECIMAL(18,2) NOT NULL DEFAULT 0,
  `completedQuantity` DECIMAL(18,2) NOT NULL DEFAULT 0,
  `progressPercent` DECIMAL(6,2) NOT NULL DEFAULT 0,
  `currentStage` VARCHAR(32) NOT NULL DEFAULT 'assembly',
  `assignedTeam` VARCHAR(255) DEFAULT NULL,
  `startDate` DATE DEFAULT NULL,
  `estimatedCompletion` DATE DEFAULT NULL,
  `lastUpdate` DATE DEFAULT NULL,
  `notes` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
