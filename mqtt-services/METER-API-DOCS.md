# Meter Data Monitoring API

## 📋 Overview
ระบบรับข้อมูลจากมิเตอร์ 2 ตัว ผ่าน MQTT PG46 และแสดงผลบน Dashboard Monitor

## 🔌 API Endpoints

### GET /api/meter-data
ดึงข้อมูล meter readings

**Query Parameters:**
- `meterId` (optional) - Filter by specific meter ID (e.g., `meter1`, `meter2`)
- `limit` (default: 100) - Number of records to return
- `hours` (default: 24) - Get data from last N hours
- `latest` (true/false, default: false) - Return only latest reading per meter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "meter_id": "meter1",
      "voltage": 220.5,
      "current": 10.2,
      "power": 2255.5,
      "timestamp": "2026-03-06T10:30:00.000Z"
    }
  ],
  "stats": [
    {
      "meter_id": "meter1",
      "record_count": 50,
      "avg_voltage": 220.3,
      "avg_current": 9.8,
      "avg_power": 2156.0,
      "last_update": "2026-03-06T10:30:00.000Z"
    }
  ],
  "timestamp": "2026-03-06T10:30:15.000Z"
}
```

### Examples:

**Get all meter data from last 24 hours:**
```bash
curl http://localhost:3001/api/meter-data
```

**Get latest reading for meter1:**
```bash
curl http://localhost:3001/api/meter-data?meterId=meter1&latest=true
```

**Get last 10 hours of data:**
```bash
curl http://localhost:3001/api/meter-data?hours=10&limit=100
```

## 🗄️ Database Schema

### meter_data table
```sql
CREATE TABLE meter_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meter_id VARCHAR(50) NOT NULL,
    voltage DECIMAL(10, 2),
    current DECIMAL(10, 2),
    power DECIMAL(10, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_meter_id (meter_id),
    INDEX idx_timestamp (timestamp)
);
```

### meter_summary view
```sql
CREATE VIEW meter_summary AS
SELECT 
    meter_id,
    COUNT(*) as record_count,
    AVG(voltage) as avg_voltage,
    AVG(current) as avg_current,
    AVG(power) as avg_power,
    MAX(timestamp) as last_update
FROM meter_data
GROUP BY meter_id;
```

## 📊 Components

### MeterDataDisplay Component
React component สำหรับแสดงข้อมูล meter readings

**Props:**
```tsx
interface MeterDataDisplayProps {
  meterReadings: MeterReading[]
  meterStats: MeterStat[]
  loading: boolean
  error?: string | null
}
```

**Usage:**
```tsx
import MeterDataDisplay from '@/components/MeterDataDisplay'

<MeterDataDisplay
  meterReadings={readings}
  meterStats={stats}
  loading={isLoading}
  error={error}
/>
```

## 🚀 MQTT Listener

### pg46_meter_listener.py
Python script ที่รับข้อมูล MQTT จากมิเตอร์ 2 ตัวและบันทึกลง database

**Topics:**
- `factory/meter1/data` - Meter 1 readings
- `factory/meter2/data` - Meter 2 readings

**Payload Format:**
```json
{
  "meter_id": "meter1",
  "voltage": 220.5,
  "current": 10.2,
  "power": 2255.5
}
```

**Run:**
```bash
python mqtt-services/pg46_meter_listener.py
```

## 🔧 Setup

1. **Create database table:**
```bash
mysql -u ksystem -pZera2026Admin ksystem < database_schemas/create_meter_data_ksystem.sql
```

2. **Install Python dependencies:**
```bash
pip install -r mqtt-services/requirements.txt
```

3. **Start MQTT listener:**
```bash
python mqtt-services/pg46_meter_listener.py
```

4. **Access Monitor Dashboard:**
```
http://localhost:3001/monitor
```

## 📈 Features

✅ Real-time meter monitoring for 2 devices
✅ Automatic data logging via MQTT
✅ Statistical summaries (average, count, last update)
✅ Responsive web dashboard
✅ Error handling and logging
✅ Time-series data retrieval
✅ Latest reading snapshot

## 🛠️ Troubleshooting

### No data appearing
- Check MQTT listener is running
- Verify MQTT broker is accessible on port 1883
- Check database connection in `pg46_meter_listener.py`
- Add log monitoring: `tail -f /var/log/mqtt-listener.log`

### API returning empty stats
- Ensure meter_data table exists
- Check timestamp format in payload
- Verify MySQL user has correct permissions

### Connection errors
- Check MySQL is running: `systemctl status mysql`
- Verify credentials in pg46_meter_listener.py
- Check firewall rules for port 1883
