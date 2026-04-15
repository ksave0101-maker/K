-- ===========================================================================
-- Add Foreign Keys to All Device-Related Tables (FIXED SYNTAX)
-- ===========================================================================

-- 1. POWER_RECORDS
ALTER TABLE `power_records` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `power_records` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;
ALTER TABLE `power_records` ADD INDEX IF NOT EXISTS `idx_power_records_deviceID` (`deviceID`);
ALTER TABLE `power_records` ADD INDEX IF NOT EXISTS `idx_power_records_series_no` (`series_no`);
ALTER TABLE `power_records` ADD CONSTRAINT IF NOT EXISTS `fk_power_records_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. POWER_RECORDS_PREINSTALL
ALTER TABLE `power_records_preinstall` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `power_records_preinstall` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;
ALTER TABLE `power_records_preinstall` ADD INDEX IF NOT EXISTS `idx_preinstall_deviceID` (`deviceID`);
ALTER TABLE `power_records_preinstall` ADD INDEX IF NOT EXISTS `idx_preinstall_series_no` (`series_no`);
ALTER TABLE `power_records_preinstall` ADD CONSTRAINT IF NOT EXISTS `fk_power_records_preinstall_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. DEVICE_NOTIFICATIONS
ALTER TABLE `device_notifications` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `device_notifications` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;
ALTER TABLE `device_notifications` ADD INDEX IF NOT EXISTS `idx_device_notification_deviceID` (`deviceID`);
ALTER TABLE `device_notifications` ADD INDEX IF NOT EXISTS `idx_device_notification_series_no` (`series_no`);
ALTER TABLE `device_notifications` ADD CONSTRAINT IF NOT EXISTS `fk_device_notifications_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. MQTT_SETTINGS
ALTER TABLE `mqtt_settings` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `mqtt_settings` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;
ALTER TABLE `mqtt_settings` ADD INDEX IF NOT EXISTS `idx_mqtt_deviceID` (`deviceID`);
ALTER TABLE `mqtt_settings` ADD INDEX IF NOT EXISTS `idx_mqtt_series_no` (`series_no`);
ALTER TABLE `mqtt_settings` ADD CONSTRAINT IF NOT EXISTS `fk_mqtt_settings_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. METER_DATA
ALTER TABLE `meter_data` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `meter_data` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;
ALTER TABLE `meter_data` ADD INDEX IF NOT EXISTS `idx_meter_data_deviceID` (`deviceID`);
ALTER TABLE `meter_data` ADD INDEX IF NOT EXISTS `idx_meter_data_series_no` (`series_no`);
ALTER TABLE `meter_data` ADD CONSTRAINT IF NOT EXISTS `fk_meter_data_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. FIELD_WORK_LOGS
ALTER TABLE `field_work_logs` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `field_work_logs` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;
ALTER TABLE `field_work_logs` ADD INDEX IF NOT EXISTS `idx_field_work_deviceID` (`deviceID`);
ALTER TABLE `field_work_logs` ADD INDEX IF NOT EXISTS `idx_field_work_series_no` (`series_no`);
ALTER TABLE `field_work_logs` ADD CONSTRAINT IF NOT EXISTS `fk_field_work_logs_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. DEVICE_STATUS_LOG
ALTER TABLE `device_status_log` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `device_status_log` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;
ALTER TABLE `device_status_log` ADD INDEX IF NOT EXISTS `idx_device_status_deviceID` (`deviceID`);
ALTER TABLE `device_status_log` ADD INDEX IF NOT EXISTS `idx_device_status_series_no` (`series_no`);
ALTER TABLE `device_status_log` ADD CONSTRAINT IF NOT EXISTS `fk_device_status_log_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 8. PRE_INSTALLATION_MATERIALS
ALTER TABLE `pre_installation_materials` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `pre_installation_materials` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;
ALTER TABLE `pre_installation_materials` ADD INDEX IF NOT EXISTS `idx_preinstall_mat_deviceID` (`deviceID`);
ALTER TABLE `pre_installation_materials` ADD INDEX IF NOT EXISTS `idx_preinstall_mat_series_no` (`series_no`);
ALTER TABLE `pre_installation_materials` ADD CONSTRAINT IF NOT EXISTS `fk_preinstall_materials_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 9. PRE_INSTALLATION_STEPS
ALTER TABLE `pre_installation_steps` ADD COLUMN IF NOT EXISTS `deviceID` INT NULL;
ALTER TABLE `pre_installation_steps` ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) NULL;
ALTER TABLE `pre_installation_steps` ADD INDEX IF NOT EXISTS `idx_preinstall_steps_deviceID` (`deviceID`);
ALTER TABLE `pre_installation_steps` ADD INDEX IF NOT EXISTS `idx_preinstall_steps_series_no` (`series_no`);
ALTER TABLE `pre_installation_steps` ADD CONSTRAINT IF NOT EXISTS `fk_preinstall_steps_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;
