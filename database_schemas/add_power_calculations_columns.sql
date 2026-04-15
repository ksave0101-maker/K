-- Add additional columns to power_calculations table for better query performance
-- These columns will store frequently-queried data separately from the JSON parameters field

USE ksystem;

-- Add pre_inst_id column (reference to pre-installation form)
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS pre_inst_id INT(11) NULL DEFAULT NULL
COMMENT 'Reference to pre_installation form ID'
AFTER cusID;

-- Add usage_history column (store as JSON separately for easier querying)
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS usage_history LONGTEXT NULL DEFAULT NULL
COMMENT 'JSON array of usage history data'
AFTER pre_inst_id;

-- Add commonly-queried parameter fields as separate columns for better performance

-- Voltage (frequently used in reports and filtering)
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS voltage DECIMAL(10,2) NULL DEFAULT NULL
COMMENT 'Voltage in Volts'
AFTER usage_history;

-- Current (frequently used in reports and filtering)
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS current DECIMAL(10,2) NULL DEFAULT NULL
COMMENT 'Current in Amperes'
AFTER voltage;

-- Power Factor
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS power_factor DECIMAL(5,4) NULL DEFAULT NULL
COMMENT 'Power Factor (0-1)'
AFTER current;

-- Phase type
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS phase_type VARCHAR(20) NULL DEFAULT NULL
COMMENT 'Phase type: single or three'
AFTER power_factor;

-- Company name (for reporting and filtering)
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) NULL DEFAULT NULL
COMMENT 'Company name from parameters'
AFTER phase_type;

-- Product price (for reporting and analysis)
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS product_price DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Product price in Baht'
AFTER company_name;

-- Average monthly usage (for reporting)
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS avg_monthly_usage DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Average monthly kWh usage'
AFTER product_price;

-- Power saving rate (for reporting)
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS power_saving_rate DECIMAL(5,2) NULL DEFAULT NULL
COMMENT 'Power saving rate percentage'
AFTER avg_monthly_usage;

-- Updated at timestamp
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
COMMENT 'Last update timestamp'
AFTER created_at;

-- Add indexes for frequently queried columns
ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_pre_inst_id (pre_inst_id);

ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_company_name (company_name);

ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_updated_at (updated_at);

-- Note: The parameters column will still contain ALL data for backup and completeness
-- These new columns are for performance optimization and easier querying
