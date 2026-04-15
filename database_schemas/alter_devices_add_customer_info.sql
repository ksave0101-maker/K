-- Add Customer Info Columns to Devices Table
-- เพิ่มคอลัมน์ข้อมูลลูกค้า: ชื่อ, เบอร์โทร, ที่อยู่

ALTER TABLE `devices`
ADD COLUMN IF NOT EXISTS `customerName` VARCHAR(255) DEFAULT NULL COMMENT 'ชื่อลูกค้า / 고객명',
ADD COLUMN IF NOT EXISTS `customerPhone` VARCHAR(50) DEFAULT NULL COMMENT 'เบอร์โทรลูกค้า / 고객 전화번호',
ADD COLUMN IF NOT EXISTS `customerAddress` TEXT DEFAULT NULL COMMENT 'ที่อยู่ลูกค้า / 고객 주소';
