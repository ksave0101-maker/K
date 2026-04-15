# ⚡ Quick Reference - Meter Data System

## 🚀 30-Second Setup

```bash
# 1. Create table
mysql -u ksystem -pZera2026Admin ksystem < database_schemas/create_meter_data_ksystem.sql

# 2. Install requirements
pip install -r mqtt-services/requirements.txt

# 3. Start MQTT listener
python mqtt-services/pg46_meter_listener.py

# 4. Test API
curl http://localhost:3001/api/meter-data?latest=true
```

## 📊 API Cheat Sheet

```bash
# Get all data (last 24 hours)
curl http://localhost:3001/api/meter-data

# Get latest reading only
curl http://localhost:3001/api/meter-data?latest=true

# Get from meter1 only
curl http://localhost:3001/api/meter-data?meterId=meter1

# Get last 12 hours
curl http://localhost:3001/api/meter-data?hours=12

# Get last 10 records
curl http://localhost:3001/api/meter-data?limit=10
```

## 🛠️ Common Commands

```bash
# Check if listener is running
ps aux | grep pg46_meter_listener

# View recent logs
tail -f /var/log/mqtt-listener.log

# Check database
mysql -u ksystem -pZera2026Admin ksystem
> SELECT * FROM meter_data ORDER BY timestamp DESC LIMIT 5;

# Check MQTT connection
netstat -tuln | grep 1883

# Restart MQTT listener
pkill -f pg46_meter_listener
python mqtt-services/pg46_meter_listener.py
```

## 📱 Component Usage

```tsx
import MeterDataDisplay from '@/components/MeterDataDisplay'

const [readings, setReadings] = useState([])
const [stats, setStats] = useState([])

useEffect(() => {
  fetch('/api/meter-data?hours=24')
    .then(r => r.json())
    .then(d => {
      setReadings(d.data)
      setStats(d.stats)
    })
}, [])

return <MeterDataDisplay meterReadings={readings} meterStats={stats} />
```

## 📋 File Locations

| File | Purpose | Location |
|------|---------|----------|
| MQTT Listener | Python script | `mqtt-services/pg46_meter_listener.py` |
| Dependencies | Python packages | `mqtt-services/requirements.txt` |
| API Endpoint | Fetch data | `app/api/meter-data/route.ts` |
| Display Component | React component | `components/MeterDataDisplay.tsx` |
| Database Schema | Create table | `database_schemas/create_meter_data_ksystem.sql` |

## 🔧 Configuration Fields

**MQTT Listener Config** (pg46_meter_listener.py)
```python
host="localhost"
user="ksystem"
password="Zera2026Admin"
database="ksystem"

# MQTT Settings
broker = "localhost"
port = 1883
topics = ["factory/meter1/data", "factory/meter2/data"]
```

**API Config** (app/api/meter-data/route.ts)
```typescript
host: 'localhost'
user: 'ksystem'
password: 'Zera2026Admin'
database: 'ksystem'
```

## 🎯 MQTT Payload Format

```json
{
  "meter_id": "meter1",
  "voltage": 220.5,
  "current": 10.2,
  "power": 2255.5
}
```

The listener publishes to:
- `factory/meter1/data`
- `factory/meter2/data`

## 📊 Database Query Examples

```sql
-- Get latest readings
SELECT * FROM meter_data ORDER BY timestamp DESC LIMIT 10;

-- Get average per meter
SELECT * FROM meter_summary;

-- Get meter1 last 24 hours
SELECT * FROM meter_data 
WHERE TIMESTAMP >= DATE_SUB(NOW(), INTERVAL 24 HOUR) 
AND meter_id = 'meter1';

-- Get hourly average
SELECT DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as hour,
       meter_id,
       AVG(voltage) as avg_v,
       AVG(current) as avg_a,
       AVG(power) as avg_w
FROM meter_data
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY hour, meter_id
ORDER BY hour DESC;
```

## ✅ Health Check

```bash
# 1. Is table created?
mysql -u ksystem -pZera2026Admin ksystem \
  -e "DESCRIBE meter_data;"

# 2. Is listener connected?
ps aux | grep pg46_meter

# 3. Is broker running?
netstat -tuln | grep 1883

# 4. Is API working?
curl http://localhost:3001/api/meter-data

# 5. Any data yet?
mysql -u ksystem -pZera2026Admin ksystem \
  -e "SELECT COUNT(*) FROM meter_data;"
```

## 🚨 Quick Fixes

**Listener won't start**
```bash
# Check dependencies
pip list | grep paho
pip list | grep mysql-connector

# Reinstall if needed
pip install --upgrade -r mqtt-services/requirements.txt
```

**No data in database**
```bash
# Check MQTT broker
mosquitto -v

# Monitor listener output
python mqtt-services/pg46_meter_listener.py
# Watch for error messages
```

**API returns empty**
```bash
# Verify data exists
mysql -u ksystem -pZera2026Admin -e "USE ksystem; SELECT COUNT(*) FROM meter_data;"

# Check table schema
mysql -u ksystem -pZera2026Admin -e "USE ksystem; DESCRIBE meter_data;"
```

## 📈 Performance Tips

- Use `latest=true` for current values only
- Filter by `meterId` to reduce data volume
- Limit hours to relevant timeframe
- Cache API responses client-side
- Archive old data monthly

## 🔐 Security Reminders

⚠️ **Before production:**
- [ ] Move passwords to environment variables
- [ ] Add API authentication
- [ ] Enable database user restrictions
- [ ] Use HTTPS for API calls
- [ ] Implement rate limiting
- [ ] Add input validation

## 📞 Support

- **Issues?** Check logs: `tail -f /var/log/mqtt-listener.log`
- **API errors?** Use curl with verbose: `curl -v http://localhost:3001/api/meter-data`
- **Database?** Connect directly: `mysql -u ksystem -pZera2026Admin ksystem`

---

Last updated: March 6, 2026
