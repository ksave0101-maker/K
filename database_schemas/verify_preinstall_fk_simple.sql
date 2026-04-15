-- =========================================================================
-- Verify FK Constraints - MySQL 5.7 Compatible
-- =========================================================================

-- 1. Check actual FK constraints (MySQL 5.7 compatible)
SELECT 
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'power_records_preinstall' 
  AND TABLE_SCHEMA = 'ksystem'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- =========================================================================
-- 2. Show full table structure 
-- =========================================================================

SHOW CREATE TABLE power_records_preinstall\G

-- =========================================================================
-- 3. Count device_id vs ksaveID linkage
-- =========================================================================

SELECT 
  COUNT(*) as total_rows,
  COUNT(CASE WHEN device_id IS NOT NULL THEN 1 END) as has_device_id,
  COUNT(CASE WHEN ksaveID IS NOT NULL THEN 1 END) as has_ksaveID,
  COUNT(CASE WHEN device_id IS NOT NULL AND ksaveID IS NOT NULL THEN 1 END) as has_both
FROM power_records_preinstall;

-- =========================================================================
-- 4. Sample data - check device_id linking to devices
-- =========================================================================

SELECT 
  pp.id,
  pp.device_id,
  pp.ksaveID,
  d.deviceID,
  d.deviceName,
  d.ksaveID as devices_ksaveID,
  pp.record_time
FROM power_records_preinstall pp
LEFT JOIN devices d ON pp.device_id = d.deviceID
LIMIT 20;
