-- Split power data storage by usage scope
-- 1) Keep existing `power_records` for real installed devices
-- 2) Create `power_records_preinstall` for temporary pre-install measurement devices
-- 3) Add `devices.record_scope` to mark each device: installed | pre_install

-- ---------------------------------------------------------------------------
-- Create separate table for pre-install records (same schema as power_records)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `power_records_preinstall` LIKE `power_records`;

-- Optional: clarify table intent
ALTER TABLE `power_records_preinstall`
  COMMENT = 'Pre-install measurement records (temporary meters before real installation)';

-- ---------------------------------------------------------------------------
-- Add devices.record_scope column only when missing (MySQL-compatible)
-- ---------------------------------------------------------------------------
SET @has_record_scope_col := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'devices'
    AND COLUMN_NAME = 'record_scope'
);

SET @add_record_scope_col_sql := IF(
  @has_record_scope_col = 0,
  "ALTER TABLE `devices` ADD COLUMN `record_scope` ENUM('installed','pre_install') NOT NULL DEFAULT 'installed' AFTER `status`",
  "SELECT 'devices.record_scope already exists'"
);

PREPARE stmt_add_record_scope_col FROM @add_record_scope_col_sql;
EXECUTE stmt_add_record_scope_col;
DEALLOCATE PREPARE stmt_add_record_scope_col;

-- ---------------------------------------------------------------------------
-- Add index for faster filtering by scope (only when missing)
-- ---------------------------------------------------------------------------
SET @has_record_scope_idx := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'devices'
    AND INDEX_NAME = 'idx_devices_record_scope'
);

SET @add_record_scope_idx_sql := IF(
  @has_record_scope_idx = 0,
  "ALTER TABLE `devices` ADD INDEX `idx_devices_record_scope` (`record_scope`)",
  "SELECT 'idx_devices_record_scope already exists'"
);

PREPARE stmt_add_record_scope_idx FROM @add_record_scope_idx_sql;
EXECUTE stmt_add_record_scope_idx;
DEALLOCATE PREPARE stmt_add_record_scope_idx;

-- Ensure existing rows default to installed
UPDATE `devices`
SET `record_scope` = 'installed'
WHERE `record_scope` IS NULL OR `record_scope` = '';
