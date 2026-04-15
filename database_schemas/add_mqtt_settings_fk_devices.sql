-- Add Foreign Keys to mqtt_settings table
-- Link mqtt_settings to devices by deviceID and series_no

-- ========================================================================
-- 1. Add deviceID column (nullable, for flexibility)
-- ========================================================================
ALTER TABLE `mqtt_settings`
ADD COLUMN IF NOT EXISTS `deviceID` INT DEFAULT NULL COMMENT 'Link to specific device' AFTER `site`;

-- ========================================================================
-- 2. Add series_no column (nullable)
-- ========================================================================
ALTER TABLE `mqtt_settings`
ADD COLUMN IF NOT EXISTS `series_no` VARCHAR(50) DEFAULT NULL COMMENT 'Device serial number (S/N)' AFTER `deviceID`;

-- ========================================================================
-- 3. Create index on deviceID for faster filtering
-- ========================================================================
ALTER TABLE `mqtt_settings`
ADD INDEX IF NOT EXISTS `idx_mqtt_deviceID` (`deviceID`);

-- ========================================================================
-- 4. Create index on series_no for faster filtering
-- ========================================================================
ALTER TABLE `mqtt_settings`
ADD INDEX IF NOT EXISTS `idx_mqtt_series_no` (`series_no`);

-- ========================================================================
-- 5. Add Foreign Key for deviceID → devices.deviceID
-- ========================================================================
ALTER TABLE `mqtt_settings`
ADD CONSTRAINT IF NOT EXISTS `fk_mqtt_settings_devices_id`
  FOREIGN KEY (`deviceID`) REFERENCES `devices` (`deviceID`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- ========================================================================
-- 6. Add Foreign Key for series_no → devices.series_no (Unique constraint alternative)
-- Note: This assumes series_no is unique in devices table
-- If not unique, use a composite FK with both deviceID and series_no
-- ========================================================================
-- ALTER TABLE `mqtt_settings`
-- ADD CONSTRAINT IF NOT EXISTS `fk_mqtt_settings_devices_sn`
--   FOREIGN KEY (`series_no`) REFERENCES `devices` (`series_no`)
--   ON DELETE SET NULL
--   ON UPDATE CASCADE;

-- ========================================================================
-- Alternative: Create composite FK if both need to be referenced together
-- ========================================================================
-- ALTER TABLE `mqtt_settings`
-- ADD CONSTRAINT IF NOT EXISTS `fk_mqtt_settings_devices_composite`
--   FOREIGN KEY (`deviceID`, `series_no`) REFERENCES `devices` (`deviceID`, `series_no`)
--   ON DELETE SET NULL
--   ON UPDATE CASCADE;
