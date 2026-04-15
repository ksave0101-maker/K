-- =========================================================================
-- Add deviceID column to all device-related tables
-- =========================================================================

-- 1. Add deviceID to mqtt_settings
ALTER TABLE `mqtt_settings` ADD COLUMN `deviceID` INT NULL COMMENT 'Link to devices table';

-- 2. Add deviceID to power_records
ALTER TABLE `power_records` ADD COLUMN `deviceID` INT NULL COMMENT 'Link to devices table';

-- 3. Add deviceID to power_records_preinstall
ALTER TABLE `power_records_preinstall` ADD COLUMN `deviceID` INT NULL COMMENT 'Link to devices table';

-- 4. Add deviceID to meter_data
ALTER TABLE `meter_data` ADD COLUMN `deviceID` INT NULL COMMENT 'Link to devices table';

-- 5. Add deviceID to field_work_logs
ALTER TABLE `field_work_logs` ADD COLUMN `deviceID` INT NULL COMMENT 'Link to devices table';

-- 6. Add deviceID to pre_installation_materials
ALTER TABLE `pre_installation_materials` ADD COLUMN `deviceID` INT NULL COMMENT 'Link to devices table';

-- 7. Add deviceID to pre_installation_steps
ALTER TABLE `pre_installation_steps` ADD COLUMN `deviceID` INT NULL COMMENT 'Link to devices table';

-- =========================================================================
-- Add indexes
-- =========================================================================

ALTER TABLE `mqtt_settings` ADD INDEX `idx_mqtt_deviceID` (`deviceID`);
ALTER TABLE `power_records` ADD INDEX `idx_power_records_deviceID` (`deviceID`);
ALTER TABLE `power_records_preinstall` ADD INDEX `idx_preinstall_deviceID` (`deviceID`);
ALTER TABLE `meter_data` ADD INDEX `idx_meter_data_deviceID` (`deviceID`);
ALTER TABLE `field_work_logs` ADD INDEX `idx_field_work_deviceID` (`deviceID`);
ALTER TABLE `pre_installation_materials` ADD INDEX `idx_preinstall_mat_deviceID` (`deviceID`);
ALTER TABLE `pre_installation_steps` ADD INDEX `idx_preinstall_steps_deviceID` (`deviceID`);

-- =========================================================================
-- Add Foreign Keys
-- =========================================================================

ALTER TABLE `mqtt_settings` ADD CONSTRAINT `fk_mqtt_to_devices` FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `power_records` ADD CONSTRAINT `fk_power_rec_to_devices` FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `power_records_preinstall` ADD CONSTRAINT `fk_power_pre_to_devices` FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `meter_data` ADD CONSTRAINT `fk_meter_to_devices` FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `field_work_logs` ADD CONSTRAINT `fk_fieldwork_to_devices` FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pre_installation_materials` ADD CONSTRAINT `fk_preinstall_mat_to_devices` FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pre_installation_steps` ADD CONSTRAINT `fk_preinstall_steps_to_devices` FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- Verify
-- =========================================================================

SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'ksystem' AND REFERENCED_TABLE_NAME = 'devices'
ORDER BY TABLE_NAME;
