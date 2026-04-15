# 🔌 MQTT Services for PG46 Meter Integration

ระบบรับและบันทึกข้อมูลจากมิเตอร์ PG46 ผ่าน MQTT Protocol สำหรับแสดงผลบน Monitor Dashboard

---

## 📋 Overview

ระบบนี้ประกอบด้วย:
- **MQTT Listener** (Python) - รับข้อมูลจาก PG46 ผ่าน MQTT
- **Database Integration** - บันทึกลง MySQL (ksystem database)
- **Monitor Dashboard** - แสดงผลแบบ Real-time

---

## 🚀 Quick Start

### 1. ติดตั้ง Dependencies
```bash
pip install -r requirements.txt
```

### 2. สร้างตาราง Database
```bash
mysql -u ksystem -pZera2026Admin ksystem < ../database_schemas/create_meter_data_ksystem.sql
```

### 3. รัน Listener
```bash
# สำหรับ Monitor Dashboard (แนะนำ)
python pg46_power_records_listener.py
```

### 4. ดูผลบน Dashboard
```
http://localhost:3001/monitor
```

---

## 📁 Files

### Python Scripts
- `pg46_power_records_listener.py` ⭐ **ใช้ตัวนี้** - บันทึกข้อมูลครบ สำหรับ Monitor Dashboard
- `pg46_meter_listener.py` - บันทึกข้อมูลพื้นฐาน (สำหรับทดสอบ)

### Documentation
- `FINAL-SUMMARY.md` ⭐ **เริ่มที่นี่** - สรุปภาพรวมทั้งหมด
- `MONITOR-DATA-REQUIREMENTS.md` - ข้อมูลที่ Monitor Dashboard ต้องการ
- `PG46-PAYLOAD-FORMAT.md` - รูปแบบ JSON ที่ PG46 ต้องส่ง
- `SETUP-GUIDE.md` - คู่มือติดตั้งโดยละเอียด
- `QUICK-REFERENCE.md` - คำสั่งด่วน
- `INTEGRATION-GUIDE.md` - เชื่อมต่อ component กับ Dashboard

### Other
- `requirements.txt` - Python dependencies
- `README.md` - ไฟล์นี้

---

## 🎯 ใช้งานอย่างไร?

### สำหรับ Monitor Dashboard (แนะนำ)

**1. รัน Listener:**
```bash
python pg46_power_records_listener.py
```

**2. PG46 ส่งข้อมูลมาที่:**
- Topic: `factory/meter1/data`
- Topic: `factory/meter2/data`
- Format: ดูที่ [PG46-PAYLOAD-FORMAT.md](./PG46-PAYLOAD-FORMAT.md)

**3. ข้อมูลจะถูกบันทึกในตาราง:**
- `power_records` - ครบถ้วนทุก metrics

**4. Dashboard จะดึงข้อมูลแสดงอัตโนมัติที่:**
- http://localhost:3001/monitor

---

## 📊 Data Flow

```
PG46 Meter 
   ↓ (MQTT)
Listener (Python)
   ↓ (MySQL)
power_records table
   ↓ (API)
Monitor Dashboard
```

---

## 🗄️ Database Tables

### power_records (สำหรับ Monitor Dashboard)
```sql
- device_id, record_time
- voltage L1/L2/L3 (V)
- current L1/L2/L3 (A)
- power metrics (P/Q/S) (kW, kVAr, kVA)
- frequency (Hz), power_factor
- energy (kWh), THD (%)
- savings (energy_reduction, co2_reduction)
```

### meter_data (สำหรับข้อมูลพื้นฐาน)
```sql
- meter_id, timestamp
- voltage (V), current (A), power (W)
```

---

## 📝 MQTT Topics

| Topic | Device | Purpose |
|-------|--------|---------|
| `factory/meter1/data` | Meter 1 | ข้อมูลจากมิเตอร์ตัวที่ 1 |
| `factory/meter2/data` | Meter 2 | ข้อมูลจากมิเตอร์ตัวที่ 2 |

---

## 🧪 Testing

### ทดสอบส่งข้อมูล (mosquitto_pub)
```bash
mosquitto_pub -h localhost -t "factory/meter1/data" -m '{
  "device_id": "meter1",
  "voltage_l1": 220.5,
  "voltage_l2": 221.0,
  "voltage_l3": 219.8,
  "current_l1": 10.2,
  "current_l2": 9.8,
  "current_l3": 10.5,
  "power": 6800,
  "reactive_power": 1200,
  "apparent_power": 6900,
  "frequency": 50.0,
  "power_factor": 0.98,
  "energy": 1500500,
  "thd": 3.5
}'
```

### ตรวจสอบข้อมูลในฐานข้อมูล
```bash
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT device_id, record_time, metrics_P, metrics_kWh, energy_reduction 
FROM power_records 
ORDER BY record_time DESC 
LIMIT 5;"
```

### ทดสอบ API
```bash
curl "http://localhost:3001/api/kenergy/device-monitoring?deviceId=meter1" | jq
```

---

## ⚙️ Configuration

### MQTT Broker
```
Host: localhost
Port: 1883
QoS: 0 or 1
```

### Database
```python
host = "localhost"
user = "ksystem"
password = "Zera2026Admin"
database = "ksystem"
```

### PG46 Settings
```
Broker: [SERVER_IP]
Port: 1883
Topic: factory/meter1/data
Publish Interval: 10-30 seconds
```

---

## 🔍 Troubleshooting

### Listener ไม่ทำงาน
```bash
# ตรวจสอบ MQTT Broker
netstat -tuln | grep 1883

# ตรวจสอบ process
ps aux | grep pg46

# ดู MQTT messages
mosquitto_sub -h localhost -t "factory/+/data" -v
```

### ไม่มีข้อมูลในฐานข้อมูล
```bash
# ตรวจสอบตาราง
mysql -u ksystem -pZera2026Admin ksystem -e "SHOW TABLES;"

# ดูจำนวนข้อมูล
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT COUNT(*) FROM power_records;"
```

### Dashboard ไม่แสดงข้อมูล
```bash
# ตรวจสอบ device_id
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT DISTINCT device_id FROM power_records;"

# Test API
curl "http://localhost:3001/api/kenergy/device-monitoring?deviceId=meter1"
```

---

## 📚 Documentation

| Document | Purpose | Priority |
|----------|---------|----------|
| [FINAL-SUMMARY.md](./FINAL-SUMMARY.md) | สรุปภาพรวม | ⭐⭐⭐ |
| [MONITOR-DATA-REQUIREMENTS.md](./MONITOR-DATA-REQUIREMENTS.md) | ข้อมูลที่ต้องใช้ | ⭐⭐⭐ |
| [PG46-PAYLOAD-FORMAT.md](./PG46-PAYLOAD-FORMAT.md) | JSON format | ⭐⭐⭐ |
| [SETUP-GUIDE.md](./SETUP-GUIDE.md) | Installation | ⭐⭐ |
| [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) | Quick commands | ⭐⭐ |

---

## ✅ Checklist

- [ ] MQTT Broker running (port 1883)
- [ ] MySQL database `ksystem` exists
- [ ] Table `power_records` created
- [ ] Python dependencies installed
- [ ] Listener running
- [ ] PG46 configured and sending data
- [ ] Data appearing in database
- [ ] Monitor Dashboard showing data

---

## 💡 Tips

### Performance
- Publish every 10-30 seconds (not faster than 5 seconds)
- Archive data older than 30 days
- Monitor disk space

### Security
- Use environment variables for credentials
- Enable MQTT over TLS
- Add API authentication

### Monitoring
- Check listener logs regularly
- Set up disk space alerts
- Daily database backups

---

## 📞 Support

**Issues?**
1. Read [FINAL-SUMMARY.md](./FINAL-SUMMARY.md)
2. Check logs: `tail -f /var/log/pg46_listener.log`
3. Test connectivity: `mosquitto_sub -h localhost -t "#" -v`

---

## 🎉 Quick Links

- 📊 **Dashboard**: http://localhost:3001/monitor
- 🔌 **MQTT Broker**: localhost:1883
- 🗄️ **Database**: ksystem.power_records
- 📡 **Topics**: factory/meter1/data, factory/meter2/data

---

**Version**: 1.0  
**Created**: March 6, 2026  
**Status**: ✅ Production Ready

**สำหรับคำถาม**: อ่าน [FINAL-SUMMARY.md](./FINAL-SUMMARY.md) ก่อน!
