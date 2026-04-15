-- User Feedback Table
-- เก็บ feedback จากผู้ใช้งาน

CREATE TABLE IF NOT EXISTS `user_feedback` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL COMMENT 'NULL = anonymous feedback',
  `category` VARCHAR(100) NOT NULL COMMENT 'ประเภท: Suggestion, Bug Report, Feature Request, General Feedback',
  `branch` VARCHAR(50) DEFAULT NULL COMMENT 'สาขา/ประเทศ',
  `subject` VARCHAR(255) NOT NULL COMMENT 'หัวข้อ',
  `message` TEXT NOT NULL COMMENT 'ข้อความ feedback',
  `rating` INT DEFAULT 0 COMMENT 'คะแนน 0-5 ดาว',
  `status` VARCHAR(50) NOT NULL DEFAULT 'Pending' COMMENT 'สถานะ: Pending, Reviewed, Resolved',
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(100) DEFAULT 'anonymous',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `fk_user_feedback_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `user_list`(`userId`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='ตารางเก็บ feedback จากผู้ใช้';
