-- Insert test data with THD values into power_records table
-- This will help test the Monitor Dashboard THD display

USE ksystem;

-- Insert test record for device 1 (KSAVE01) with THD values
INSERT INTO power_records (
    device_id, 
    record_time,
    before_L1, before_L2, before_L3,
    metrics_L1, metrics_L2, metrics_L3,
    metrics_P, metrics_Q, metrics_S,
    metrics_F, metrics_PF,
    metrics_kWh, before_kWh,
    before_THD, metrics_THD,
    created_by
) VALUES (
    1,  -- device_id (KSAVE01)
    NOW(),  -- current timestamp
    220.5, 221.0, 219.8,  -- voltage L1/L2/L3 (before)
    15.2, 14.8, 15.5,     -- current L1/L2/L3 (metrics)
    9.85, 1.2, 10.0,      -- P, Q, S (kW, kVAr, kVA)
    50.0, 0.985,          -- Frequency, Power Factor
    2500.5, 2700.0,       -- metrics_kWh, before_kWh
    4.8, 2.9,             -- before_THD, metrics_THD (%)
    'Manual Test Data'
);

-- Insert test record for device 2 (KSAVE02) with THD values
INSERT INTO power_records (
    device_id, 
    record_time,
    before_L1, before_L2, before_L3,
    metrics_L1, metrics_L2, metrics_L3,
    metrics_P, metrics_Q, metrics_S,
    metrics_F, metrics_PF,
    metrics_kWh, before_kWh,
    before_THD, metrics_THD,
    created_by
) VALUES (
    2,  -- device_id (KSAVE02)
    NOW(),
    221.2, 220.8, 221.5,
    12.5, 12.2, 12.8,
    8.20, 1.0, 8.3,
    50.0, 0.988,
    2200.3, 2380.0,
    5.2, 3.1,
    'Manual Test Data'
);

-- Insert test record for device 3 (KSAVE03) with THD values
INSERT INTO power_records (
    device_id, 
    record_time,
    before_L1, before_L2, before_L3,
    metrics_L1, metrics_L2, metrics_L3,
    metrics_P, metrics_Q, metrics_S,
    metrics_F, metrics_PF,
    metrics_kWh, before_kWh,
    before_THD, metrics_THD,
    created_by
) VALUES (
    3,  -- device_id (KSAVE03)
    NOW(),
    219.8, 220.3, 220.0,
    10.8, 10.5, 11.2,
    7.15, 0.9, 7.2,
    50.0, 0.993,
    1980.7, 2150.0,
    4.5, 2.7,
    'Manual Test Data'
);

-- Verify the inserted data
SELECT 
    device_id,
    record_time,
    before_THD,
    metrics_THD,
    CONCAT(ROUND(((before_THD - metrics_THD) / before_THD * 100), 1), '%') as THD_reduction_percent
FROM power_records 
WHERE created_by = 'Manual Test Data'
ORDER BY device_id;

-- Show latest THD values for all devices
SELECT 
    pr.device_id,
    d.deviceName,
    pr.record_time,
    pr.before_THD as 'THD Before (%)',
    pr.metrics_THD as 'THD After (%)',
    ROUND(pr.before_THD - pr.metrics_THD, 2) as 'THD Reduction'
FROM power_records pr
LEFT JOIN devices d ON pr.device_id = d.deviceID
WHERE pr.id IN (
    SELECT MAX(id) 
    FROM power_records 
    GROUP BY device_id
)
ORDER BY pr.device_id;
