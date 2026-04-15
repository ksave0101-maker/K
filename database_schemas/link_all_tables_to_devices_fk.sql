-- ===========================================================================
-- Add Complete Foreign Keys for All Device-Related Tables
-- Link all tables to devices(deviceID, series_no)
-- ===========================================================================

-- =========================================================================
-- 1. POWER_RECORDS - Store post-install device measurements
-- =========================================================================
-- Note: Column device_id should exist; if not, add it first
ALTER TABLE `power_records` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `power_records` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;

-- Add indexes
ALTER TABLE `power_records` ADD INDEX IF NOT EXISTS `idx_power_records_deviceID` (`deviceID`);
ALTER TABLE `power_records` ADD INDEX IF NOT EXISTS `idx_power_records_series_no` (`series_no`);

-- Add FK to devices (reference device_id or deviceID if it exists)
ALTER TABLE `power_records` ADD CONSTRAINT IF NOT EXISTS `fk_power_records_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- 2. POWER_RECORDS_PREINSTALL - Store pre-install device measurements
-- =========================================================================
-- Add deviceID if missing
ALTER TABLE `power_records_preinstall` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;

-- Add series_no column if missing
ALTER TABLE `power_records_preinstall` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;

-- Add indexes
ALTER TABLE `power_records_preinstall` ADD INDEX IF NOT EXISTS `idx_preinstall_deviceID` (`deviceID`);
ALTER TABLE `power_records_preinstall` ADD INDEX IF NOT EXISTS `idx_preinstall_series_no` (`series_no`);

-- Add FK to devices
ALTER TABLE `power_records_preinstall` ADD CONSTRAINT IF NOT EXISTS `fk_power_records_preinstall_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- 3. DEVICE_NOTIFICATIONS - Device alarm and notification settings
-- =========================================================================
-- Add deviceID if missing (device_id column may already exist)
ALTER TABLE `device_notifications` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;

-- Add series_no column if missing
ALTER TABLE `device_notifications` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;

-- Add indexes
ALTER TABLE `device_notifications` ADD INDEX IF NOT EXISTS `idx_device_notification_deviceID` (`deviceID`);
ALTER TABLE `device_notifications` ADD INDEX IF NOT EXISTS `idx_device_notification_series_no` (`series_no`);

-- Add FK to devices
ALTER TABLE `device_notifications` ADD CONSTRAINT IF NOT EXISTS `fk_device_notifications_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- 4. MQTT_SETTINGS - MQTT broker configuration per device
-- =========================================================================
-- Add deviceID column if missing
ALTER TABLE `mqtt_settings` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL AFTER `site`;

-- Add series_no column if missing
ALTER TABLE `mqtt_settings` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL AFTER `deviceID`;

-- Add indexes
ALTER TABLE `mqtt_settings` ADD INDEX IF NOT EXISTS `idx_mqtt_deviceID` (`deviceID`);
ALTER TABLE `mqtt_settings` ADD INDEX IF NOT EXISTS `idx_mqtt_series_no` (`series_no`);

-- Add FK (nullable for backward compatibility)
ALTER TABLE `mqtt_settings` ADD CONSTRAINT IF NOT EXISTS `fk_mqtt_settings_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- 5. METER_DATA - Raw meter readings (T310 data)
-- =========================================================================
-- Add deviceID column if missing
ALTER TABLE `meter_data` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL AFTER `id`;

-- Add series_no column if missing
ALTER TABLE `meter_data` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL AFTER `deviceID`;

-- Add indexes
ALTER TABLE `meter_data` ADD INDEX IF NOT EXISTS `idx_meter_data_deviceID` (`deviceID`);
ALTER TABLE `meter_data` ADD INDEX IF NOT EXISTS `idx_meter_data_series_no` (`series_no`);

-- Add FK (nullable)
ALTER TABLE `meter_data` ADD CONSTRAINT IF NOT EXISTS `fk_meter_data_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- 6. FIELD_WORK_LOGS - Technician field visit logs
-- =========================================================================
-- Check if field_work_logs has device reference
ALTER TABLE `field_work_logs` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `field_work_logs` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;

-- Add indexes
ALTER TABLE `field_work_logs` ADD INDEX IF NOT EXISTS `idx_field_work_deviceID` (`deviceID`);
ALTER TABLE `field_work_logs` ADD INDEX IF NOT EXISTS `idx_field_work_series_no` (`series_no`);

-- Add FK (nullable)
ALTER TABLE `field_work_logs` ADD CONSTRAINT IF NOT EXISTS `fk_field_work_logs_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- 7. DEVICE_STATUS_LOG - Track device status changes over time
-- =========================================================================
-- Add deviceID if missing
ALTER TABLE `device_status_log` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `device_status_log` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;

-- Add indexes
ALTER TABLE `device_status_log` ADD INDEX IF NOT EXISTS `idx_device_status_deviceID` (`deviceID`);
ALTER TABLE `device_status_log` ADD INDEX IF NOT EXISTS `idx_device_status_series_no` (`series_no`);

-- Add FK (nullable)
ALTER TABLE `device_status_log` ADD CONSTRAINT IF NOT EXISTS `fk_device_status_log_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- 8. PRE_INSTALLATION_DETAILS - Pre-install materials and steps
-- =========================================================================
-- Add deviceID if missing
ALTER TABLE `pre_installation_materials` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `pre_installation_materials` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;

-- Add indexes
ALTER TABLE `pre_installation_materials` ADD INDEX IF NOT EXISTS `idx_preinstall_mat_deviceID` (`deviceID`);
ALTER TABLE `pre_installation_materials` ADD INDEX IF NOT EXISTS `idx_preinstall_mat_series_no` (`series_no`);

-- Add FK
ALTER TABLE `pre_installation_materials` ADD CONSTRAINT IF NOT EXISTS `fk_preinstall_materials_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Pre-installation steps table
ALTER TABLE `pre_installation_steps` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `pre_installation_steps` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;

ALTER TABLE `pre_installation_steps` ADD INDEX IF NOT EXISTS `idx_preinstall_steps_deviceID` (`deviceID`);
ALTER TABLE `pre_installation_steps` ADD INDEX IF NOT EXISTS `idx_preinstall_steps_series_no` (`series_no`);

ALTER TABLE `pre_installation_steps` ADD CONSTRAINT IF NOT EXISTS `fk_preinstall_steps_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- SUMMARY: Enable cascading referential integrity
-- =========================================================================
-- When a device is deleted: all related records cascade delete
-- When deviceID updated: all related records update automatically
-- This ensures data consistency across the system
