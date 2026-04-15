-- สร้างตาราง meter_data ในฐานข้อมูล ksystem
-- สำหรับบันทึกข้อมูลจากมิเตอร์ 2 ตัว ผ่าน PG46 MQTT

CREATE TABLE IF NOT EXISTS meter_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meter_id VARCHAR(50) NOT NULL,
    voltage DECIMAL(10, 2),
    current DECIMAL(10, 2),
    power DECIMAL(10, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_meter_id (meter_id),
    INDEX idx_timestamp (timestamp)
);

-- สร้าง view สำหรับสรุปข้อมูล
CREATE OR REPLACE VIEW meter_summary AS
SELECT 
    meter_id,
    COUNT(*) as record_count,
    AVG(voltage) as avg_voltage,
    AVG(current) as avg_current,
    AVG(power) as avg_power,
    MAX(timestamp) as last_update
FROM meter_data
GROUP BY meter_id;
