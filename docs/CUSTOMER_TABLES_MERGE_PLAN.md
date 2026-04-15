# แผนการรวมตาราง cus_detail + acc_customers

## 🎯 เป้าหมาย

รวม 2 ตารางลูกค้าเป็นตารางเดียว เพื่อ:
- ✅ จัดการข้อมูลง่ายขึ้น (1 ตาราง)
- ✅ ไม่ต้องมี FK ซับซ้อน
- ✅ API เดียว ใช้ทั้งระบบ
- ✅ ไม่มีข้อมูลซ้ำซ้อน

---

## 📊 ตารางปัจจุบัน

### **cus_detail (ตารางติดต่อ/Lead)**
```
จำนวน: 5 records
ใช้ที่: /Thailand/Admin-Login/customers
API: /api/customers

Fields:
- cusID, siteID, fullname, email, phone, company
- address, house_number, moo, tambon, amphoe, province, postcode
- tax_id, message
- created_by, created_by_user_id, created_at
- acc_customer_id (FK → acc_customers)
```

### **acc_customers (ตารางบัญชี)**
```
จำนวน: ? records
ใช้ที่: /Thailand/Accounting-Login/sales/customers
API: /api/accounting/customers

Fields:
- id, code (CUS-0001), name_th, name_en, tax_id
- contact_name, phone, email, address
- credit_days, credit_limit, is_active
- created_at, updated_at
```

---

## 🔄 กลยุทธ์การรวม

### **เลือก: ขยาย acc_customers และย้ายข้อมูลจาก cus_detail**

**เหตุผล:**
1. ✅ `acc_customers` มีโครงสร้างที่ครบถ้วนกว่า (code, credit_limit, is_active)
2. ✅ ระบบบัญชีเป็นแกนหลัก
3. ✅ มี name_th, name_en (รองรับหลายภาษา)
4. ✅ มี updated_at (track การแก้ไข)

---

## 📋 ขั้นตอนการ Migrate

### **STEP 1: Backup** ✅
```sql
CREATE TABLE cus_detail_backup AS SELECT * FROM cus_detail;
CREATE TABLE acc_customers_backup AS SELECT * FROM acc_customers;
```

### **STEP 2: เพิ่มคอลัมน์ใหม่** ✅
เพิ่มฟิลด์จาก `cus_detail` ที่ยังไม่มีใน `acc_customers`:
```sql
ALTER TABLE acc_customers ADD COLUMN:
- siteID (FK → site)
- house_number, moo, tambon, amphoe, province, postcode
- message
- created_by, created_by_user_id
- old_cusID (เก็บ cusID เดิม)
```

### **STEP 3: Migrate ข้อมูล** ✅

**3.1 ย้าย records ที่ไม่มีใน acc_customers:**
```sql
INSERT INTO acc_customers
SELECT * FROM cus_detail
WHERE acc_customer_id IS NULL;
```

**3.2 อัพเดต records ที่มีอยู่แล้ว:**
```sql
UPDATE acc_customers ac
INNER JOIN cus_detail cd ON cd.acc_customer_id = ac.id
SET ac.house_number = cd.house_number, ...
```

### **STEP 4: Verify** ✅
```sql
SELECT COUNT(*) FROM acc_customers;
SELECT COUNT(*) FROM cus_detail;
-- ตรวจสอบว่าข้อมูลครบ
```

### **STEP 5: Archive cus_detail** ⏳
```sql
RENAME TABLE cus_detail TO cus_detail_archived;
```

---

## 🗺️ Field Mapping

| cus_detail | → | acc_customers | หมายเหตุ |
|------------|---|---------------|----------|
| cusID | → | old_cusID | เก็บไว้อ้างอิง |
| - | → | id | PK ใหม่ |
| - | → | code | Auto-gen: CUS-0001 |
| fullname | → | name_th | ชื่อภาษาไทย |
| - | → | name_en | ชื่อภาษาอังกฤษ (NULL) |
| siteID | → | siteID | Copy |
| email | → | email | Copy |
| phone | → | phone | Copy |
| company | → | contact_name | บริษัท → ชื่อผู้ติดต่อ |
| tax_id | → | tax_id | Copy |
| address | → | address | ที่อยู่รวม |
| house_number | → | house_number | เลขที่ |
| moo | → | moo | หมู่ |
| tambon | → | tambon | ตำบล |
| amphoe | → | amphoe | อำเภอ |
| province | → | province | จังหวัด |
| postcode | → | postcode | รหัสไปรษณีย์ |
| message | → | message | ข้อความ |
| created_by | → | created_by | ผู้สร้าง (text) |
| created_by_user_id | → | created_by_user_id | ผู้สร้าง (FK) |
| created_at | → | created_at | วันที่สร้าง |
| - | → | credit_days | 30 (default) |
| - | → | credit_limit | 0.00 (default) |
| - | → | is_active | 1 (default) |
| - | → | updated_at | AUTO |

---

## 🔧 Changes Required

### **1. Database** ✅
- Run migration SQL
- Create VIEW `cus_detail` for backward compatibility (optional)

### **2. APIs**
- ✅ `/api/customers` → ใช้ `acc_customers`
- ✅ `/api/accounting/customers` → ไม่ต้องเปลี่ยน
- Merge เป็น API เดียว หรือให้ทั้ง 2 ใช้ตารางเดียวกัน

### **3. Pages**
- `/Thailand/Admin-Login/customers` → ใช้ `acc_customers`
- `/Thailand/Admin-Login/customer-add` → ใช้ `acc_customers`
- `/Thailand/Accounting-Login/sales/customers` → ไม่ต้องเปลี่ยน

### **4. Foreign Keys**
อัพเดต FK ที่ชี้ไป `cus_detail`:
- `cus_detail.acc_customer_id` → ไม่มีแล้ว (ตารางเดียว)
- ตารางอื่นๆ ที่ชี้มา → ต้องตรวจสอบและอัพเดต

---

## ⚠️ Risks & Mitigation

| ความเสี่ยง | วิธีป้องกัน |
|-----------|-------------|
| ข้อมูลหาย | ✅ Backup ก่อน migrate |
| FK broken | ✅ ตรวจสอบ FK ทั้งหมดก่อน |
| API error | ✅ ทดสอบ API หลัง migrate |
| Rollback | ✅ เก็บ backup ไว้ 2 สัปดาห์ |

---

## 📈 Benefits

### **ก่อนรวม:**
```
cus_detail (5)        acc_customers (?)
├─ General contacts   ├─ Accounting customers
├─ API 1              ├─ API 2
├─ Pages 2            ├─ Pages 5+
└─ FK ซับซ้อน         └─ Credit management
```

### **หลังรวม:**
```
acc_customers (5+?)
├─ ✅ Unified customer data
├─ ✅ One API for all
├─ ✅ Simple structure
├─ ✅ Full accounting features
└─ ✅ Full address fields
```

---

## ✅ Checklist

**Before Migration:**
- [ ] Review current data
- [ ] Identify all FK dependencies
- [ ] Backup both tables
- [ ] Test migration on dev/staging

**During Migration:**
- [ ] Run backup
- [ ] Add columns to acc_customers
- [ ] Migrate data
- [ ] Verify counts
- [ ] Test queries

**After Migration:**
- [ ] Update `/api/customers` to use acc_customers
- [ ] Update customer pages
- [ ] Test all customer-related features
- [ ] Monitor for 1 week
- [ ] Archive cus_detail

**Cleanup (after 2 weeks):**
- [ ] Drop cus_detail
- [ ] Drop backup tables
- [ ] Update documentation

---

## 🚀 Ready to Migrate?

**Migration SQL:** `database_schemas/merge_customers_tables.sql`

**รันด้วยคำสั่ง:**
```bash
mysql -u ksystem -p'Ksave2025Admin' ksystem < database_schemas/merge_customers_tables.sql
```

---

**Created:** 2026-03-24
**Status:** 📝 Plan ready, waiting for approval
**Estimated time:** 10-15 minutes
**Downtime:** None (if using transactions)
