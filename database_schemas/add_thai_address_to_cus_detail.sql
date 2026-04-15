-- Add Thai address format fields to cus_detail table
-- Created: 2026-03-24

ALTER TABLE cus_detail
ADD COLUMN house_number VARCHAR(50) NULL COMMENT 'เลขที่' AFTER address,
ADD COLUMN moo VARCHAR(10) NULL COMMENT 'หมู่ที่' AFTER house_number,
ADD COLUMN tambon VARCHAR(100) NULL COMMENT 'แขวง/ตำบล' AFTER moo,
ADD COLUMN amphoe VARCHAR(100) NULL COMMENT 'เขต/อำเภอ' AFTER tambon,
ADD COLUMN province VARCHAR(100) NULL COMMENT 'จังหวัด' AFTER amphoe,
ADD COLUMN postcode VARCHAR(10) NULL COMMENT 'รหัสไปรษณีย์' AFTER province;

-- Verify the changes
DESCRIBE cus_detail;
