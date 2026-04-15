-- ===================================================================
-- MQTT Settings - Add FK to Devices (Simple Version)
-- ===================================================================

-- Step 1: Add deviceID column
ALTER TABLE `mqtt_settings` ADD COLUMN `deviceID` INT NULL AFTER `site`;

-- Step 2: Add series_no column  
ALTER TABLE `mqtt_settings` ADD COLUMN `series_no` VARCHAR(50) NULL AFTER `deviceID`;

-- Step 3: Add indexes
ALTER TABLE `mqtt_settings` ADD INDEX `idx_mqtt_deviceID` (`deviceID`);
ALTER TABLE `mqtt_settings` ADD INDEX `idx_mqtt_series_no` (`series_no`);

-- Step 4: Add Foreign Key
ALTER TABLE `mqtt_settings` ADD CONSTRAINT `fk_mqtt_devices`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Verify
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'mqtt_settings' AND TABLE_SCHEMA = 'ksystem';
