# 📊 สรุป: ระบบบันทึกข้อมูล PG46 สำหรับ Monitor Dashboard

## ✅ สิ่งที่สร้างเสร็จแล้ว

### 1️⃣ MQTT Listener (2 แบบ)

#### 🟦 Basic Listener (meter_data)
- **ไฟล์**: `pg46_meter_listener.py`
- **ตาราง**: `meter_data`
- **ใช้สำหรับ**: บันทึกข้อมูลพื้นฐาน (voltage, current, power)

#### 🟩 Complete Listener (power_records) ✅ **ใช้ตัวนี้**
- **ไฟล์**: `pg46_power_records_listener.py`
- **ตาราง**: `power_records`
- **ใช้สำหรับ**: แสดงผลบน Monitor Dashboard ครบทุก metrics

### 2️⃣ Documentation
- ✅ `MONITOR-DATA-REQUIREMENTS.md` - ข้อมูลที่ Monitor Dashboard ต้องการ
- ✅ `PG46-PAYLOAD-FORMAT.md` - รูปแบบข้อมูลที่ PG46 ต้องส่ง
- ✅ `SETUP-GUIDE.md` - คู่มือติดตั้ง
- ✅ `QUICK-REFERENCE.md` - คำสั่งด่วน
- ✅ `FINAL-SUMMARY.md` - ไฟล์นี้

---

## 🎯 หน้า Monitor Dashboard แสดงข้อมูลอะไร?

### ที่ http://localhost:3001/monitor แสดง:

#### ⚡ Electric Parameters
- **Voltage L1/L2/L3** (V) - แรงดันไฟฟ้า 3 Phase
- **Current L1/L2/L3** (A) - กระแสไฟฟ้า 3 Phase
- **Active Power** (kW) - พลังงานจริง
- **Reactive Power** (kVAr) - พลังงานรีแอคทีฟ
- **Apparent Power** (kVA) - พลังงานปรากฏ

#### 📊 Power Quality
- **Frequency** (Hz) - ความถี่ไฟฟ้า
- **Power Factor** - ค่าพาวเวอร์แฟคเตอร์
- **THD Before/After** (%) - ค่าความผิดเพี้ยนฮาร์โมนิก

#### 💡 Energy & Savings
- **Energy** (kWh) - พลังงานที่ใช้
- **Energy Saved** (kWh) - พลังงานที่ประหยัดได้
- **CO₂ Reduction** (kg) - ปริมาณ CO₂ ที่ลดได้

#### 📈 Charts & Trends
- Trend Chart (เลือกดูแต่ละ metric)
- Energy History
- Time-series graphs

---

## 🗄️ ฐานข้อมูลต้องมีข้อมูลอะไร?

### ตาราง: `power_records`

ต้องมีข้อมูลครบ **19 fields**:

```sql
device_id          -- รหัสอุปกรณ์
record_time        -- เวลาบันทึก
before_L1, L2, L3  -- แรงดัน 3 Phase (V)
metrics_L1, L2, L3 -- กระแส 3 Phase (A)
metrics_P          -- Active Power (kW)
metrics_Q          -- Reactive Power (kVAr)
metrics_S          -- Apparent Power (kVA)
metrics_F          -- Frequency (Hz)
metrics_PF         -- Power Factor
metrics_kWh        -- Energy (kWh)
before_kWh         -- Energy ก่อนติด K-Save
before_THD         -- THD ก่อน (%)
metrics_THD        -- THD หลัง (%)
energy_reduction   -- พลังงานที่ประหยัดได้ (kWh)
co2_reduction      -- CO₂ ที่ลดได้ (kg)
```

---

## 🚀 วิธีใช้งาน (3 ขั้นตอน)

### ขั้นที่ 1: ตรวจสอบตาราง power_records
```bash
mysql -u ksystem -pZera2026Admin ksystem -e "DESCRIBE power_records;"
```

ถ้าตารางยังไม่มี ให้สร้าง:
```bash
mysql -u ksystem -pZera2026Admin ksystem < database_schemas/create_meter_data_ksystem.sql
```

### ขั้นที่ 2: รัน MQTT Listener
```bash
# ติดตั้ง dependencies (ครั้งแรก)
pip install -r mqtt-services/requirements.txt

# รัน listener สำหรับ Monitor Dashboard
python mqtt-services/pg46_power_records_listener.py
```

### ขั้นที่ 3: ตั้งค่า PG46 ส่งข้อมูล

**MQTT Settings:**
- Broker: `localhost` (หรือ IP ของเซิร์ฟเวอร์)
- Port: `1883`
- Topic: `factory/meter1/data` (สำหรับมิเตอร์ตัวที่ 1)
- Topic: `factory/meter2/data` (สำหรับมิเตอร์ตัวที่ 2)

**Payload Format:**
```json
{
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
}
```

**หน่วยที่ PG46 ต้องส่ง:**
- Voltage: V (Volts)
- Current: A (Amperes)
- Power: **W** (Watts) - Listener จะแปลงเป็น kW อัตโนมัติ
- Reactive/Apparent Power: **VAr, VA** - Listener จะแปลง
- Energy: **Wh** (Watt-hours) - Listener จะแปลงเป็น kWh
- Frequency: Hz
- Power Factor: 0-1
- THD: %

---

## 🧪 ทดสอบระบบ

### 1. ทดสอบส่งข้อมูล (ใช้ mosquitto_pub)
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

### 2. ตรวจสอบข้อมูลในฐานข้อมูล
```bash
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT device_id, record_time, 
       before_L1, metrics_L1, 
       metrics_P, metrics_kWh, 
       energy_reduction 
FROM power_records 
ORDER BY record_time DESC 
LIMIT 3;"
```

### 3. ทดสอบ API
```bash
curl "http://localhost:3001/api/kenergy/device-monitoring?deviceId=meter1" | jq
```

### 4. ดูผลบน Dashboard
```
http://localhost:3001/monitor
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────┐
│   PG46 Meter 1/2    │
│                     │
│  Publish to MQTT:   │
│  - voltage_l1/2/3   │
│  - current_l1/2/3   │
│  - power, energy    │
│  - frequency, PF    │
│  - THD              │
└──────────┬──────────┘
           │
           │ MQTT Topics:
           │ factory/meter1/data
           │ factory/meter2/data
           ▼
┌───────────────────────────────────┐
│  pg46_power_records_listener.py   │
│                                   │
│  1. รับ JSON                      │
│  2. แปลง W→kW, Wh→kWh            │
│  3. คำนวณ energy_reduction        │
│  4. คำนวณ co2_reduction           │
│  5. INSERT INTO power_records     │
└──────────┬────────────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│  MySQL Database: ksystem          │
│  Table: power_records             │
│                                   │
│  - 19 fields ครบถ้วน              │
│  - Index: device_id, record_time  │
└──────────┬────────────────────────┘
           │
           │ SELECT ... ORDER BY 
           │ record_time DESC LIMIT 1
           ▼
┌───────────────────────────────────┐
│  API Endpoint:                    │
│  /api/kenergy/device-monitoring   │
│                                   │
│  ส่งข้อมูลล่าสุดในรูปแบบ JSON    │
└──────────┬────────────────────────┘
           │
           │ fetch() every 30s
           ▼
┌───────────────────────────────────┐
│  Monitor Dashboard                │
│  http://localhost:3001/monitor    │
│                                   │
│  แสดง:                            │
│  - Voltage, Current charts        │
│  - Power metrics                  │
│  - Energy consumption             │
│  - Savings (Energy + CO₂)         │
│  - Trend charts                   │
│  - Historical data                │
└───────────────────────────────────┘
```

---

## ✅ Checklist ก่อนใช้งาน

### ฝั่ง Server
- [ ] MySQL ติดตั้งแล้ว
- [ ] ตาราง `power_records` สร้างแล้ว
- [ ] MQTT Broker (mosquitto) รันอยู่ (port 1883)
- [ ] Python 3.x ติดตั้งแล้ว
- [ ] Dependencies ติดตั้งแล้ว (`pip install -r requirements.txt`)
- [ ] Listener รันอยู่ (`pg46_power_records_listener.py`)

### ฝั่ง PG46
- [ ] MQTT Broker address ตั้งค่าแล้ว
- [ ] Topic ตั้งค่าแล้ว (`factory/meter1/data`)
- [ ] Payload format ถูกต้อง (ตาม PG46-PAYLOAD-FORMAT.md)
- [ ] Publish interval ตั้งค่าแล้ว (10-30 วินาที)
- [ ] ทดสอบส่งข้อมูลแล้ว

### ฝั่ง Dashboard
- [ ] Next.js app รันอยู่ (port 3001)
- [ ] เปิด http://localhost:3001/monitor ได้
- [ ] เลือก Device จาก dropdown ได้
- [ ] เห็นข้อมูล Real-time
- [ ] Charts แสดงผลได้

---

## 🔍 Troubleshooting

### ❌ Monitor Dashboard ไม่แสดงข้อมูล

**Checklist:**
```bash
# 1. ตรวจสอบมีข้อมูลในตาราง power_records หรือไม่
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT COUNT(*) as total, MAX(record_time) as latest 
FROM power_records WHERE device_id = 'meter1';"

# 2. ตรวจสอบ API ทำงานหรือไม่
curl "http://localhost:3001/api/kenergy/device-monitoring?deviceId=meter1"

# 3. ตรวจสอบ device_id ตรงกันหรือไม่
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT DISTINCT device_id FROM power_records;"

# 4. ตรวจสอบ devices table มี meter1 หรือไม่
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT deviceID, deviceName FROM devices;"
```

### ❌ Listener ไม่บันทึกข้อมูล

**Checklist:**
```bash
# 1. Listener รันอยู่หรือไม่
ps aux | grep pg46_power_records

# 2. MQTT Broker เปิดหรือไม่
netstat -tuln | grep 1883

# 3. Subscribe ดูข้อมูลที่ส่งมา
mosquitto_sub -h localhost -t "factory/+/data" -v

# 4. ดู log ของ listener
# (ดูที่ terminal ที่รัน listener)
```

### ❌ PG46 ส่งข้อมูลไม่ถูก format

**ตรวจสอบ:**
- Payload เป็น JSON ที่ valid หรือไม่
- มี field ที่จำเป็นครบหรือไม่
- หน่วยถูกต้องหรือไม่ (W ไม่ใช่ kW, Wh ไม่ใช่ kWh)

**ทดสอบด้วย mosquitto_pub ก่อน:**
```bash
mosquitto_pub -h localhost -t "factory/meter1/data" -m '{"device_id":"meter1","voltage_l1":220,"current_l1":10,"power":2200}'
```

---

## 📚 เอกสารทั้งหมด

| ไฟล์ | จุดประสงค์ | ความสำคัญ |
|------|-----------|-----------|
| `FINAL-SUMMARY.md` | สรุปภาพรวมทั้งหมด | ⭐⭐⭐ |
| `MONITOR-DATA-REQUIREMENTS.md` | ข้อมูลที่ Monitor ต้องการ | ⭐⭐⭐ |
| `PG46-PAYLOAD-FORMAT.md` | รูปแบบ JSON ที่ต้องส่ง | ⭐⭐⭐ |
| `SETUP-GUIDE.md` | คู่มือติดตั้ง | ⭐⭐ |
| `QUICK-REFERENCE.md` | คำสั่งด่วน | ⭐⭐ |
| `INTEGRATION-GUIDE.md` | รวม component เข้า Dashboard | ⭐ |

---

## 🎯 ขั้นตอนถัดไป

### ตอนนี้ (Now)
1. ✅ ทดสอบระบบด้วย mosquitto_pub
2. ✅ ตรวจสอบข้อมูลเข้าฐานข้อมูล
3. ✅ เปิด Monitor Dashboard ดูผล

### เร็วๆ นี้ (Soon)
1. ⚙️ ตั้งค่า PG46 ให้ส่งข้อมูลจริง
2. 📊 ทดสอบกับมิเตอร์ 2 ตัว
3. 🔐 เพิ่ม authentication
4. 📈 ตั้งค่า alerts/notifications

### ในอนาคต (Future)
1. 🌐 Deploy to production
2. 📱 Mobile app
3. 🤖 AI predictions
4. ☁️ Cloud backup

---

## 💡 Tips & Best Practices

### Performance
- ส่งข้อมูลทุก 10-30 วินาที (อย่าน้อยกว่า 5 วินาที)
- Archive old data หลัง 30 วัน
- ใช้ Database index ที่มีอยู่

### Security
- ย้าย passwords ไปที่ environment variables
- ใช้ MQTT over TLS (port 8883)
- เพิ่ม API authentication

### Monitoring
- เช็ค listener logs เป็นประจํา
- ตั้งค่า disk space alerts
- Backup database ทุกวัน

---

## 📞 Support & Contact

### หากมีปัญหา:
1. อ่าน Troubleshooting section
2. ตรวจสอบ logs: `tail -f /var/log/pg46_listener.log`
3. ดู database: `mysql -u ksystem -pZera2026Admin ksystem`
4. Test API: `curl http://localhost:3001/api/kenergy/device-monitoring?deviceId=meter1`

---

**สรุป:**
- ใช้ `pg46_power_records_listener.py` สำหรับ Monitor Dashboard
- PG46 ส่งข้อมูลตาม `PG46-PAYLOAD-FORMAT.md`
- ข้อมูลจะเข้าตาราง `power_records` และแสดงบน Monitor Dashboard อัตโนมัติ

**สถานะ**: ✅ พร้อมใช้งาน
**วันที่สร้าง**: 6 มีนาคม 2026
**เวอร์ชัน**: 1.0

---

🎉 **ขอให้ใช้งานระบบอย่างมีประสิทธิภาพ!**
