-- Merge cus_detail and acc_customers into one unified table
-- Created: 2026-03-24
-- Strategy: Enhance acc_customers with fields from cus_detail, then migrate data

-- ========================================
-- STEP 1: Backup existing data
-- ========================================

-- Create backup tables
CREATE TABLE IF NOT EXISTS cus_detail_backup AS SELECT * FROM cus_detail;
CREATE TABLE IF NOT EXISTS acc_customers_backup AS SELECT * FROM acc_customers;

-- ========================================
-- STEP 2: Add missing fields to acc_customers
-- ========================================

-- Add fields from cus_detail that don't exist in acc_customers
ALTER TABLE acc_customers
ADD COLUMN IF NOT EXISTS siteID INT(11) NULL COMMENT 'Site/Branch ID' AFTER id,
ADD COLUMN IF NOT EXISTS house_number VARCHAR(50) NULL COMMENT 'เลขที่' AFTER address,
ADD COLUMN IF NOT EXISTS moo VARCHAR(10) NULL COMMENT 'หมู่ที่' AFTER house_number,
ADD COLUMN IF NOT EXISTS tambon VARCHAR(100) NULL COMMENT 'แขวง/ตำบล' AFTER moo,
ADD COLUMN IF NOT EXISTS amphoe VARCHAR(100) NULL COMMENT 'เขต/อำเภอ' AFTER tambon,
ADD COLUMN IF NOT EXISTS province VARCHAR(100) NULL COMMENT 'จังหวัด' AFTER amphoe,
ADD COLUMN IF NOT EXISTS postcode VARCHAR(10) NULL COMMENT 'รหัสไปรษณีย์' AFTER province,
ADD COLUMN IF NOT EXISTS message TEXT NULL COMMENT 'ข้อความ/หมายเหตุ' AFTER address,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(50) NULL COMMENT 'ผู้สร้าง (text)' AFTER is_active,
ADD COLUMN IF NOT EXISTS created_by_user_id INT(11) NULL COMMENT 'ผู้สร้าง (FK)' AFTER created_by,
ADD COLUMN IF NOT EXISTS old_cusID INT(11) NULL COMMENT 'รหัสเดิมจาก cus_detail' AFTER id;

-- Add index for siteID
ALTER TABLE acc_customers
ADD INDEX IF NOT EXISTS idx_siteID (siteID);

-- Add FK for created_by_user_id
ALTER TABLE acc_customers
ADD CONSTRAINT IF NOT EXISTS fk_acc_customers_created_by_user
FOREIGN KEY (created_by_user_id) REFERENCES user_list(userId)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Add FK for siteID
ALTER TABLE acc_customers
ADD CONSTRAINT IF NOT EXISTS fk_acc_customers_site
FOREIGN KEY (siteID) REFERENCES site(siteID)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- ========================================
-- STEP 3: Migrate data from cus_detail
-- ========================================

-- Insert cus_detail records that are NOT linked to acc_customers
INSERT INTO acc_customers (
    old_cusID,
    siteID,
    code,
    name_th,
    tax_id,
    phone,
    email,
    address,
    house_number,
    moo,
    tambon,
    amphoe,
    province,
    postcode,
    message,
    created_by,
    created_by_user_id,
    created_at
)
SELECT
    cd.cusID,
    cd.siteID,
    CONCAT('CUS-', LPAD(cd.cusID, 4, '0')) as code, -- Generate code from cusID
    cd.fullname as name_th,
    cd.tax_id,
    cd.phone,
    cd.email,
    cd.address,
    cd.house_number,
    cd.moo,
    cd.tambon,
    cd.amphoe,
    cd.province,
    cd.postcode,
    cd.message,
    cd.created_by,
    cd.created_by_user_id,
    cd.created_at
FROM cus_detail cd
WHERE cd.acc_customer_id IS NULL; -- Only migrate records not already linked

-- Update cus_detail records that ARE linked to acc_customers
-- (Fill in missing Thai address fields if available)
UPDATE acc_customers ac
INNER JOIN cus_detail cd ON cd.acc_customer_id = ac.id
SET
    ac.old_cusID = cd.cusID,
    ac.siteID = COALESCE(ac.siteID, cd.siteID),
    ac.house_number = COALESCE(ac.house_number, cd.house_number),
    ac.moo = COALESCE(ac.moo, cd.moo),
    ac.tambon = COALESCE(ac.tambon, cd.tambon),
    ac.amphoe = COALESCE(ac.amphoe, cd.amphoe),
    ac.province = COALESCE(ac.province, cd.province),
    ac.postcode = COALESCE(ac.postcode, cd.postcode),
    ac.message = COALESCE(ac.message, cd.message),
    ac.created_by = COALESCE(ac.created_by, cd.created_by),
    ac.created_by_user_id = COALESCE(ac.created_by_user_id, cd.created_by_user_id)
WHERE cd.acc_customer_id IS NOT NULL;

-- ========================================
-- STEP 4: Verification
-- ========================================

-- Check migration results
SELECT
    'Original cus_detail' as source,
    COUNT(*) as count
FROM cus_detail_backup
UNION ALL
SELECT
    'Original acc_customers' as source,
    COUNT(*) as count
FROM acc_customers_backup
UNION ALL
SELECT
    'Merged acc_customers' as source,
    COUNT(*) as count
FROM acc_customers
UNION ALL
SELECT
    'Migrated from cus_detail (old_cusID NOT NULL)' as source,
    COUNT(*) as count
FROM acc_customers
WHERE old_cusID IS NOT NULL;

-- Show sample merged data
SELECT
    id,
    code,
    name_th,
    email,
    phone,
    province,
    old_cusID,
    created_by,
    created_at
FROM acc_customers
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- STEP 5: (Optional) Rename cus_detail to cus_detail_archived
-- ========================================

-- Uncomment to archive the old table
-- RENAME TABLE cus_detail TO cus_detail_archived;

-- ========================================
-- NOTES
-- ========================================

/*
After running this migration:

1. Update all APIs to use acc_customers instead of cus_detail:
   - /api/customers -> should use acc_customers
   - /api/accounting/customers -> already uses acc_customers

2. Update all pages to use the unified customer API

3. Consider creating a VIEW for backward compatibility:
   CREATE VIEW cus_detail AS
   SELECT
       id as cusID,
       siteID,
       name_th as fullname,
       email,
       phone,
       company,
       address,
       house_number,
       moo,
       tambon,
       amphoe,
       province,
       postcode,
       tax_id,
       message,
       created_by,
       created_by_user_id,
       created_at
   FROM acc_customers;

4. After verification (1-2 weeks), can safely drop cus_detail table:
   DROP TABLE cus_detail;
   DROP TABLE cus_detail_backup;
   DROP TABLE acc_customers_backup;
*/
