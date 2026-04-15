# Document Number Format

## 📋 รูปแบบเลขเอกสาร

ระบบใช้รูปแบบเลขเอกสารที่รีเซ็ตทุกวัน (Daily Reset)

### ทั่วไป
```
PREFIX-YYYYMMDD-####
```

### Warranty (พิเศษ - มี TH)
```
WT-TH-YYYYMMDD-####
```

---

## 🔢 ตัวอย่าง

### วันที่ 19 มีนาคม 2026

| เอกสาร | รูปแบบ | ตัวอย่าง |
|--------|--------|----------|
| Credit Note | CN-YYYYMMDD-#### | CN-20260319-0001 |
| Goods Receipt | GR-YYYYMMDD-#### | GR-20260319-0001 |
| Payment Voucher | PV-YYYYMMDD-#### | PV-20260319-0001 |
| **Warranty** | **WT-TH-YYYYMMDD-####** | **WT-TH-20260319-0001** |
| Purchase Request | PR-YYYYMMDD-#### | PR-20260319-0001 |
| Supplier Invoice | SI-YYYYMMDD-#### | SI-20260319-0001 |
| Stock Card | SC-YYYYMMDD-#### | SC-20260319-0001 |
| Stock Transfer | ST-YYYYMMDD-#### | ST-20260319-0001 |
| Stock Adjustment | SA-YYYYMMDD-#### | SA-20260319-0001 |
| Expense Bill | EB-YYYYMMDD-#### | EB-20260319-0001 |
| Production Order | PDO-YYYYMMDD-#### | PDO-20260319-0001 |

---

## 🔄 การรีเซ็ตตัวเลข

เลขเอกสารจะรีเซ็ตกลับไปเป็น 0001 **ทุกวัน** เวลาเที่ยงคืน

### ตัวอย่าง

**วันที่ 19 มีนาคม 2026:**
```
CN-20260319-0001
CN-20260319-0002
CN-20260319-0003
...
CN-20260319-0150
```

**วันที่ 20 มีนาคม 2026 (รีเซ็ต):**
```
CN-20260320-0001  ← เริ่มนับใหม่
CN-20260320-0002
CN-20260320-0003
...
```

---

## 🗄️ ฐานข้อมูล

### ตาราง: `document_counters`

```sql
CREATE TABLE document_counters (
  prefix varchar(10) NOT NULL,
  year_month varchar(8) NOT NULL,  -- เก็บ YYYYMMDD (8 ตัวอักษร)
  counter int NOT NULL DEFAULT 0,
  updated_at timestamp,
  PRIMARY KEY (prefix, year_month)
);
```

### ตัวอย่างข้อมูล

| prefix | year_month | counter | updated_at |
|--------|------------|---------|------------|
| CN | 20260319 | 150 | 2026-03-19 16:45:23 |
| GR | 20260319 | 45 | 2026-03-19 14:20:10 |
| WT | 20260319 | 12 | 2026-03-19 15:30:05 |
| CN | 20260320 | 3 | 2026-03-20 08:15:00 |

---

## ⚙️ การทำงาน

### 1. สร้างเลขเอกสารใหม่

```typescript
// lib/document-number.ts
const yearMonthDay = '20260319'  // YYYYMMDD
const prefix = 'CN'

// INSERT ... ON DUPLICATE KEY UPDATE (atomic operation)
INSERT INTO document_counters (prefix, year_month, counter)
VALUES ('CN', '20260319', 1)
ON DUPLICATE KEY UPDATE counter = counter + 1

// Get new counter
SELECT counter FROM document_counters
WHERE prefix = 'CN' AND year_month = '20260319'
// Result: 151

// Generate document number
const docNo = `CN-20260319-0151`
```

### 2. Thread-Safe

ระบบใช้ Transaction และ `ON DUPLICATE KEY UPDATE` เพื่อป้องกันการซ้ำซ้อน:

- ✅ Multi-user safe
- ✅ Concurrent request safe
- ✅ No duplicate numbers
- ✅ Atomic operation

---

## 📊 ข้อดีของ Daily Reset

### ข้อดี
- ✅ เลขเอกสารสั้นกว่า (4 หลัก max 9,999/วัน)
- ✅ ง่ายต่อการจัดกลุ่มตามวัน
- ✅ เห็นปริมาณงานแต่ละวันชัดเจน
- ✅ Performance ดีกว่า (partition by date)

### ข้อควรระวัง
- ⚠️ เลขเอกสารจะซ้ำกันในคนละวัน (CN-20260319-0001 vs CN-20260320-0001)
- ⚠️ ต้องใช้เลขเอกสาร + วันที่ในการค้นหา
- ⚠️ ถ้าเอกสารเกิน 9,999 ต่อวัน จะเกิน 4 หลัก

---

## 🔧 Migration Script

### ขยาย year_month column

```bash
mysql -u ksystem -pKsave2025Admin ksystem < \
  database_schemas/alter_document_counters_extend_year_month.sql
```

### ตรวจสอบ

```bash
node test-warranty-number.js
```

---

## 📝 Notes

1. **Warranty มี TH**: เพื่อระบุว่าเป็นของประเทศไทย
2. **varchar(8)**: เพียงพอสำหรับ YYYYMMDD (20260319)
3. **Daily Reset**: เริ่มนับใหม่ทุกวัน เวลา 00:00:00
4. **Max per day**: 9,999 เอกสาร/วัน (0001-9999)

---

## ⚡ Performance

### Index Efficiency

```sql
PRIMARY KEY (prefix, year_month)
```

- ✅ Fast lookup: O(log n)
- ✅ Atomic increment
- ✅ Auto partitioning by date

### Query Performance

```sql
-- Fast (uses index)
SELECT * FROM credit_notes WHERE cnNo = 'CN-20260319-0001'

-- Fast (uses index + date)
SELECT * FROM credit_notes
WHERE cnDate = '2026-03-19' AND cnNo LIKE 'CN-20260319-%'
```

---

## 🧪 Testing

```bash
# Test document number generation
node test-warranty-number.js

# Expected output:
# WT-TH-20260319-0001 ✅
# CN-20260319-0001 ✅
# GR-20260319-0001 ✅
```
