-- Add ALL form fields as separate columns in power_calculations table
-- Every field from the form will have its own column for easy querying

USE ksystem;

-- Financial/Pricing fields
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) NULL DEFAULT NULL
COMMENT 'Unit price (THB/kWh)'
AFTER power_saving_rate;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS expected_savings_percent DECIMAL(5,2) NULL DEFAULT NULL
COMMENT 'Expected savings percentage'
AFTER unit_price;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS device_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Device installation cost (THB)'
AFTER expected_savings_percent;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS amortize_months INT(11) NULL DEFAULT NULL
COMMENT 'Amortization period in months'
AFTER device_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS payment_months INT(11) NULL DEFAULT NULL
COMMENT 'Payment period in months'
AFTER amortize_months;

-- Capacity and Power fields
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS contracted_capacity DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Contracted capacity (kW)'
AFTER payment_months;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS peak_power DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Peak power (kW)'
AFTER contracted_capacity;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS device_capacity DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Device capacity (kVAR)'
AFTER peak_power;

-- Installation and Method fields
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS faucet_method VARCHAR(255) NULL DEFAULT NULL
COMMENT 'Installation/faucet method'
AFTER device_capacity;

-- Usage Data fields
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS usage_data_months INT(11) NULL DEFAULT NULL
COMMENT 'Number of months of usage data'
AFTER faucet_method;

-- Environmental fields
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS emission_factor DECIMAL(10,6) NULL DEFAULT NULL
COMMENT 'CO2 emission factor'
AFTER usage_data_months;

-- Data arrays stored as JSON
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS appliances LONGTEXT NULL DEFAULT NULL
COMMENT 'JSON array of appliances'
AFTER emission_factor;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS monthly_kwh LONGTEXT NULL DEFAULT NULL
COMMENT 'JSON array of 12 months kWh data'
AFTER appliances;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS twelve_months LONGTEXT NULL DEFAULT NULL
COMMENT 'JSON array of 12 months detailed data'
AFTER monthly_kwh;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS pre_install_results LONGTEXT NULL DEFAULT NULL
COMMENT 'JSON array of pre-installation results'
AFTER twelve_months;

-- Flags and boolean fields
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS show_12month_modal TINYINT(1) NULL DEFAULT 0
COMMENT 'Flag for 12-month modal display'
AFTER pre_install_results;

-- Add indexes for numeric fields that might be used in filters/reports
ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_unit_price (unit_price);

ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_product_price_idx (product_price);

ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_device_cost (device_cost);

ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_avg_monthly (avg_monthly_usage);

ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_power_saving (power_saving_rate);

-- Composite indexes for common query patterns
ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_status_created (status, created_at);

ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_customer_status (cusID, status);

ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_company_status (company_name, status);
