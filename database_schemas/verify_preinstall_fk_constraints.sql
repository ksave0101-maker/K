-- =========================================================================
-- Verify FK Constraints in power_records_preinstall
-- =========================================================================

-- 1. Check actual FK constraints
SELECT 
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME,
  UPDATE_RULE,
  DELETE_RULE
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'power_records_preinstall' 
  AND TABLE_SCHEMA = 'ksystem'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- =========================================================================
-- 2. Check referential constraints with more details
-- =========================================================================

SELECT 
  CONSTRAINT_NAME,
  CONSTRAINT_TYPE,
  TABLE_NAME,
  REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE TABLE_NAME = 'power_records_preinstall'
  AND CONSTRAINT_SCHEMA = 'ksystem';

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
-- 4. Check if device_id matches devices.deviceID
-- =========================================================================

SELECT 
  pp.id,
  pp.device_id,
  pp.ksaveID,
  d.deviceID,
  d.deviceName,
  d.ksaveID as devices_ksaveID
FROM power_records_preinstall pp
LEFT JOIN devices d ON pp.device_id = d.deviceID
LIMIT 20;

-- =========================================================================
-- 5. Show table structure with constraints
-- =========================================================================

SHOW CREATE TABLE power_records_preinstall\G

-- =========================================================================
-- 6. Check all FK in power_records_preinstall table
-- =========================================================================

SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_NAME = 'power_records_preinstall' 
AND TABLE_SCHEMA = 'ksystem'
AND CONSTRAINT_TYPE = 'FOREIGN KEY';
