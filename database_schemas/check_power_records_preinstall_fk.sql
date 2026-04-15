-- =========================================================================
-- Check power_records_preinstall data and FK relationships
-- =========================================================================

-- 1. View power_records_preinstall data with device info
SELECT 
  pp.id,
  pp.deviceID,
  pp.ksaveID,
  d.deviceID,
  d.deviceName,
  d.ksaveID,
  pp.record_time,
  pp.before_L1,
  pp.before_L2,
  pp.before_L3,
  pp.metrics_kWh
FROM `power_records_preinstall` pp
LEFT JOIN `devices` d ON pp.deviceID = d.deviceID OR pp.ksaveID = d.ksaveID
ORDER BY pp.id DESC
LIMIT 50;

-- =========================================================================
-- 2. Check table structure - PK and FK
-- =========================================================================

-- Check Primary Key
SELECT COLUMN_NAME, COLUMN_KEY, EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'power_records_preinstall' AND TABLE_SCHEMA = 'ksystem'
AND COLUMN_KEY = 'PRI';

-- =========================================================================
-- 3. Check Foreign Keys in power_records_preinstall
-- =========================================================================

SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'power_records_preinstall' AND TABLE_SCHEMA = 'ksystem'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- =========================================================================
-- 4. Check Indexes
-- =========================================================================

SELECT INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_NAME = 'power_records_preinstall' AND TABLE_SCHEMA = 'ksystem'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- =========================================================================
-- 5. Count records
-- =========================================================================

SELECT 
  COUNT(*) as total_records,
  SUM(CASE WHEN deviceID IS NOT NULL THEN 1 ELSE 0 END) as with_deviceID,
  SUM(CASE WHEN ksaveID IS NOT NULL THEN 1 ELSE 0 END) as with_ksaveID
FROM `power_records_preinstall`;

-- =========================================================================
-- 6. Check for orphan records (deviceID not in devices table)
-- =========================================================================

SELECT pp.id, pp.deviceID, pp.ksaveID
FROM `power_records_preinstall` pp
WHERE pp.deviceID IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM `devices` d WHERE d.deviceID = pp.deviceID)
LIMIT 10;
