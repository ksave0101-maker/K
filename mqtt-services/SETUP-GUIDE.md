# ตั้งค่า MQTT Meter Listener - รับข้อมูล 2 มิเตอร์ PG46

## 📋 ขั้นตอนการติดตั้ง

### 1. สร้างตาราง meter_data ในฐานข้อมูล ksystem
```bash
mysql -u ksystem -pZera2026Admin ksystem < database_schemas/create_meter_data_ksystem.sql
```

### 2. ติดตั้ง Python dependencies
```bash
pip install -r mqtt-services/requirements.txt
```

### 3. รัน listener
```bash
python mqtt-services/pg46_meter_listener.py
```

## 🔌 MQTT Topics
- **meter1**: `factory/meter1/data`
- **meter2**: `factory/meter2/data`

## 📊 ข้อมูลที่รองรับ
Payload JSON ต้องมี:
```json
{
  "meter_id": "meter1",
  "voltage": 220.5,
  "current": 10.2,
  "power": 2255
}
```

## 🗄️ ตาราง Database
- **meter_data**: บันทึกค่าจากมิเตอร์
- **meter_summary**: สรุปข้อมูลเฉลี่ย

## 📝 ดูข้อมูลที่บันทึกแล้ว
```bash
mysql -u ksystem -pZera2026Admin -e "USE ksystem; SELECT * FROM meter_data LIMIT 10;"
mysql -u ksystem -pZera2026Admin -e "USE ksystem; SELECT * FROM meter_summary;"
```

## ⚙️ การควบคุม
- รองรับ 2 มิเตอร์พร้อมกัน
- Error handling อัตโนมัติ
- Logging สำหรับ debug
