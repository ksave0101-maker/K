-- Device Notifications Settings Table
-- เก็บการตั้งค่าการแจ้งเตือนสำหรับแต่ละอุปกรณ์

CREATE TABLE IF NOT EXISTS `device_notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `device_id` INT NOT NULL,
  `alarm_enabled` TINYINT(1) DEFAULT 1 COMMENT 'เปิด/ปิดการแจ้งเตือนหลัก',
  `high_active_enabled` TINYINT(1) DEFAULT 0 COMMENT 'แจ้งเตือนเมื่อค่าสูงกว่ากำหนด',
  `low_active_enabled` TINYINT(1) DEFAULT 0 COMMENT 'แจ้งเตือนเมื่อค่าต่ำกว่ากำหนด',
  `message_enabled` TINYINT(1) DEFAULT 0 COMMENT 'ส่งข้อความแจ้งเตือน',
  `email_enabled` TINYINT(1) DEFAULT 0 COMMENT 'ส่งอีเมลแจ้งเตือน',
  `output_enabled` TINYINT(1) DEFAULT 0 COMMENT 'ส่งสัญญาณ output',
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(100) DEFAULT 'system',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_device_notification` (`device_id`),
  CONSTRAINT `fk_device_notifications_device`
    FOREIGN KEY (`device_id`)
    REFERENCES `devices`(`deviceID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='ตารางเก็บการตั้งค่าการแจ้งเตือนของอุปกรณ์';
