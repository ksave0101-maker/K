# 📊 Monitor Dashboard - Data Requirements

## หน้า http://localhost:3001/monitor แสดงข้อมูลอะไร?

หน้า Monitor Dashboard แสดงข้อมูลตรวจสอบอุปกรณ์แบบ Real-time จาก **ตาราง `power_records`**

### 📈 ข้อมูลที่แสดง:

#### 1. **Voltage (แรงดันไฟฟ้า)**
   - Voltage L1 (V)
   - Voltage L2 (V)
   - Voltage L3 (V)
   - แสดงเป็น กราฟ + ค่าตัวเลข

#### 2. **Current (กระแสไฟฟ้า)**
   - Current L1 (A)
   - Current L2 (A)
   - Current L3 (A)
   - แสดงเป็น กราฟ + ค่าตัวเลข

#### 3. **Power (พลังงาน)**
   - **Active Power (kW)** - พลังงานจริงที่ใช้งาน
   - **Reactive Power (kVAr)** - พลังงานรีแอคทีฟ
   - **Apparent Power (kVA)** - พลังงานปรากฏ

#### 4. **Power Quality (คุณภาพกระแสไฟ)**
   - **Frequency (Hz)** - ความถี่ (ปกติ 50Hz หรือ 60Hz)
   - **Power Factor** - ค่าพาวเวอร์แฟคเตอร์ (0-1)
   - **THD Before (%)** - Total Harmonic Distortion ก่อนติด K-Save
   - **THD After (%)** - Total Harmonic Distortion หลังติด K-Save

#### 5. **Energy Consumption (การใช้พลังงาน)**
   - **Energy (kWh)** - พลังงานที่ใช้ไป
   - **Energy Saved (kWh)** - พลังงานที่ประหยัดได้
   - **Before Energy (kWh)** - พลังงานที่ใช้ก่อนติด K-Save

#### 6. **Environmental Impact**
   - **CO₂ Saved (kg)** - ปริมาณ CO₂ ที่ลดได้

#### 7. **Trend Charts (กราฟแนวโน้ม)**
   - สามารถเลือกดูกราฟแต่ละ metric ตามช่วงเวลา (minute/hour/day)
   - เลือกช่วงวันที่ได้
   - Export ข้อมูลได้

---

## 🗄️ ฐานข้อมูลต้องมีค่าอะไรบ้าง?

### ตาราง: `power_records`

```sql
CREATE TABLE power_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    record_time DATETIME NOT NULL,
    
    -- Voltage (Before K-Save / Line-to-Line)
    before_L1 DECIMAL(10, 2),  -- แรงดัน L1 (V)
    before_L2 DECIMAL(10, 2),  -- แรงดัน L2 (V)
    before_L3 DECIMAL(10, 2),  -- แรงดัน L3 (V)
    
    -- Current (After K-Save / Metrics)
    metrics_L1 DECIMAL(10, 2),  -- กระแส L1 (A)
    metrics_L2 DECIMAL(10, 2),  -- กระแส L2 (A)
    metrics_L3 DECIMAL(10, 2),  -- กระแส L3 (A)
    
    -- Power (After K-Save)
    metrics_P DECIMAL(10, 2),   -- Active Power (kW)
    metrics_Q DECIMAL(10, 2),   -- Reactive Power (kVAr)
    metrics_S DECIMAL(10, 2),   -- Apparent Power (kVA)
    
    -- Power Quality
    metrics_F DECIMAL(10, 2),   -- Frequency (Hz) ปกติ 50-60 Hz
    metrics_PF DECIMAL(10, 4),  -- Power Factor (0-1)
    
    -- Energy
    metrics_kWh DECIMAL(10, 2), -- Energy consumption (kWh)
    before_kWh DECIMAL(10, 2),  -- Energy before K-Save (kWh)
    
    -- THD (Total Harmonic Distortion)
    before_THD DECIMAL(10, 2),  -- THD ก่อนติด K-Save (%)
    metrics_THD DECIMAL(10, 2), -- THD หลังติด K-Save (%)
    
    -- Savings
    energy_reduction DECIMAL(10, 2), -- พลังงานที่ประหยัดได้ (kWh)
    co2_reduction DECIMAL(10, 2),    -- CO₂ ที่ลดได้ (kg)
    
    INDEX idx_device_time (device_id, record_time)
);
```

---

## ✅ ข้อมูลที่ต้องบันทึกครบทุกครั้ง

### จากมิเตอร์ PG46 ต้องส่งข้อมูล:

```json
{
  "device_id": "meter1",
  "voltage_l1": 220.5,    // Voltage L1
  "voltage_l2": 221.0,    // Voltage L2
  "voltage_l3": 219.8,    // Voltage L3
  "current_l1": 10.2,     // Current L1
  "current_l2": 9.8,      // Current L2
  "current_l3": 10.5,     // Current L3
  "power": 6800.5,        // Active Power (W → kW)
  "reactive_power": 1200, // Reactive Power (VAr → kVAr)
  "apparent_power": 6900, // Apparent Power (VA → kVA)
  "frequency": 50.0,      // Frequency (Hz)
  "power_factor": 0.98,   // Power Factor
  "energy": 1500.5,       // Energy (Wh → kWh)
  "thd": 3.5              // THD (%)
}
```

### ค่าที่ต้องคำนวณเพิ่มเติม (ในระบบ):

```javascript
// คำนวณจากข้อมูล before และ after
energy_reduction = before_kWh - metrics_kWh
co2_reduction = energy_reduction * 0.5 // ตัวอย่าง 0.5 kg CO₂ per kWh
```

---

## 🔄 Flow การทำงาน

```
┌──────────────────┐
│  PG46 Meter 1/2  │
│                  │
│  ส่งข้อมูล MQTT  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  MQTT Listener (Python)  │
│                          │
│  - รับข้อมูล JSON        │
│  - แปลงหน่วย (W→kW)      │
│  - คำนวณค่า reduction    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  MySQL: power_records    │
│                          │
│  INSERT INTO...          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  API: /api/kenergy/      │
│       device-monitoring  │
│                          │
│  SELECT FROM power_      │
│  records WHERE device_id │
│  ORDER BY record_time    │
│  DESC LIMIT 1            │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Monitor Dashboard       │
│  http://localhost:3001/  │
│       monitor            │
│                          │
│  แสดง:                   │
│  - Voltage, Current      │
│  - Power, Energy         │
│  - Charts, Stats         │
└──────────────────────────┘
```

---

## 📝 ตัวอย่างข้อมูลที่ต้องมีในตาราง

```sql
INSERT INTO power_records (
    device_id, record_time,
    before_L1, before_L2, before_L3,
    metrics_L1, metrics_L2, metrics_L3,
    metrics_P, metrics_Q, metrics_S,
    metrics_F, metrics_PF,
    metrics_kWh, before_kWh,
    before_THD, metrics_THD,
    energy_reduction, co2_reduction
) VALUES (
    'meter1', NOW(),
    220.5, 221.0, 219.8,           -- Voltage (V)
    10.2, 9.8, 10.5,               -- Current (A)
    6.8, 1.2, 6.9,                 -- Power (kW, kVAr, kVA)
    50.0, 0.98,                    -- Frequency, PF
    1500.5, 1600.0,                -- Energy (kWh)
    5.0, 3.5,                      -- THD (%)
    99.5, 49.75                    -- Savings (kWh, kg CO₂)
);
```

---

## 🎯 สิ่งที่ต้องทำต่อ

### ✅ Already Done:
- ✅ MQTT Listener สำหรับ meter_data (basic)
- ✅ API endpoint /api/meter-data
- ✅ Component MeterDataDisplay

### ⚠️ Need to Update:
- [ ] แก้ไข MQTT Listener ให้บันทึกเข้าตาราง `power_records`
- [ ] เพิ่มการแปลงหน่วย (W → kW, VAr → kVAr)
- [ ] คำนวณค่า energy_reduction และ co2_reduction
- [ ] อัพเดท MQTT payload format ให้ครบถ้วน

### 📋 Next Steps:
1. ปรับปรุง MQTT Listener (`pg46_meter_listener.py`)
2. เพิ่มการคำนวณค่าต่างๆ
3. บันทึกเข้าตาราง `power_records` แทน `meter_data`
4. Monitor Dashboard จะดึงข้อมูลแสดงอัตโนมัติ

---

## 🔧 Quick Commands

```bash
# ดูข้อมูลในตาราง power_records
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT * FROM power_records 
WHERE device_id = 'meter1' 
ORDER BY record_time DESC 
LIMIT 5;"

# ตรวจสอบว่ามีข้อมูลหรือยัง
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT device_id, COUNT(*) as count, MAX(record_time) as last_update 
FROM power_records 
GROUP BY device_id;"

# Test API
curl "http://localhost:3001/api/kenergy/device-monitoring?deviceId=meter1"
```

---

## 📚 Related Files

- **Monitor Page**: `/app/(kenergy)/monitor/page.tsx`
- **API Endpoint**: `/app/api/kenergy/device-monitoring/route.ts`
- **MQTT Listener**: `/mqtt-services/pg46_meter_listener.py` (ต้องอัพเดท)

---

**Last Updated**: March 6, 2026
**Status**: Ready for integration with power_records table
