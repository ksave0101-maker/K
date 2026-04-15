-- Query to check if all monthly and ROI data is saved correctly
-- Run after saving a new power calculation

SELECT
  calcID,
  power_calcuNo,
  company_name,
  product_price,
  unit_price,

  -- Monthly kWh data (12 months)
  january_kwh, february_kwh, march_kwh, april_kwh,
  may_kwh, june_kwh, july_kwh, august_kwh,
  september_kwh, october_kwh, november_kwh, december_kwh,

  -- Monthly cost data (12 months)
  january_cost, february_cost, march_cost, april_cost,
  may_cost, june_cost, july_cost, august_cost,
  september_cost, october_cost, november_cost, december_cost,

  -- Summary data
  total_annual_kwh,
  total_annual_cost,
  average_monthly_kwh,
  average_monthly_cost,

  -- ROI calculations
  roi_years,
  roi_months,
  annual_savings_kwh,
  annual_savings_baht,
  monthly_savings_kwh,
  monthly_savings_baht,
  monthly_payment,
  carbon_reduction,
  breakeven_year,
  cumulative_10year_savings,

  created_at
FROM power_calculations
ORDER BY created_at DESC
LIMIT 1;
