-- Add missing fields to acc_purchase_orders table for credit purchase (ซื้อเงินเชื่อ)
-- Created: 2026-03-24 / Updated: 2026-03-25

-- Add due_date field (วันครบกำหนดชำระ)
ALTER TABLE acc_purchase_orders
ADD COLUMN IF NOT EXISTS due_date DATE NULL COMMENT 'วันครบกำหนดชำระ'
AFTER doc_date;

-- Add tax_invoice_date field
ALTER TABLE acc_purchase_orders
ADD COLUMN IF NOT EXISTS tax_invoice_date DATE NULL COMMENT 'วันที่ในใบกำกับภาษี'
AFTER doc_date;

-- Add payment_type field
ALTER TABLE acc_purchase_orders
ADD COLUMN IF NOT EXISTS payment_type ENUM('cash','credit') DEFAULT NULL COMMENT 'ประเภทการชำระเงิน'
AFTER supplier_id;

-- Add price_exempt field (ราคาสินค้ายกเว้นภาษี)
ALTER TABLE acc_purchase_orders
ADD COLUMN IF NOT EXISTS price_exempt DECIMAL(15,2) DEFAULT 0 COMMENT 'ราคาสินค้ายกเว้นภาษี'
AFTER note;

-- Add price_before_vat field (ราคาสินค้าก่อนมูลค่าภาษี)
ALTER TABLE acc_purchase_orders
ADD COLUMN IF NOT EXISTS price_before_vat DECIMAL(15,2) DEFAULT 0 COMMENT 'ราคาสินค้าก่อนมูลค่าภาษี'
AFTER price_exempt;

-- Add wht_rate field (อัตราหัก ณ ที่จ่าย %)
ALTER TABLE acc_purchase_orders
ADD COLUMN IF NOT EXISTS wht_rate DECIMAL(5,2) DEFAULT 0 COMMENT 'อัตราหัก ณ ที่จ่าย (%)'
AFTER price_before_vat;

-- Add wht_amount field (หัก ณ ที่จ่าย)
ALTER TABLE acc_purchase_orders
ADD COLUMN IF NOT EXISTS wht_amount DECIMAL(15,2) DEFAULT 0 COMMENT 'หัก ณ ที่จ่าย (บาท)'
AFTER wht_rate;

-- Add branch_code field for suppliers
ALTER TABLE acc_suppliers
ADD COLUMN IF NOT EXISTS branch_code VARCHAR(20) NULL COMMENT 'รหัสสาขา'
AFTER tax_id;

-- Add supplier_name field to acc_suppliers (for compatibility)
ALTER TABLE acc_suppliers
ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255) NULL COMMENT 'ชื่อผู้จำหน่าย (compat)'
AFTER name_en;

-- Update status ENUM to include all needed statuses
ALTER TABLE acc_purchase_orders
MODIFY COLUMN status ENUM('draft','approved','confirmed','received','paid','completed','cancelled') DEFAULT 'draft';
