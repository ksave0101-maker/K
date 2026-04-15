-- สร้างตาราง meter_data สำหรับเก็บข้อมูลมิเตอร์ PG46
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
