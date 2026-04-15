-- Create customers table for Thailand branch
-- Created: 2026-03-24

CREATE TABLE IF NOT EXISTS customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT 'ชื่อลูกค้า',
  company VARCHAR(255) NULL COMMENT 'บริษัท',
  email VARCHAR(255) NULL,
  phone VARCHAR(50) NULL COMMENT 'เบอร์โทรศัพท์',

  -- Thai Address Format
  house_number VARCHAR(50) NULL COMMENT 'เลขที่',
  moo VARCHAR(10) NULL COMMENT 'หมู่ที่',
  tambon VARCHAR(100) NULL COMMENT 'แขวง/ตำบล',
  amphoe VARCHAR(100) NULL COMMENT 'เขต/อำเภอ',
  province VARCHAR(100) NULL COMMENT 'จังหวัด',
  postcode VARCHAR(10) NULL COMMENT 'รหัสไปรษณีย์',

  subject VARCHAR(255) NULL COMMENT 'หัวข้อ',
  message TEXT NULL COMMENT 'ข้อความ',

  is_active TINYINT(1) DEFAULT 1,
  created_by VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_name (name),
  INDEX idx_phone (phone),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='ตารางลูกค้า - สาขาประเทศไทย';
