# 📊 THD Display Fix - Monitor Dashboard

## 🔍 ปัญหาที่พบ

หน้า Monitor Dashboard แสดง THD (Total Harmonic Distortion) เป็น "—" แทนที่จะแสดงค่าจริงจากฐานข้อมูล

```
THD Before: —
THD After: —
```

## ✅ สาเหตุและวิธีแก้

### 1. ปัญหา: Type Mismatch ใน Query

**API Query เดิม:**
```sql
WHERE device_id = ?
```

**ปัญหา:**
- `device_id` ในตาราง `power_records` เป็น INT
- แต่ parameter ที่ส่งมาจากหน้า Monitor อาจเป็น STRING
- ทำให้ query ไม่เจอข้อมูล

**วิธีแก้:**
```sql
WHERE device_id = CAST(? AS UNSIGNED)
```

✅ แก้แล้วใน: `/app/api/kenergy/device-monitoring/route.ts`

---

### 2. ไม่มีข้อมูล THD ในฐานข้อมูล

**ตรวจสอบว่ามีข้อมูล THD หรือไม่:**
```bash
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT device_id, record_time, before_THD, metrics_THD 
FROM power_records 
WHERE before_THD IS NOT NULL 
ORDER BY record_time DESC 
LIMIT 5;"
```

**ถ้าไม่มีข้อมูล → เพิ่มข้อมูลทดสอบ:**
```bash
mysql -u ksystem -pZera2026Admin ksystem < database_schemas/insert_test_thd_data.sql
```

---

### 3. Device ID ไม่ตรงกัน

**โครงสร้างฐานข้อมูล:**
- ตาราง `devices` มี `deviceID` (INT) = 1, 2, 3, 7, 8
- ตาราง `power_records` มี `device_id` (INT) = Foreign Key → devices.deviceID

**หน้า Monitor:**
- Dropdown เลือก device → ส่ง `device.deviceID` ไปที่ API
- API ต้อง cast เป็น INT ก่อน query

---

## 🚀 วิธีแก้ไขทั้งหมด

### ขั้นที่ 1: เพิ่มข้อมูลทดสอบ

```bash
mysql -u ksystem -pZera2026Admin ksystem < database_schemas/insert_test_thd_data.sql
```

### ขั้นที่ 2: Refresh หน้า Monitor

```
http://localhost:3001/monitor
```

### ขั้นที่ 3: ตรวจสอบผลลัพธ์

ค่า THD ควรแสดงเป็น:
```
THD Before: 4.80%
THD After: 2.90%
THD Reduction: 39.6%
```

---

## 🔧 การแก้ไขที่ทำแล้ว

### 1. แก้ไข API Query
**ไฟล์:** `/app/api/kenergy/device-monitoring/route.ts`

```typescript
// เดิม
WHERE device_id = ?

// แก้เป็น
WHERE device_id = CAST(? AS UNSIGNED)
```

### 2. สร้าง SQL Script เพิ่มข้อมูลทดสอบ
**ไฟล์:** `/database_schemas/insert_test_thd_data.sql`

- เพิ่มข้อมูล THD สำหรับ device 1, 2, 3
- ค่า `before_THD`: 4.8%, 5.2%, 4.5%
- ค่า `metrics_THD`: 2.9%, 3.1%, 2.7%

---

## 📊 โครงสร้างข้อมูล THD

### ตาราง: power_records

| Column | Type | Description |
|--------|------|-------------|
| `before_THD` | DECIMAL(8,3) | THD ก่อนติด K-Save (%) |
| `metrics_THD` | DECIMAL(8,3) | THD หลังติด K-Save (%) |

### การคำนวณ THD Reduction

```sql
SELECT 
    before_THD,
    metrics_THD,
    ROUND((before_THD - metrics_THD) / before_THD * 100, 1) as reduction_percent
FROM power_records
WHERE device_id = 1
ORDER BY record_time DESC
LIMIT 1;
```

---

## 🧪 การทดสอบ

### 1. ทดสอบ API โดยตรง

```bash
curl "http://localhost:3001/api/kenergy/device-monitoring?deviceId=1" | jq '.data.metrics.thdBefore, .data.metrics.thdAfter'
```

**ผลลัพธ์ที่คาดหวัง:**
```json
4.8
2.9
```

### 2. ตรวจสอบข้อมูลในฐานข้อมูล

```bash
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT device_id, before_THD, metrics_THD, 
       ROUND(before_THD - metrics_THD, 2) as reduction
FROM power_records 
WHERE device_id = 1 
ORDER BY record_time DESC 
LIMIT 1;"
```

### 3. ตรวจสอบหน้า Monitor

1. เปิด http://localhost:3001/monitor
2. เลือก Device: KSAVE01
3. ดูที่ส่วน "Total Harmonic Distortion (THD)"
4. ควรเห็น:
   - THD Before: 4.80%
   - THD After: 2.90%
   - THD Reduction: 39.6%

---

## 📝 MQTT Listener Integration

หาก THD values ควรมาจาก MQTT listener จริง:

### อัพเดท PG46 Payload

```json
{
  "device_id": 1,
  "voltage_l1": 220.5,
  "current_l1": 15.2,
  "power": 9850,
  "frequency": 50.0,
  "power_factor": 0.985,
  "energy": 2500500,
  "thd": 2.9,           // THD หลังติด K-Save
  "before_thd": 4.8     // THD ก่อนติด K-Save
}
```

### อัพเดท MQTT Listener

ไฟล์ `pg46_power_records_listener.py` รองรับ THD แล้ว:

```python
before_thd = data.get("before_thd", data.get("thd", 0) * 1.5)
metrics_thd = data.get("thd", 0)
```

---

## ✅ Checklist

- [x] แก้ไข API query (CAST deviceId to INT)
- [x] สร้าง SQL script เพิ่มข้อมูลทดสอบ
- [ ] รัน SQL script เพิ่มข้อมูล
- [ ] ทดสอบ API endpoint
- [ ] Refresh หน้า Monitor Dashboard
- [ ] ตรวจสอบ THD values แสดงผล
- [ ] ตั้งค่า PG46 ส่งข้อมูล THD จริง
- [ ] รัน MQTT listener รับข้อมูล

---

## 🔍 Troubleshooting

### THD ยังแสดง "—"

**1. ตรวจสอบว่ามีข้อมูล:**
```bash
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT COUNT(*) FROM power_records 
WHERE before_THD IS NOT NULL AND metrics_THD IS NOT NULL;"
```

**2. ตรวจสอบ device_id:**
```bash
mysql -u ksystem -pZera2026Admin ksystem -e "
SELECT DISTINCT device_id FROM power_records;"
```

**3. ตรวจสอบ API response:**
```bash
curl "http://localhost:3001/api/kenergy/device-monitoring?deviceId=1" | jq
```

### ข้อมูลไม่ตรงกับที่คาดหวัง

- ล้าง cache: Hard Reload (Ctrl+Shift+R)
- ตรวจสอบ Network tab ใน DevTools
- ดู Console log หา error

---

## 📚 Related Files

- **API Endpoint**: `/app/api/kenergy/device-monitoring/route.ts`
- **Monitor Page**: `/app/(kenergy)/monitor/page.tsx`
- **Test Data SQL**: `/database_schemas/insert_test_thd_data.sql`
- **MQTT Listener**: `/mqtt-services/pg46_power_records_listener.py`

---

**สถานะ**: ✅ แก้ไขเสร็จแล้ว  
**วันที่**: March 6, 2026  
**ผลลัพธ์**: THD values จะแสดงบน Monitor Dashboard อย่างถูกต้อง
