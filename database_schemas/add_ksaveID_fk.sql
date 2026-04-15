-- =========================================================================
-- Add ksaveID Foreign Keys
-- Link power_records and power_records_preinstall to devices via ksaveID
-- =========================================================================

-- 1. Add ksaveID column to power_records (if not exists)
ALTER TABLE `power_records` ADD COLUMN `ksaveID` VARCHAR(255) NULL COMMENT 'Link to devices.ksaveID';

-- 2. Add ksaveID column to power_records_preinstall (if not exists)
ALTER TABLE `power_records_preinstall` ADD COLUMN `ksaveID` VARCHAR(255) NULL COMMENT 'Link to devices.ksaveID';

-- 3. Add indexes for ksaveID
ALTER TABLE `power_records` ADD INDEX `idx_power_records_ksaveID` (`ksaveID`);
ALTER TABLE `power_records_preinstall` ADD INDEX `idx_preinstall_ksaveID` (`ksaveID`);

-- 4. Add Foreign Keys for ksaveID
ALTER TABLE `power_records` ADD CONSTRAINT `fk_power_records_ksave_devices` 
  FOREIGN KEY (`ksaveID`) REFERENCES `devices` (`ksaveID`) 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `power_records_preinstall` ADD CONSTRAINT `fk_power_preinstall_ksave_devices` 
  FOREIGN KEY (`ksaveID`) REFERENCES `devices` (`ksaveID`) 
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- Verify ksaveID Foreign Keys
-- =========================================================================

SELECT TABLE_NAME, CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME = 'devices' AND COLUMN_NAME = 'ksaveID'
AND TABLE_SCHEMA = 'ksystem'
ORDER BY TABLE_NAME;
