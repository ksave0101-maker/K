-- ตรวจสอบตารางทั้งหมดในฐานข้อมูล ksystem
SHOW TABLES;

-- ตรวจสอบตารางที่เกี่ยวกับกระแสไฟ
SHOW TABLES LIKE '%power%';
SHOW TABLES LIKE '%meter%';
SHOW TABLES LIKE '%current%';
SHOW TABLES LIKE '%voltage%';

-- ดูรายละเอียดตาราง meter_data ถ้ามี
DESCRIBE meter_data;

-- ดูรายละเอียดตาราง power_racord ถ้ามี
DESCRIBE power_racord;
