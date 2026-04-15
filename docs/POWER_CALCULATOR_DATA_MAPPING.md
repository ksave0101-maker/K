# Power Calculator - การบันทึกข้อมูลลงฐานข้อมูล

## สรุป: ทุกช่องที่กรอกในฟอร์ม จะบันทึกลงตาราง `power_calculations`

---

## การแมพข้อมูล Form → Database

### ส่วนที่ 1: ข้อมูลระบบ
| ฟิลด์ในฟอร์ม | คอลัมน์ในฐานข้อมูล | ประเภทข้อมูล | หมายเหตุ |
|-------------|-------------------|-------------|----------|
| Title | `title` | VARCHAR(255) | หัวข้อเอกสาร |
| Power Calcu No | `power_calcuNo` | VARCHAR(225) | เลขที่เอกสาร (auto-gen) |
| Created By | `created_by` | VARCHAR(150) | ผู้สร้างเอกสาร |
| Customer | `cusID` | INT(11) | รหัสลูกค้า (Foreign Key) |
| Status | `status` | VARCHAR(20) | draft/completed |
| - | `calcID` | INT(11) | Primary Key (AUTO_INCREMENT) |
| - | `created_at` | TIMESTAMP | วันที่สร้าง (auto) |
| - | `updated_at` | TIMESTAMP | วันที่แก้ไขล่าสุด (auto) |

### ส่วนที่ 2: ข้อมูลไฟฟ้าพื้นฐาน (Basic Electrical Parameters)
| ฟิลด์ในฟอร์ม | คอลัมน์ในฐานข้อมูล | ประเภทข้อมูล | หน่วย |
|-------------|-------------------|-------------|-------|
| Voltage (แรงดัน) | `voltage` | DECIMAL(10,2) | V (โวลต์) |
| Current (กระแส) | `current` | DECIMAL(10,2) | A (แอมแปร์) |
| Power Factor (PF) | `power_factor` | DECIMAL(5,4) | 0-1 |
| Phase (เฟส) | `phase_type` | VARCHAR(20) | single/three |

### ส่วนที่ 3: ข้อมูลบริษัท/ลูกค้า
| ฟิลด์ในฟอร์ม | คอลัมน์ในฐานข้อมูล | ประเภทข้อมูล | หมายเหตุ |
|-------------|-------------------|-------------|----------|
| Company Name | `company_name` | VARCHAR(255) | ชื่อบริษัท |
| Pre-Installation Form | `pre_inst_id` | INT(11) | อ้างอิงจาก pre_installation |

### ส่วนที่ 4: ข้อมูลกำลังไฟและความจุ
| ฟิลด์ในฟอร์ม | คอลัมน์ในฐานข้อมูล | ประเภทข้อมูล | หน่วย |
|-------------|-------------------|-------------|-------|
| Contracted Capacity | `contracted_capacity` | DECIMAL(15,2) | kW |
| Peak Power | `peak_power` | DECIMAL(15,2) | kW |
| Device Capacity | `device_capacity` | DECIMAL(15,2) | kVAR |

### ส่วนที่ 5: ข้อมูลการใช้พลังงาน
| ฟิลด์ในฟอร์ม | คอลัมน์ในฐานข้อมูล | ประเภทข้อมูล | หน่วย/หมายเหตุ |
|-------------|-------------------|-------------|----------------|
| Avg Monthly Usage | `avg_monthly_usage` | DECIMAL(15,2) | kWh (คำนวณจาก 12 เดือน) |
| Usage Data Months | `usage_data_months` | INT(11) | จำนวนเดือนที่มีข้อมูล |
| Power Saving Rate | `power_saving_rate` | DECIMAL(5,2) | % (เปอร์เซ็นต์) |
| Emission Factor | `emission_factor` | DECIMAL(10,6) | ค่า CO2 |

### ส่วนที่ 6: ข้อมูลราคาและการเงิน
| ฟิลด์ในฟอร์ม | คอลัมน์ในฐานข้อมูล | ประเภทข้อมูล | หน่วย |
|-------------|-------------------|-------------|-------|
| Unit Price | `unit_price` | DECIMAL(10,2) | บาท/kWh |
| Product Price | `product_price` | DECIMAL(15,2) | บาท |
| Device Cost | `device_cost` | DECIMAL(15,2) | บาท (ค่าติดตั้ง) |
| Expected Savings % | `expected_savings_percent` | DECIMAL(5,2) | % |
| Amortize Months | `amortize_months` | INT(11) | เดือน |
| Payment Months | `payment_months` | INT(11) | เดือน |

### ส่วนที่ 7: ข้อมูลติดตั้ง
| ฟิลด์ในฟอร์ม | คอลัมน์ในฐานข้อมูล | ประเภทข้อมูล | หมายเหตุ |
|-------------|-------------------|-------------|----------|
| Faucet Method | `faucet_method` | VARCHAR(255) | วิธีการติดตั้ง |

### ส่วนที่ 8: ข้อมูลแบบ Array/List (บันทึกเป็น JSON)
| ฟิลด์ในฟอร์ม | คอลัมน์ในฐานข้อมูล | ประเภทข้อมูล | โครงสร้าง |
|-------------|-------------------|-------------|-----------|
| Appliances (อุปกรณ์) | `appliances` | LONGTEXT (JSON) | [{name, power, qty, hours}] |
| Usage History | `usage_history` | LONGTEXT (JSON) | [{period, kwh, peak_kw}] |
| Monthly kWh (12 เดือน) | `monthly_kwh` | LONGTEXT (JSON) | [num, num, ...] (12 ตัวเลข) |
| Twelve Months | `twelve_months` | LONGTEXT (JSON) | [{period, kwh, peak_kw}] |
| Pre-Install Results | `pre_install_results` | LONGTEXT (JSON) | [{}] ข้อมูลจาก pre-install |

### ส่วนที่ 9: ผลการคำนวณ
| ฟิลด์ในฟอร์ม | คอลัมน์ในฐานข้อมูล | ประเภทข้อมูล | โครงสร้าง JSON |
|-------------|-------------------|-------------|----------------|
| Calculation Results | `result` | LONGTEXT (JSON) | {real, apparent, reactive} |

### ส่วนที่ 10: ธงและการตั้งค่า
| ฟิลด์ในฟอร์ม | คอลัมน์ในฐานข้อมูล | ประเภทข้อมูล | หมายเหตุ |
|-------------|-------------------|-------------|----------|
| Show 12 Month Modal | `show_12month_modal` | TINYINT(1) | 0/1 (boolean) |

### ส่วนที่ 11: Backup ทั้งหมด
| ฟิลด์ | คอลัมน์ในฐานข้อมูล | ประเภทข้อมูล | หมายเหตุ |
|------|-------------------|-------------|----------|
| ALL Parameters | `parameters` | LONGTEXT (JSON) | **สำรองข้อมูลทั้งหมด** |

---

## กระบวนการบันทึกข้อมูล

### 1. เมื่อกด "บันทึกการคำนวณ" (Save Calculation)
```javascript
// Frontend ส่งข้อมูลทั้งหมดไปที่ API
POST /api/power-calculations
{
  title: "...",
  parameters: {
    voltage: 230,
    current: 100,
    pf: 0.85,
    phase: "three",
    companyName: "ABC Company",
    unitPrice: 5.0,
    productPrice: 128037,
    powerSavingRate: 10,
    deviceCapacity: 30,
    avgMonthlyUsage: 50000,
    paymentMonths: 60,
    // ... และอื่นๆ ทั้งหมด
  },
  result: { real: 100, apparent: 117, reactive: 60 },
  status: "completed",
  cusID: 123
}
```

### 2. API จะแยกข้อมูลและบันทึก
```sql
INSERT INTO power_calculations (
  -- ระบบ
  power_calcuNo, title, created_by, cusID, status,
  -- ไฟฟ้า
  voltage, current, power_factor, phase_type,
  -- บริษัท
  company_name, pre_inst_id,
  -- กำลังไฟ
  contracted_capacity, peak_power, device_capacity,
  -- พลังงาน
  avg_monthly_usage, usage_data_months, power_saving_rate, emission_factor,
  -- การเงิน
  unit_price, product_price, device_cost, expected_savings_percent,
  amortize_months, payment_months,
  -- ติดตั้ง
  faucet_method,
  -- JSON Arrays
  appliances, usage_history, monthly_kwh, twelve_months, pre_install_results,
  -- ธง
  show_12month_modal,
  -- ผลลัพธ์และ Backup
  result, parameters
) VALUES (
  -- ค่าทั้งหมดจากฟอร์ม
  ?, ?, ?, ..., ?
)
```

### 3. เมื่อแก้ไขข้อมูล (Edit)
```javascript
// คลิกปุ่ม View หรือ เลขที่รายการ → โหลดข้อมูลจาก calcID
GET /api/power-calculations?calcID=5

// แก้ไขแล้วกด Save → อัพเดทข้อมูล
PUT /api/power-calculations
{
  calcID: 5,
  // ข้อมูลใหม่ทั้งหมด
}
```

---

## การตรวจสอบข้อมูลที่บันทึก

### ดูข้อมูลในตาราง
```sql
-- ดูข้อมูลทั้งหมด
SELECT * FROM power_calculations WHERE calcID = 5;

-- ดูเฉพาะฟิลด์สำคัญ
SELECT
  calcID,
  power_calcuNo,
  company_name,
  voltage,
  current,
  product_price,
  avg_monthly_usage,
  power_saving_rate,
  status,
  created_at
FROM power_calculations
ORDER BY created_at DESC;

-- ดูข้อมูล JSON
SELECT
  calcID,
  JSON_EXTRACT(parameters, '$.voltage') as voltage_from_json,
  JSON_EXTRACT(appliances, '$[0].name') as first_appliance,
  JSON_EXTRACT(result, '$.real') as real_power
FROM power_calculations
WHERE calcID = 5;
```

### ตรวจสอบว่าข้อมูลครบหรือไม่
```sql
-- นับฟิลด์ที่มีค่า (ไม่เป็น NULL)
SELECT
  calcID,
  power_calcuNo,
  CASE WHEN voltage IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN current IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN power_factor IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN company_name IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN product_price IS NOT NULL THEN 1 ELSE 0 END +
  CASE WHEN avg_monthly_usage IS NOT NULL THEN 1 ELSE 0 END
  AS filled_fields_count
FROM power_calculations
ORDER BY created_at DESC
LIMIT 10;
```

---

## การรับประกัน

### ✅ ข้อมูลทุกช่องที่กรอกจะบันทึก:
1. ✅ บันทึกลงคอลัมน์แยก (36 คอลัมน์)
2. ✅ บันทึก Backup ใน `parameters` (JSON)
3. ✅ API POST รองรับทุกฟิลด์
4. ✅ API PUT รองรับการแก้ไขทุกฟิลด์
5. ✅ Modal แสดง + แก้ไขได้ทุกฟิลด์
6. ✅ Print Report แสดงทุกฟิลด์

### 🔒 ความปลอดภัยของข้อมูล:
- คอลัมน์แยก → Query เร็ว, สร้างรายงานง่าย
- parameters JSON → Backup สมบูรณ์, ไม่สูญหาย
- Indexes → ค้นหาเร็ว
- Timestamps → ติดตามการเปลี่ยนแปลง

---

## สรุป

**ทุกช่องที่กรอกในฟอร์ม Power Calculator จะบันทึกลงฐานข้อมูลตาราง `power_calculations` ครบถ้วน 100%**

- จำนวนคอลัมน์: **36 คอลัมน์**
- จำนวนฟิลด์ในฟอร์ม: **ครอบคลุมทั้งหมด**
- Backup: **มี (parameters JSON)**
- การแก้ไข: **รองรับ (PUT method)**
- การแสดงผล: **Modal + Print**

✅ **พร้อมใช้งาน 100%**
