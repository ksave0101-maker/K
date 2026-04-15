# 📊 Meter Data System - Complete Summary

## 🎯 System Overview

ระบบบันทึกและแสดงข้อมูลจากมิเตอร์ไฟฟ้า 2 ตัว ผ่าน MQTT Protocol (PG46) ไปยัง Dashboard Monitor

```
┌─────────────────┐         ┌──────────────┐         ┌──────────────┐
│  PG46 Meter 1   │         │  MQTT Broker │         │  Monitor     │
│  PG46 Meter 2   │ ──MQTT──│  Port 1883   │ ──HTTP──│  Dashboard   │
└─────────────────┘         └──────────────┘         └──────────────┘
                                    │
                                    │ (Listener)
                                    ▼
                            ┌──────────────┐
                            │   MySQL DB   │
                            │  ksystem     │
                            │ meter_data   │
                            └──────────────┘
```

## 📁 Files Created

### 1. **MQTT Listener** (Python)
```
mqtt-services/
├── pg46_meter_listener.py       # Main MQTT listener
├── requirements.txt              # Python dependencies
├── SETUP-GUIDE.md               # Installation guide
├── METER-API-DOCS.md            # API documentation
└── INTEGRATION-GUIDE.md         # How to integrate with Monitor
```

**Features:**
- Connects to MQTT broker on localhost:1883
- Subscribes to 2 topics: `factory/meter1/data` & `factory/meter2/data`
- Parses JSON payload and stores in MySQL
- Error handling & logging

### 2. **Database Schema** (SQL)
```
database_schemas/
└── create_meter_data_ksystem.sql  # Creates table + view
```

**Tables:**
- `meter_data` - Stores voltage, current, power readings
- `meter_summary` - View with statistics

### 3. **Backend API** (Next.js)
```
app/api/
└── meter-data/
    └── route.ts  # GET /api/meter-data endpoint
```

**Supports:**
- Filter by meter ID
- Time range filtering (hours)
- Latest reading snapshot
- Statistical summaries

### 4. **Frontend Component** (React)
```
components/
└── MeterDataDisplay.tsx  # Display meter readings + stats
```

**Shows:**
- Summary cards per meter (avg voltage, current, power)
- Latest 10 readings in table
- Loading & error states

## 🚀 Quick Start

### 1️⃣ Create Database Table
```bash
mysql -u ksystem -pZera2026Admin ksystem < database_schemas/create_meter_data_ksystem.sql
```

### 2️⃣ Install & Run MQTT Listener
```bash
pip install -r mqtt-services/requirements.txt
python mqtt-services/pg46_meter_listener.py
```

### 3️⃣ API Available At
```
GET http://localhost:3001/api/meter-data
```

### 4️⃣ Integrate with Monitor Page (Optional)
See [INTEGRATION-GUIDE.md](mqtt-services/INTEGRATION-GUIDE.md)

## 📊 Data Flow

```
1. PG46 Meters publish JSON data to MQTT topics
   └─ {"meter_id": "meter1", "voltage": 220.5, "current": 10.2, "power": 2255}

2. MQTT Listener receives message
   └─ Parses JSON and extracts fields

3. Data stored in MySQL meter_data table
   └─ Includes timestamp

4. API endpoint queries database
   └─ Returns latest readings + statistics

5. React component displays data
   └─ Cards, table, real-time updates
```

## 🔌 MQTT Topics

| Topic | Description | Payload |
|-------|-------------|---------|
| `factory/meter1/data` | Meter 1 readings | `{"meter_id": "meter1", "voltage": 220.5, "current": 10.2, "power": 2255}` |
| `factory/meter2/data` | Meter 2 readings | `{"meter_id": "meter2", "voltage": 219.8, "current": 8.5, "power": 1867}` |

## 🗄️ Database Schema

### meter_data table
```sql
id (INT, PK)
meter_id (VARCHAR 50) - Meter identifier
voltage (DECIMAL 10,2) - Voltage in V
current (DECIMAL 10,2) - Current in A
power (DECIMAL 10,2) - Power in W
timestamp (TIMESTAMP) - Recording time
```

**Indexes:**
- `idx_meter_id` - Fast filtering by meter
- `idx_timestamp` - Fast time range queries

### meter_summary view
```sql
meter_id - Grouping key
record_count - Number of records
avg_voltage - Average voltage
avg_current - Average current
avg_power - Average power
last_update - Latest timestamp
```

## 🔌 API Endpoints

### GET /api/meter-data
Returns meter readings with optional filtering

**Query Parameters:**
```
meterId=meter1          # Filter by meter ID
hours=24               # Last N hours (default 24)
limit=100              # Max records (default 100)
latest=true            # Only latest per meter
```

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
      "power": 2255,
      "timestamp": "2026-03-06T10:30:00.000Z"
    }
  ],
  "stats": [
    {
      "meter_id": "meter1",
      "record_count": 150,
      "avg_voltage": 220.3,
      "avg_current": 9.8,
      "avg_power": 2156,
      "last_update": "2026-03-06T10:30:00.000Z"
    }
  ]
}
```

## 🛠️ Configuration

### Python Script (pg46_meter_listener.py)
```python
# Database
host = "localhost"
user = "ksystem"
password = "Zera2026Admin"
database = "ksystem"

# MQTT
broker = "localhost"
port = 1883
topics = ["factory/meter1/data", "factory/meter2/data"]
```

### API Endpoint
```typescript
// Location: /app/api/meter-data/route.ts
// Database credentials from env or hardcoded
const config = {
  host: 'localhost',
  user: 'ksystem',
  password: 'Zera2026Admin',
  database: 'ksystem'
}
```

## 🎨 Monitor Page Integration

To show meter data on the monitor dashboard:

1. Add import: `import MeterDataDisplay from "@/components/MeterDataDisplay"`
2. Call API: `fetch('/api/meter-data?hours=24')`
3. Pass data to component: `<MeterDataDisplay meterReadings={...} meterStats={...} />`

See [INTEGRATION-GUIDE.md](mqtt-services/INTEGRATION-GUIDE.md) for full example

## 📈 Real-time Updates

The system supports:
- **Automatic polling**: Refresh every 30 seconds (configurable)
- **WebSocket upgrades**: Ready for future real-time implementation
- **Live indicator**: Shows connection status and last update time

## ⚠️ Important Notes

### Security
- ⚠️ Database password hardcoded in scripts
- 🔒 Recommended: Use environment variables
- 🔐 Add input validation in API
- 🛡️ Implement authentication on API endpoints

### Performance
- ⚡ Add caching for frequently queried periods
- 📊 Consider archiving old data (>30 days)
- 🗂️ Create partitions for large datasets

### Monitoring
- 📝 Check MQTT listener logs regularly
- 🔍 Monitor database disk space
- ⚙️ Set up alerts for failed data inserts

## 🔧 Troubleshooting

### No data in database
1. Check MQTT listener is running: `ps aux | grep python`
2. Verify MQTT broker: `netstat -tuln | grep 1883`
3. Check table exists: `mysql -u ksystem -pZera2026Admin ksystem -e "SHOW TABLES;"`

### API returns empty
1. Verify data exists: `SELECT COUNT(*) FROM meter_data;`
2. Check timestamp column: `SELECT * FROM meter_data LIMIT 1;`
3. Test API directly: `curl http://localhost:3001/api/meter-data`

### Connection refused
1. MySQL running? `systemctl status mysql`
2. MQTT broker running? `systemctl status mosquitto`
3. Check port 1883: `netstat -tuln | grep 1883`

## 📚 Documentation Files

- **[SETUP-GUIDE.md](mqtt-services/SETUP-GUIDE.md)** - Installation & running
- **[METER-API-DOCS.md](mqtt-services/METER-API-DOCS.md)** - API reference
- **[INTEGRATION-GUIDE.md](mqtt-services/INTEGRATION-GUIDE.md)** - How to integrate
- **[README-SUMMARY.md](mqtt-services/README-SUMMARY.md)** - This file

## ✅ Checklist

- [ ] Database table created
- [ ] MQTT listener running
- [ ] API endpoint tested
- [ ] Component created
- [ ] Component integrated in Monitor page
- [ ] Real-time updates working
- [ ] Error handling verified
- [ ] Security hardened (env variables)

---

**Created**: March 6, 2026
**Status**: Ready for monitoring
**Next Steps**: Integrate with Monitor Dashboard
