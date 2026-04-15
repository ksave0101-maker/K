-- ตาราง Document Counters สำหรับสร้างเลขเอกสารไม่ซ้ำกัน
CREATE TABLE IF NOT EXISTS `document_counters` (
  `prefix` varchar(10) NOT NULL,
  `year_month` varchar(6) NOT NULL,
  `counter` int NOT NULL DEFAULT 0,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prefix`, `year_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
