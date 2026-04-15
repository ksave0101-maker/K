-- Add columns for 12 months electricity data and ROI calculations
-- Each month will have separate columns for easier querying and reporting

USE ksystem;

-- ============================================
-- PART 1: Monthly Electricity Usage (12 เดือน)
-- ============================================

-- January
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS january_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'January electricity usage in kWh'
AFTER monthly_kwh;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS january_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'January electricity cost in Baht'
AFTER january_kwh;

-- February
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS february_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'February electricity usage in kWh'
AFTER january_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS february_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'February electricity cost in Baht'
AFTER february_kwh;

-- March
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS march_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'March electricity usage in kWh'
AFTER february_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS march_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'March electricity cost in Baht'
AFTER march_kwh;

-- April
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS april_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'April electricity usage in kWh'
AFTER march_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS april_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'April electricity cost in Baht'
AFTER april_kwh;

-- May
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS may_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'May electricity usage in kWh'
AFTER april_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS may_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'May electricity cost in Baht'
AFTER may_kwh;

-- June
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS june_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'June electricity usage in kWh'
AFTER may_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS june_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'June electricity cost in Baht'
AFTER june_kwh;

-- July
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS july_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'July electricity usage in kWh'
AFTER june_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS july_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'July electricity cost in Baht'
AFTER july_kwh;

-- August
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS august_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'August electricity usage in kWh'
AFTER july_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS august_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'August electricity cost in Baht'
AFTER august_kwh;

-- September
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS september_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'September electricity usage in kWh'
AFTER august_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS september_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'September electricity cost in Baht'
AFTER september_kwh;

-- October
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS october_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'October electricity usage in kWh'
AFTER september_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS october_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'October electricity cost in Baht'
AFTER october_kwh;

-- November
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS november_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'November electricity usage in kWh'
AFTER october_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS november_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'November electricity cost in Baht'
AFTER november_kwh;

-- December
ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS december_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'December electricity usage in kWh'
AFTER november_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS december_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'December electricity cost in Baht'
AFTER december_kwh;

-- ============================================
-- PART 2: Summary fields for monthly data
-- ============================================

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS total_annual_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Total annual kWh usage (sum of 12 months)'
AFTER december_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS total_annual_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Total annual electricity cost (sum of 12 months)'
AFTER total_annual_kwh;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS average_monthly_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Average monthly kWh usage'
AFTER total_annual_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS average_monthly_cost DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Average monthly electricity cost'
AFTER average_monthly_kwh;

-- ============================================
-- PART 3: ROI Calculation Results
-- ============================================

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS roi_years DECIMAL(10,2) NULL DEFAULT NULL
COMMENT 'Return on Investment period in years'
AFTER average_monthly_cost;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS roi_months DECIMAL(10,2) NULL DEFAULT NULL
COMMENT 'Return on Investment period in months'
AFTER roi_years;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS annual_savings_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Annual electricity savings in kWh'
AFTER roi_months;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS annual_savings_baht DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Annual savings in Baht'
AFTER annual_savings_kwh;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS monthly_savings_kwh DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Monthly electricity savings in kWh'
AFTER annual_savings_baht;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS monthly_savings_baht DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Monthly savings in Baht'
AFTER monthly_savings_kwh;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS monthly_payment DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Monthly payment for device (productPrice / paymentMonths)'
AFTER monthly_savings_baht;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS carbon_reduction DECIMAL(15,4) NULL DEFAULT NULL
COMMENT 'Annual carbon reduction in tons CO2'
AFTER monthly_payment;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS breakeven_year INT(11) NULL DEFAULT NULL
COMMENT 'Year when investment breaks even'
AFTER carbon_reduction;

ALTER TABLE power_calculations
ADD COLUMN IF NOT EXISTS cumulative_10year_savings DECIMAL(15,2) NULL DEFAULT NULL
COMMENT 'Total cumulative savings after 10 years'
AFTER breakeven_year;

-- ============================================
-- PART 4: Add indexes for reporting
-- ============================================

-- Index for filtering by ROI period
ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_roi_years (roi_years);

-- Index for filtering by savings amount
ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_annual_savings (annual_savings_baht);

-- Index for filtering by total usage
ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_total_annual (total_annual_kwh);

-- Composite index for financial reports
ALTER TABLE power_calculations
ADD INDEX IF NOT EXISTS idx_financial (product_price, roi_years, annual_savings_baht);
