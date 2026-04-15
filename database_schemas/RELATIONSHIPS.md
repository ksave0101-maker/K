# ความสัมพันธ์ฐานข้อมูล (Database Relationships)

## 📊 Foreign Key Relationships

### 1. Items Tables → Main Document Tables (CASCADE DELETE)

#### Credit Notes
```
credit_note_items.credit_note_id → credit_notes.id
- ON DELETE CASCADE (ลบใบลดหนี้ → ลบรายการทั้งหมด)
```

#### Goods Receipts
```
goods_receipt_items.goods_receipt_id → goods_receipts.id
- ON DELETE CASCADE (ลบใบรับสินค้า → ลบรายการทั้งหมด)
```

#### Payment Vouchers
```
payment_voucher_items.payment_voucher_id → payment_vouchers.id
- ON DELETE CASCADE (ลบใบชำระเงิน → ลบรายการทั้งหมด)
```

#### Purchase Requests
```
purchase_request_items.purchase_request_id → purchase_requests.id
- ON DELETE CASCADE (ลบใบขอซื้อ → ลบรายการทั้งหมด)
```

#### Supplier Invoices
```
supplier_invoice_items.supplier_invoice_id → supplier_invoices.id
- ON DELETE CASCADE (ลบใบแจ้งหนี้ → ลบรายการทั้งหมด)
```

#### Stock Transfers
```
stock_transfer_items.stock_transfer_id → stock_transfers.id
- ON DELETE CASCADE (ลบใบโอนสินค้า → ลบรายการทั้งหมด)
```

#### Stock Adjustments
```
stock_adjustment_items.stock_adjustment_id → stock_adjustments.id
- ON DELETE CASCADE (ลบใบปรับสต๊อค → ลบรายการทั้งหมด)
```

#### Expense Bills
```
expense_bill_items.expense_bill_id → expense_bills.id
- ON DELETE CASCADE (ลบบิลค่าใช้จ่าย → ลบรายการทั้งหมด)
```

#### Production Orders
```
production_order_materials.production_order_id → production_orders.id
- ON DELETE CASCADE (ลบใบสั่งผลิต → ลบวัตถุดิบทั้งหมด)

production_order_steps.production_order_id → production_orders.id
- ON DELETE CASCADE (ลบใบสั่งผลิต → ลบขั้นตอนทั้งหมด)
```

---

### 2. Cross-Document References (SET NULL ON DELETE)

#### Warranties → Contracts
```
warranties.contract_no → contracts.contractNo
- ON DELETE SET NULL (ลบสัญญา → ใบรับประกันยังอยู่ แต่ contract_no = NULL)
- ON UPDATE CASCADE (แก้เลขสัญญา → อัปเดตอัตโนมัติในใบรับประกัน)
```

#### Goods Receipts → Purchase Orders
```
goods_receipts.po_ref → purchase_orders.orderNo
- ON DELETE SET NULL (ลบใบสั่งซื้อ → ใบรับสินค้ายังอยู่ แต่ po_ref = NULL)
- ON UPDATE CASCADE (แก้เลขที่ PO → อัปเดตอัตโนมัติในใบรับสินค้า)
```

#### Supplier Invoices → Purchase Orders
```
supplier_invoices.po_ref → purchase_orders.orderNo
- ON DELETE SET NULL (ลบใบสั่งซื้อ → ใบแจ้งหนี้ยังอยู่ แต่ po_ref = NULL)
- ON UPDATE CASCADE (แก้เลขที่ PO → อัปเดตอัตโนมัติในใบแจ้งหนี้)
```

---

## 🔑 Unique Constraints (สำหรับการอ้างอิง)

### Document Numbers
- `contracts.contractNo` - UNIQUE
- `purchase_orders.orderNo` - UNIQUE
- `credit_notes.cnNo` - UNIQUE
- `goods_receipts.grNo` - UNIQUE
- `payment_vouchers.pvNo` - UNIQUE
- `warranties.wtNo` - UNIQUE
- `purchase_requests.prNo` - UNIQUE
- `supplier_invoices.siNo` - UNIQUE
- `stock_cards.scNo` - UNIQUE
- `stock_transfers.stNo` - UNIQUE
- `stock_adjustments.saNo` - UNIQUE
- `expense_bills.ebNo` - UNIQUE
- `production_orders.poNo` - UNIQUE

---

## 📈 Relationship Diagram

```
┌─────────────────────┐
│   contracts         │
│  ─────────────────  │
│  contractNo (UK)    │◄──────┐
└─────────────────────┘       │ FK (SET NULL)
                               │
┌─────────────────────┐       │
│   warranties        │       │
│  ─────────────────  │       │
│  contract_no        │───────┘
└─────────────────────┘


┌─────────────────────┐
│  purchase_orders    │
│  ─────────────────  │
│  orderNo (UK)       │◄──────┬──────┐
└─────────────────────┘       │      │ FK (SET NULL)
                               │      │
┌─────────────────────┐       │      │
│  goods_receipts     │       │      │
│  ─────────────────  │       │      │
│  po_ref             │───────┘      │
│  ───────────────────│              │
│  id (PK)            │◄──────┐      │
└─────────────────────┘       │      │
                               │      │
┌─────────────────────┐       │      │
│ goods_receipt_items │       │      │
│  ─────────────────  │       │      │
│  goods_receipt_id   │───────┘      │
└─────────────────────┘              │
        (CASCADE)                     │
                                      │
┌─────────────────────┐              │
│ supplier_invoices   │              │
│  ─────────────────  │              │
│  po_ref             │──────────────┘
│  ───────────────────│
│  id (PK)            │◄──────┐
└─────────────────────┘       │
                               │
┌─────────────────────┐       │
│supplier_invoice_items│      │
│  ─────────────────  │       │
│  supplier_invoice_id│───────┘
└─────────────────────┘
        (CASCADE)


┌─────────────────────┐
│  credit_notes       │
│  ─────────────────  │
│  id (PK)            │◄──────┐
└─────────────────────┘       │
                               │
┌─────────────────────┐       │
│ credit_note_items   │       │
│  ─────────────────  │       │
│  credit_note_id     │───────┘
└─────────────────────┘
        (CASCADE)


┌─────────────────────┐
│  payment_vouchers   │
│  ─────────────────  │
│  id (PK)            │◄──────┐
└─────────────────────┘       │
                               │
┌─────────────────────┐       │
│payment_voucher_items│       │
│  ─────────────────  │       │
│  payment_voucher_id │───────┘
└─────────────────────┘
        (CASCADE)


┌─────────────────────┐
│ purchase_requests   │
│  ─────────────────  │
│  id (PK)            │◄──────┐
└─────────────────────┘       │
                               │
┌─────────────────────┐       │
│purchase_request_items│      │
│  ─────────────────  │       │
│  purchase_request_id│───────┘
└─────────────────────┘
        (CASCADE)


┌─────────────────────┐
│  stock_transfers    │
│  ─────────────────  │
│  id (PK)            │◄──────┐
└─────────────────────┘       │
                               │
┌─────────────────────┐       │
│ stock_transfer_items│       │
│  ─────────────────  │       │
│  stock_transfer_id  │───────┘
└─────────────────────┘
        (CASCADE)


┌─────────────────────┐
│ stock_adjustments   │
│  ─────────────────  │
│  id (PK)            │◄──────┐
└─────────────────────┘       │
                               │
┌─────────────────────┐       │
│stock_adjustment_items│      │
│  ─────────────────  │       │
│  stock_adjustment_id│───────┘
└─────────────────────┘
        (CASCADE)


┌─────────────────────┐
│  expense_bills      │
│  ─────────────────  │
│  id (PK)            │◄──────┐
└─────────────────────┘       │
                               │
┌─────────────────────┐       │
│ expense_bill_items  │       │
│  ─────────────────  │       │
│  expense_bill_id    │───────┘
└─────────────────────┘
        (CASCADE)


┌─────────────────────┐
│ production_orders   │
│  ─────────────────  │
│  id (PK)            │◄──────┬──────┐
└─────────────────────┘       │      │
                               │      │
┌─────────────────────┐       │      │
│production_order_    │       │      │
│     materials       │       │      │
│  ─────────────────  │       │      │
│  production_order_id│───────┘      │
└─────────────────────┘              │
        (CASCADE)                     │
                                      │
┌─────────────────────┐              │
│production_order_    │              │
│     steps           │              │
│  ─────────────────  │              │
│  production_order_id│──────────────┘
└─────────────────────┘
        (CASCADE)
```

---

## ⚠️ Important Notes

### DELETE Behaviors

**CASCADE**: ลบ parent record → ลบ child records ทั้งหมดอัตโนมัติ
- ใช้กับ items tables (ลบเอกสารหลัก → ลบรายการสินค้าทั้งหมด)
- ปลอดภัยเพราะ items ไม่มีความหมายโดยไม่มี parent

**SET NULL**: ลบ parent record → child records ยังอยู่ แต่ FK column = NULL
- ใช้กับ cross-document references (ลบสัญญา → ใบรับประกันยังอยู่)
- ปลอดภัยเพราะเอกสารมีความหมายแม้ไม่อ้างอิง parent

### Data Integrity

1. **ห้ามลบ contracts ที่มี warranties อ้างอิง** (ถ้าต้องการ RESTRICT behavior)
2. **ห้ามลบ purchase_orders ที่มี goods_receipts หรือ supplier_invoices อ้างอิง**
3. การ UPDATE document numbers จะ CASCADE อัตโนมัติ

### Index Coverage

ทุก FK columns มี INDEX อัตโนมัติเพื่อ performance:
- JOIN operations เร็ว
- CASCADE delete เร็ว
- Referential integrity check เร็ว

---

## 🔧 Maintenance Commands

### ดู FK ทั้งหมด
```sql
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'ksystem'
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
```

### ลบ FK (ถ้าจำเป็น)
```sql
ALTER TABLE table_name DROP FOREIGN KEY constraint_name;
```

### เพิ่ม FK
```sql
ALTER TABLE child_table
ADD CONSTRAINT fk_name
FOREIGN KEY (child_column)
REFERENCES parent_table(parent_column)
ON DELETE CASCADE|SET NULL|RESTRICT
ON UPDATE CASCADE|RESTRICT;
```
