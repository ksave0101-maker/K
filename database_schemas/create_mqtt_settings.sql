-- MQTT Settings Table
-- เก็บการตั้งค่า MQTT สำหรับแต่ละ user และ site

CREATE TABLE IF NOT EXISTS `mqtt_settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `site` VARCHAR(100) NOT NULL COMMENT 'thailand, korea',
  `host` VARCHAR(255) NOT NULL DEFAULT 'broker.example.com',
  `port` INT NOT NULL DEFAULT 1883,
  `username` VARCHAR(255) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL COMMENT 'Encrypted password',
  `topic` VARCHAR(255) DEFAULT NULL,
  `interval` INT NOT NULL DEFAULT 30 COMMENT 'Interval in seconds',
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(100) DEFAULT 'system',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_site_mqtt` (`user_id`, `site`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='ตารางเก็บการตั้งค่า MQTT broker';
