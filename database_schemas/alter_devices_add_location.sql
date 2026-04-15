-- Add Location Columns to Devices Table
-- เพิ่มคอลัมน์ latitude และ longitude ในตาราง devices

ALTER TABLE `devices`
ADD COLUMN IF NOT EXISTS `latitude` DECIMAL(10, 8) DEFAULT NULL COMMENT 'พิกัดละติจูด',
ADD COLUMN IF NOT EXISTS `longitude` DECIMAL(11, 8) DEFAULT NULL COMMENT 'พิกัดลองจิจูด',
ADD INDEX IF NOT EXISTS `idx_location` (`latitude`, `longitude`);
