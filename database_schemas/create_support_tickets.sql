-- Support Tickets Table
-- เก็บ tickets สำหรับ customer support

CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ticket_id` VARCHAR(50) NOT NULL COMMENT 'Format: TKT-YYYYMMDD-XXXX',
  `user_id` INT NOT NULL,
  `subject` TEXT NOT NULL COMMENT 'หัวข้อ ticket',
  `type` VARCHAR(100) NOT NULL COMMENT 'ประเภท: Bug Report, Feature Request, etc.',
  `priority` VARCHAR(50) NOT NULL DEFAULT 'Normal' COMMENT 'ความสำคัญ: Low, Normal, High',
  `status` VARCHAR(50) NOT NULL DEFAULT 'Open' COMMENT 'สถานะ: Open, Closed, Pending',
  `description` TEXT DEFAULT NULL COMMENT 'รายละเอียดของ ticket',
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(100) DEFAULT 'system',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_ticket_id` (`ticket_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  CONSTRAINT `fk_support_tickets_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `user_list`(`userId`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='ตารางเก็บ support tickets';
