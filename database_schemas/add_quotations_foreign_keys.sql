-- Add Foreign Keys to quotations table
-- Created: 2026-03-26

-- Step 1: Add columns for foreign key references
ALTER TABLE quotations
  ADD COLUMN pre_install_formID INT NULL AFTER cusID,
  ADD COLUMN power_calc_id INT NULL AFTER pre_install_formID;

-- Step 2: Add indexes for foreign keys (required for performance)
ALTER TABLE quotations
  ADD INDEX idx_cusID (cusID),
  ADD INDEX idx_pre_install_formID (pre_install_formID),
  ADD INDEX idx_power_calc_id (power_calc_id);

-- Step 3: Add Foreign Key constraints
ALTER TABLE quotations
  ADD CONSTRAINT fk_quotations_customer
    FOREIGN KEY (cusID)
    REFERENCES cus_detail(cusID)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE quotations
  ADD CONSTRAINT fk_quotations_pre_installation
    FOREIGN KEY (pre_install_formID)
    REFERENCES pre_installation_forms(formID)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE quotations
  ADD CONSTRAINT fk_quotations_power_calculation
    FOREIGN KEY (power_calc_id)
    REFERENCES power_calculations(calcID)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Verify constraints
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'quotations'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
