-- Add optional customer_id to power_records and enforce FKs

ALTER TABLE `power_records`
  ADD COLUMN IF NOT EXISTS `customer_id` INT NULL AFTER `device_id`,
  ADD INDEX `idx_power_records_customer_id` (`customer_id`);

-- FK to devices (already added in previous script, kept here for safety)
ALTER TABLE `power_records`
  DROP FOREIGN KEY IF EXISTS `fk_power_records_device`,
  ADD CONSTRAINT `fk_power_records_device`
    FOREIGN KEY (`device_id`) REFERENCES `devices`(`deviceID`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- FK to customers
ALTER TABLE `power_records`
  DROP FOREIGN KEY IF EXISTS `fk_power_records_customer`,
  ADD CONSTRAINT `fk_power_records_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
