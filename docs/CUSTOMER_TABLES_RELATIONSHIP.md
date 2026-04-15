# ความสัมพันธ์ระหว่างตาราง cus_detail และ acc_customers

## 📊 โครงสร้างความสัมพันธ์

```
┌─────────────────────────┐              ┌──────────────────────────┐
│     cus_detail          │              │    acc_customers         │
│  (ติดต่อ/สอบถาม/Lead)   │              │  (ลูกค้าระบบบัญชี)        │
├─────────────────────────┤              ├──────────────────────────┤
│ cusID (PK)              │              │ id (PK)                  │
│ acc_customer_id (FK) ───┼─────────────>│ code (UNIQUE)            │
│ siteID                  │              │ name_th                  │
│ fullname                │              │ name_en                  │
│ email                   │              │ tax_id                   │
│ phone                   │              │ contact_name             │
│ company                 │              │ phone                    │
│ address                 │              │ email                    │
│ house_number            │              │ address                  │
│ moo                     │              │ credit_days              │
│ tambon                  │              │ credit_limit             │
│ amphoe                  │              │ is_active                │
│ province                │              │ created_at               │
│ postcode                │              │ updated_at               │
│ tax_id                  │              └──────────────────────────┘
│ message                 │
│ created_by              │
│ created_at              │
└─────────────────────────┘
```

---

## 🔗 Foreign Key Details

**Constraint Name:** `fk_cus_detail_acc_customer`

**Relationship:**
- `cus_detail.acc_customer_id` → `acc_customers.id`
- **ON DELETE:** SET NULL (ถ้าลบลูกค้าในบัญชี, link จะเป็น NULL)
- **ON UPDATE:** CASCADE (ถ้า id เปลี่ยน, FK จะอัพเดตตาม)

---

## 📝 วัตถุประสงค์

### **cus_detail (ตารางติดต่อ/Lead)**
- เก็บข้อมูลผู้ติดต่อสอบถาม
- ลูกค้าที่สนใจสินค้า/บริการ
- Form ติดต่อจากเว็บไซต์
- ลูกค้าที่ยังไม่ได้เป็นลูกค้าจริง

**หน้าที่ใช้:**
- `/Thailand/Admin-Login/customers`
- `/Thailand/Admin-Login/customer-add`
- API: `/api/customers`

---

### **acc_customers (ตารางลูกค้าระบบบัญชี)**
- ลูกค้าที่เป็นทางการในระบบบัญชี
- มีรหัสลูกค้า (CUS-0001)
- กำหนดวงเงินเครดิต
- กำหนดเครดิตเทอม
- ใช้ในการออกใบกำกับภาษี/ใบเสร็จ

**หน้าที่ใช้:**
- `/Thailand/Accounting-Login/sales/customers`
- `/Thailand/Accounting-Login/sales/*` (order, cash, credit, return)
- API: `/api/accounting/customers`

---

## 🔄 Use Cases

### **1. Lead → Customer Conversion**

เมื่อผู้สอบถาม (Lead) กลายเป็นลูกค้าจริง:

```sql
-- 1. สร้างลูกค้าใหม่ในระบบบัญชี
INSERT INTO acc_customers (code, name_th, tax_id, phone, email, address)
SELECT
  CONCAT('CUS-', LPAD((SELECT COUNT(*)+1 FROM acc_customers), 4, '0')),
  fullname,
  tax_id,
  phone,
  email,
  address
FROM cus_detail
WHERE cusID = 13;

-- 2. Link contact กับลูกค้าที่สร้างใหม่
UPDATE cus_detail
SET acc_customer_id = LAST_INSERT_ID()
WHERE cusID = 13;
```

---

### **2. ค้นหาลูกค้าพร้อมข้อมูล Contact**

```sql
SELECT
  cd.cusID,
  cd.fullname as contact_name,
  cd.email as contact_email,
  ac.code as customer_code,
  ac.name_th as customer_name,
  ac.credit_limit,
  ac.credit_days
FROM cus_detail cd
LEFT JOIN acc_customers ac ON cd.acc_customer_id = ac.id
WHERE cd.acc_customer_id IS NOT NULL;
```

---

### **3. ดูประวัติการติดต่อของลูกค้า**

```sql
SELECT
  ac.code,
  ac.name_th,
  COUNT(cd.cusID) as total_inquiries,
  GROUP_CONCAT(cd.message SEPARATOR '; ') as inquiry_history
FROM acc_customers ac
LEFT JOIN cus_detail cd ON cd.acc_customer_id = ac.id
GROUP BY ac.id
ORDER BY total_inquiries DESC;
```

---

## 🎯 Benefits

1. ✅ **ไม่มีข้อมูลซ้ำ** - Lead และ Customer อยู่คนละตาราง
2. ✅ **ติดตามประวัติ** - ดูประวัติการติดต่อทั้งหมดของลูกค้า
3. ✅ **แปลง Lead → Customer** - เชื่อมโยงข้อมูลได้ง่าย
4. ✅ **Data Integrity** - Foreign Key รับประกันความถูกต้อง
5. ✅ **Flexible** - สามารถมีหลาย contact ต่อ 1 customer ได้

---

## 📋 Migration Status

✅ **Completed:** 2026-03-24

**Changes:**
1. ✅ Added `acc_customer_id` column to `cus_detail`
2. ✅ Created index `idx_acc_customer_id`
3. ✅ Created FK constraint `fk_cus_detail_acc_customer`
4. ✅ Tested relationship

**Current Statistics:**
- Total contacts: 4
- Linked to accounting: 0
- Not linked: 4

---

## 🔧 Next Steps

### **Option 1: Auto-link existing customers**

ถ้าต้องการเชื่อมข้อมูลเดิมโดยอัตโนมัติ (ตรงกัน email หรือ phone):

```sql
UPDATE cus_detail cd
INNER JOIN acc_customers ac ON (
    cd.email = ac.email OR
    cd.phone = ac.phone
)
SET cd.acc_customer_id = ac.id
WHERE cd.acc_customer_id IS NULL;
```

### **Option 2: Manual linking via UI**

เพิ่มปุ่ม "เปลี่ยนเป็นลูกค้า" ในหน้า customer list:
- สร้าง `acc_customer` ใหม่จากข้อมูล `cus_detail`
- อัพเดต `acc_customer_id` เพื่อเชื่อมโยง
- แสดงสถานะว่า contact นี้เป็นลูกค้าแล้ว

---

**Created:** 2026-03-24
**Last Updated:** 2026-03-24
