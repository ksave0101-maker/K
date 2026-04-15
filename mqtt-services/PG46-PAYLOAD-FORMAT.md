# 🔌 PG46 MQTT Payload Format & Configuration

## 📋 สองแบบการทำงาน

### 🟦 Option 1: Basic Meter Data (meter_data table)
**ไฟล์**: `pg46_meter_listener.py`
**ใช้สำหรับ**: บันทึกข้อมูลพื้นฐานจากมิเตอร์
**ตาราง**: `meter_data`

### 🟩 Option 2: Complete Power Records (power_records table) ✅ แนะนำ
**ไฟล์**: `pg46_power_records_listener.py`
**ใช้สำหรับ**: แสดงผลบน Monitor Dashboard
**ตาราง**: `power_records`

---

## 📊 Payload Format Comparison

### Basic Format (meter_data)
```json
{
  "meter_id": "meter1",
  "voltage": 220.5,
  "current": 10.2,
  "power": 2255
}
```

### Complete Format (power_records) ✅
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
  "thd": 3.5,
  "before_kwh": 1600000,
  "before_thd": 5.0
}
```

---

## 🎯 ข้อมูลที่ต้องส่งจาก PG46

### ✅ Required Fields (จำเป็น)
| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `device_id` | string | - | รหัสอุปกรณ์ (meter1, meter2) |
| `voltage_l1` | float | V | แรงดันไฟฟ้า Phase 1 |
| `voltage_l2` | float | V | แรงดันไฟฟ้า Phase 2 |
| `voltage_l3` | float | V | แรงดันไฟฟ้า Phase 3 |
| `current_l1` | float | A | กระแสไฟฟ้า Phase 1 |
| `current_l2` | float | A | กระแสไฟฟ้า Phase 2 |
| `current_l3` | float | A | กระแสไฟฟ้า Phase 3 |
| `power` | float | W | Active Power (จะแปลงเป็น kW อัตโนมัติ) |

### 🔶 Recommended Fields (แนะนำ)
| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `reactive_power` | float | VAr | Reactive Power (จะแปลงเป็น kVAr) |
| `apparent_power` | float | VA | Apparent Power (จะแปลงเป็น kVA) |
| `frequency` | float | Hz | ความถี่ (ปกติ 50 หรือ 60 Hz) |
| `power_factor` | float | - | Power Factor (0-1) |
| `energy` | float | Wh | Energy (จะแปลงเป็น kWh) |
| `thd` | float | % | Total Harmonic Distortion |

### ⚪ Optional Fields (ถ้ามี)
| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `before_kwh` | float | Wh | Energy ก่อนติด K-Save |
| `before_thd` | float | % | THD ก่อนติด K-Save |

---

## 🔧 PG46 Configuration

### MQTT Topics
```
factory/meter1/data  # สำหรับมิเตอร์ตัวที่ 1
factory/meter2/data  # สำหรับมิเตอร์ตัวที่ 2
```

### MQTT Broker Settings
```
Host: localhost (หรือ IP ของเซิร์ฟเวอร์)
Port: 1883
QoS: 0 หรือ 1
```

### Publish Interval
```
แนะนำ: 10-30 วินาที
ขั้นต่ำ: 5 วินาที
สูงสุด: 60 วินาที
```

---

## 📝 ตัวอย่าง Payload ที่สมบูรณ์

### Meter 1 (3-Phase)
```json
{
  "device_id": "meter1",
  "voltage_l1": 220.5,
  "voltage_l2": 221.2,
  "voltage_l3": 219.8,
  "current_l1": 15.3,
  "current_l2": 14.8,
  "current_l3": 15.1,
  "power": 9850,
  "reactive_power": 1800,
  "apparent_power": 10014,
  "frequency": 50.0,
  "power_factor": 0.984,
  "energy": 2458000,
  "thd": 3.2,
  "before_kwh": 2650000,
  "before_thd": 5.8
}
```

### Meter 2 (Single Phase)
```json
{
  "device_id": "meter2",
  "voltage_l1": 220.0,
  "voltage_l2": 0,
  "voltage_l3": 0,
  "current_l1": 8.5,
  "current_l2": 0,
  "current_l3": 0,
  "power": 1870,
  "reactive_power": 350,
  "apparent_power": 1902,
  "frequency": 50.0,
  "power_factor": 0.983,
  "energy": 850000,
  "thd": 2.8
}
```

---

## 🚀 Quick Start

### 1. เริ่มใช้งาน Power Records Listener
```bash
# สำหรับ Monitor Dashboard
python mqtt-services/pg46_power_records_listener.py
```

### 2. ทดสอบส่งข้อมูล (MQTT Test)
```bash
# ใช้ mosquitto_pub
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

### 3. ตรวจสอบข้อมูลในฐานข้อมูล
```bash
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT device_id, record_time, metrics_P, metrics_kWh, energy_reduction 
FROM power_records 
ORDER BY record_time DESC 
LIMIT 5;"
```

### 4. ดูผลบน Monitor Dashboard
```
http://localhost:3001/monitor
```

---

## 🔄 Data Flow

```
┌─────────────────┐
│   PG46 Meter    │
│                 │
│  ส่ง JSON ทาง   │
│  MQTT Topics    │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│  pg46_power_records_listener.py  │
│                                  │
│  1. รับข้อมูล JSON               │
│  2. แปลงหน่วย (W→kW, Wh→kWh)    │
│  3. คำนวณ energy_reduction       │
│  4. คำนวณ co2_reduction          │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  MySQL: power_records table      │
│                                  │
│  - device_id                     │
│  - voltage L1/L2/L3              │
│  - current L1/L2/L3              │
│  - power metrics (P/Q/S)         │
│  - frequency, power_factor       │
│  - energy, THD                   │
│  - savings calculations          │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  API: /api/kenergy/              │
│       device-monitoring          │
│                                  │
│  SELECT ล่าสุดจาก power_records  │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Monitor Dashboard               │
│  http://localhost:3001/monitor   │
│                                  │
│  แสดงครบทุก metrics              │
└──────────────────────────────────┘
```

---

## 📐 Unit Conversions (อัตโนมัติ)

| จาก PG46 | Listener แปลงเป็น | ตัวอย่าง |
|----------|-------------------|----------|
| power (W) | metrics_P (kW) | 6800 W → 6.8 kW |
| reactive_power (VAr) | metrics_Q (kVAr) | 1200 VAr → 1.2 kVAr |
| apparent_power (VA) | metrics_S (kVA) | 6900 VA → 6.9 kVA |
| energy (Wh) | metrics_kWh (kWh) | 1500500 Wh → 1500.5 kWh |

---

## ✅ Checklist

- [ ] PG46 ตั้งค่า MQTT Broker address
- [ ] PG46 ตั้งค่า Topic: `factory/meter1/data` หรือ `meter2`
- [ ] PG46 ส่งข้อมูลครบตาม Required Fields
- [ ] MQTT Broker (mosquitto) รันอยู่
- [ ] Python listener รันอยู่
- [ ] Database table `power_records` ถูกสร้างแล้ว
- [ ] ทดสอบส่งข้อมูล (mosquitto_pub)
- [ ] ตรวจสอบข้อมูลใน database
- [ ] เปิด Monitor Dashboard ดูผล

---

## 🔍 Troubleshooting

### ไม่มีข้อมูลในฐานข้อมูล
```bash
# 1. ตรวจสอบ listener ทำงานหรือไม่
ps aux | grep pg46_power_records

# 2. ตรวจสอบ MQTT broker
netstat -tuln | grep 1883

# 3. Subscribe ดูข้อมูลที่ส่งมา
mosquitto_sub -h localhost -t "factory/+/data" -v
```

### Payload ไม่ถูกต้อง
```python
# Listener จะ log error ออกมา
# ดูที่ terminal หรือ log file
tail -f /var/log/pg46_listener.log
```

### Monitor Dashboard ไม่แสดงข้อมูล
```bash
# ตรวจสอบว่ามีข้อมูลใน power_records
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT COUNT(*) FROM power_records WHERE device_id = 'meter1';"

# ตรวจสอบ device_id ตรงกับที่เลือกใน dropdown หรือไม่
```

---

## 📚 Related Documentation

- [MONITOR-DATA-REQUIREMENTS.md](./MONITOR-DATA-REQUIREMENTS.md) - ข้อมูลที่ Monitor Dashboard ต้องการ
- [SETUP-GUIDE.md](./SETUP-GUIDE.md) - คู่มือติดตั้ง
- [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - คำสั่งด่วน

---

**Created**: March 6, 2026
**Status**: Ready for PG46 integration
