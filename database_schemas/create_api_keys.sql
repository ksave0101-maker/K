-- API Keys Management Table
-- เก็บ API keys สำหรับ user authentication และ integration

CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `key_name` VARCHAR(255) NOT NULL COMMENT 'ชื่อของ API key',
  `api_key` VARCHAR(64) NOT NULL COMMENT 'Public API key (64 chars hex)',
  `api_secret` VARCHAR(128) NOT NULL COMMENT 'Secret key (128 chars hex)',
  `permissions` JSON DEFAULT NULL COMMENT 'Permissions object',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT 'สถานะการใช้งาน',
  `last_used_at` DATETIME DEFAULT NULL COMMENT 'ใช้งานครั้งล่าสุด',
  `expires_at` DATETIME DEFAULT NULL COMMENT 'วันหมดอายุ',
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(100) DEFAULT 'system',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_api_key` (`api_key`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `fk_api_keys_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `user_list`(`userId`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='ตารางเก็บ API keys สำหรับการเชื่อมต่อ';
