-- =========================================================================
-- Query: power_records_preinstall JOIN series_no from devices
-- =========================================================================

-- 1. Show all power_records_preinstall with series_no from devices
SELECT 
  pp.id,
  pp.device_id,
  pp.ksaveID,
  d.deviceID,
  d.deviceName,
  d.series_no,
  d.ksaveID as devices_ksaveID,
  pp.record_time,
  pp.before_kWh,
  pp.metrics_kWh,
  pp.energy_reduction
FROM power_records_preinstall pp
LEFT JOIN devices d ON pp.device_id = d.deviceID
ORDER BY pp.id DESC
LIMIT 50;

-- =========================================================================
-- 2. Check if FK constraint exists between power_records_preinstall and devices
-- =========================================================================

SELECT 
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'power_records_preinstall' 
  AND TABLE_SCHEMA = 'ksystem'
  AND REFERENCED_TABLE_NAME = 'devices';

-- =========================================================================
-- 3. If FK missing - Add device_id FK constraint
-- =========================================================================
-- ALTER TABLE power_records_preinstall 
-- ADD CONSTRAINT fk_preinstall_device_id 
-- FOREIGN KEY (device_id) REFERENCES devices(deviceID) 
-- ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- 4. Count groupby series_no and ksaveID
-- =========================================================================

SELECT 
  COUNT(*) as record_count,
  d.series_no,
  d.deviceID,
  d.ksaveID,
  d.deviceName
FROM power_records_preinstall pp
LEFT JOIN devices d ON pp.device_id = d.deviceID
GROUP BY d.deviceID, d.series_no
ORDER BY record_count DESC;

-- =========================================================================
-- 5. Check for orphan records (device_id not in devices)
-- =========================================================================

SELECT pp.id, pp.device_id, pp.ksaveID, COUNT(*) as count_orphan
FROM power_records_preinstall pp
WHERE pp.device_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM devices d WHERE d.deviceID = pp.device_id)
GROUP BY pp.device_id;
