# 📋 Document Management System - Database Setup Guide

## ระบบจัดการเอกสาร - คู่มือการติดตั้งฐานข้อมูล

---

## 🗂️ ระบบเอกสารทั้งหมด (12 ประเภท)

### 1️⃣ การจัดซื้อ (Purchase & Procurement)
- **PR** - Purchase Request (ใบขอซื้อ)
- **SI** - Supplier Invoice (ใบแจ้งหนี้ผู้ขาย)
- **GR** - Goods Receipt (ใบรับสินค้า)

### 2️⃣ คลังสินค้า (Inventory & Warehouse)
- **SC** - Stock Card (การ์ดสินค้า)
- **ST** - Stock Transfer (ใบโอนสินค้า)
- **SA** - Stock Adjustment (ใบปรับสต๊อค)

### 3️⃣ การเงิน (Finance & Payments)
- **PV** - Payment Voucher (ใบชำระเงิน)
- **CN** - Credit Note (ใบลดหนี้)
- **EB** - Expense Bill (บิลค่าใช้จ่าย)

### 4️⃣ การผลิต (Production)
- **PDO** - Production Order (ใบสั่งผลิต)

### 5️⃣ บริการหลังการขาย (After Sales)
- **WT** - Warranty (ใบรับประกัน)

### 6️⃣ ทรัพยากรบุคคล (Human Resources)
- **VLR** - Vacation Leave Request (คำขออนุมัติลาพักร้อน)

---

## 📊 โครงสร้างฐานข้อมูล

ระบบนี้ใช้ **24 ตาราง**:
- 1 ตาราง `document_counters` - สำหรับจัดการเลขที่เอกสาร
- 12 ตารางหลัก - เอกสารแต่ละประเภท
- 11 ตารางรายละเอียด - items/materials/steps

---

## 🚀 วิธีการติดตั้ง

### วิธีที่ 1: ติดตั้งทั้งหมดในคำสั่งเดียว (แนะนำ)

```bash
# เข้าสู่ MySQL
mysql -u root -p k-system

# รันไฟล์ setup
source /home/ksystem/K/database_schemas/setup_all_documents.sql
```

### วิธีที่ 2: ใช้ MySQL Workbench / phpMyAdmin

1. เปิด MySQL Workbench หรือ phpMyAdmin
2. เลือกฐานข้อมูล `k-system`
3. เปิดไฟล์ `setup_all_documents.sql`
4. กดปุ่ม Execute/Run

### วิธีที่ 3: ติดตั้งทีละตาราง

```bash
mysql -u root -p k-system < /home/ksystem/K/database_schemas/create_document_counters.sql
mysql -u root -p k-system < /home/ksystem/K/database_schemas/create_credit_notes.sql
mysql -u root -p k-system < /home/ksystem/K/database_schemas/create_goods_receipts.sql
# ... (ทำต่อสำหรับแต่ละไฟล์)
```

---

## ✅ ตรวจสอบการติดตั้ง

### รันคำสั่งตรวจสอบ:

```bash
mysql -u root -p k-system < /home/ksystem/K/database_schemas/verify_setup.sql
```

### ผลลัพธ์ที่ควรเห็น:

```
table_name                    record_count    status
---------------------------------------------------
document_counters             0               ✅ EXISTS
credit_notes                  0               ✅ EXISTS
credit_note_items             0               ✅ EXISTS
goods_receipts                0               ✅ EXISTS
...
total_tables: 24
```

---

## 🔧 การตั้งค่า Database Connection

ตรวจสอบไฟล์ `/home/ksystem/K/lib/db.ts`:

```typescript
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'k-system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export default pool
```

---

## 📝 ตัวอย่างการใช้งาน

### สร้างเอกสารใหม่:

1. ไปที่ `/Thailand/Admin-Login/documents`
2. เลือกหมวดหมู่เอกสาร
3. คลิกเอกสารที่ต้องการสร้าง
4. คลิกปุ่ม "สร้างใหม่" (Create New)
5. กรอกข้อมูล
6. คลิกบันทึก

### รูปแบบเลขที่เอกสาร:

```
PREFIX-YYYYMM-####

ตัวอย่าง:
CN-202603-0001  (Credit Note เดือนมีนาคม 2026 เลขที่ 1)
PR-202603-0025  (Purchase Request เดือนมีนาคม 2026 เลขที่ 25)
PDO-202604-0100 (Production Order เดือนเมษายน 2026 เลขที่ 100)
```

---

## 🔐 สิทธิ์การเข้าถึง (Permissions)

ตรวจสอบว่า MySQL user มีสิทธิ์:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON `k-system`.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📦 การ Backup ข้อมูล

### Backup ทั้งระบบเอกสาร:

```bash
mysqldump -u root -p k-system \
  document_counters \
  credit_notes credit_note_items \
  goods_receipts goods_receipt_items \
  payment_vouchers payment_voucher_items \
  warranties \
  purchase_requests purchase_request_items \
  supplier_invoices supplier_invoice_items \
  stock_cards \
  stock_transfers stock_transfer_items \
  stock_adjustments stock_adjustment_items \
  expense_bills expense_bill_items \
  production_orders production_order_materials production_order_steps \
  > documents_backup_$(date +%Y%m%d).sql
```

### Restore จาก Backup:

```bash
mysql -u root -p k-system < documents_backup_20260319.sql
```

---

## 🐛 Troubleshooting

### ตารางมีอยู่แล้ว (Table already exists)

```sql
-- ลบตารางเดิมทิ้ง (ระวัง! จะลบข้อมูลด้วย)
DROP TABLE IF EXISTS credit_note_items;
DROP TABLE IF EXISTS credit_notes;
-- ... (ทำต่อสำหรับตารางอื่นๆ)

-- จากนั้นรัน setup_all_documents.sql ใหม่
```

### Foreign Key Constraint Error

ลบตารางในลำดับที่ถูกต้อง (ตาราง items ก่อน จากนั้นตารางหลัก):

```sql
-- ตาราง items/details ก่อน
DROP TABLE IF EXISTS credit_note_items;
DROP TABLE IF EXISTS production_order_steps;
DROP TABLE IF EXISTS production_order_materials;

-- ตารางหลัก
DROP TABLE IF EXISTS credit_notes;
DROP TABLE IF EXISTS production_orders;
```

### Connection Error

ตรวจสอบ `.env.local`:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=k-system
```

---

## 📞 API Endpoints ที่เชื่อมต่อ

ทุกเอกสารมี API endpoints:

```
GET    /api/[document-type]          - List all
GET    /api/[document-type]?id=123   - Get one
POST   /api/[document-type]          - Create
PUT    /api/[document-type]          - Update
DELETE /api/[document-type]?id=123   - Delete
```

ตัวอย่าง:
```
/api/credit-notes
/api/purchase-requests
/api/production-orders
```

---

## 🎯 สถานะการพัฒนา

✅ **เสร็จสมบูรณ์:**
- [x] Database schemas (23 ตาราง)
- [x] API routes (11 ประเภท)
- [x] List pages (11 หน้า)
- [x] Create forms (11 หน้า)
- [x] Document numbering system
- [x] Bilingual support (TH/EN)
- [x] Categorized navigation

🚧 **อยู่ระหว่างพัฒนา:**
- [ ] Edit forms
- [ ] Delete confirmation
- [ ] Print/Export PDF
- [ ] Advanced search & filters
- [ ] Document approval workflow

---

## 📚 เอกสารอ้างอิง

- Database Schemas: `/database_schemas/`
- API Routes: `/app/api/`
- UI Components: `/app/Thailand/Admin-Login/documents/`
- Shared Components: `/app/Thailand/Admin-Login/shared/`

---

## 🔄 การอัพเดทระบบ

หากมีการเปลี่ยนแปลง schema ในอนาคต:

1. สร้างไฟล์ migration ใหม่ เช่น `alter_add_field_YYYYMMDD.sql`
2. รันคำสั่ง ALTER TABLE
3. อัพเดท TypeScript types
4. อัพเดท API routes
5. อัพเดท UI forms

---

✨ **พร้อมใช้งาน!** ระบบจัดการเอกสารครบวงจร 11 ประเภท 🚀
