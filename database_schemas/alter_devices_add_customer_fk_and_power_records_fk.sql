-- Add customer_id column to devices and FK to customers.customer_id
ALTER TABLE `devices`
  ADD COLUMN IF NOT EXISTS `customer_id` INT NULL AFTER `deviceName`,
  ADD INDEX `idx_devices_customer_id` (`customer_id`);

ALTER TABLE `devices`
  DROP FOREIGN KEY IF EXISTS `fk_devices_customer`,
  ADD CONSTRAINT `fk_devices_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Add FK from power_records.device_id to devices.deviceID
ALTER TABLE `power_records`
  ADD INDEX `idx_power_records_device_id` (`device_id`);

ALTER TABLE `power_records`
  DROP FOREIGN KEY IF EXISTS `fk_power_records_device`,
  ADD CONSTRAINT `fk_power_records_device`
    FOREIGN KEY (`device_id`) REFERENCES `devices`(`deviceID`)
    ON DELETE CASCADE ON UPDATE CASCADE;
