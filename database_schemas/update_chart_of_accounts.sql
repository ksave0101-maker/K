-- อัพเดตตาราง acc_chart_of_accounts เพื่อรองรับ parent-child และข้อมูลเพิ่มเติม
-- สำหรับระบบผังบัญชีแบบ Tree View

-- เพิ่มคอลัมน์สำหรับ parent-child relationship
ALTER TABLE acc_chart_of_accounts
ADD COLUMN IF NOT EXISTS parent_code VARCHAR(20) COMMENT 'รหัสบัญชีแม่',
ADD COLUMN IF NOT EXISTS account_alias VARCHAR(255) COMMENT 'นามแฝงบัญชี',
ADD COLUMN IF NOT EXISTS is_sub_account TINYINT(1) DEFAULT 0 COMMENT '0=บัญชีหลัก, 1=บัญชีย่อย',
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0 COMMENT 'ลำดับการแสดงผล';

-- เพิ่ม Foreign Key สำหรับ parent_code (optional)
-- ALTER TABLE acc_chart_of_accounts
-- ADD CONSTRAINT fk_parent_code
-- FOREIGN KEY (parent_code) REFERENCES acc_chart_of_accounts(code)
-- ON DELETE RESTRICT ON UPDATE CASCADE;

-- เพิ่มข้อมูลตัวอย่างผังบัญชีแบบมีลำดับชั้น
INSERT IGNORE INTO acc_chart_of_accounts (code, name_th, name_en, account_type, sub_type, parent_code, account_alias, is_sub_account, display_order) VALUES
-- 1. สินทรัพย์ (Assets)
('1000-00', 'สินทรัพย์', 'Assets', 'asset', NULL, NULL, '1 - สินทรัพย์', 0, 1000),
('1100-00', 'สินทรัพย์หมุนเวียน', 'Current Assets', 'asset', 'current', '1000-00', NULL, 1, 1100),
('1200-00', 'ถูกตัดเงินให้บริษัทกรรมการและสาวร์', 'Advance to Related Parties', 'asset', 'current', '1000-00', NULL, 1, 1200),
('1300-00', 'เงินลงทุนในบริษัทย่างแปบ', 'Investment in Subsidiary', 'asset', 'non_current', '1000-00', NULL, 1, 1300),
('1400-00', 'ที่ดิน อาคารอุปกรณ์สำนักงาน', 'Property, Plant and Equipment', 'asset', 'non_current', '1000-00', NULL, 1, 1400),
('1500-00', 'สินทรัพย์ถาวรอื่น ๆ', 'Other Fixed Assets', 'asset', 'non_current', '1000-00', NULL, 1, 1500),

-- 2. หนี้สิน (Liabilities)
('2000-00', 'หนี้สิน', 'Liabilities', 'liability', NULL, NULL, '2 - หนี้สิน', 0, 2000),

-- 3. ส่วนของผู้ถือหุ้น (Equity)
('3000-00', 'ส่วนของผู้ถือหุ้น', 'Equity', 'equity', NULL, NULL, '3 - ส่วนของผู้ถือหุ้น', 0, 3000),

-- 4. รายได้ (Income)
('4000-00', 'รายได้', 'Income', 'income', NULL, NULL, '4 - รายได้', 0, 4000),

-- 5. ค่าใช้จ่าย (Expenses)
('5000-00', 'ค่าใช้จ่าย', 'Expenses', 'expense', NULL, NULL, '5 - ค่าใช้จ่าย', 0, 5000),

-- 6. ภาษีเงินได้นิติบุคคล (Corporate Tax)
('6000-00', 'ภาษีเงินได้นิติบุคคล', 'Corporate Income Tax', 'expense', 'tax', NULL, '6 - ภาษีเงินได้นิติบุคคล', 0, 6000),

-- 9. ปิดบัญชี (Closing)
('9999-99', 'ปิดบัญชี', 'Closing Account', 'equity', 'closing', NULL, '9 - ปิดบัญชี', 0, 9999);
