-- Cleanup customer data after changing subject → tax_id
-- Created: 2026-03-24

-- 1. Clear invalid tax_id values (keep only valid 13-digit tax IDs)
UPDATE cus_detail
SET tax_id = NULL
WHERE tax_id IS NOT NULL
  AND (LENGTH(tax_id) != 13 OR tax_id NOT REGEXP '^[0-9]{13}$');

-- 2. Parse and update specific customer addresses
-- Customer #13: คุณไถ่
UPDATE cus_detail
SET province = 'ราชบุรี',
    house_number = '103/4',
    moo = '1',
    tambon = 'ดอนทราย',
    amphoe = 'โพธาราม',
    postcode = '70120'
WHERE cusID = 13;

-- Customer #11: test
UPDATE cus_detail
SET province = 'กรุงเทพ',
    address = 'bangkok'
WHERE cusID = 11;

-- 3. Verify results
SELECT
  CONCAT('#', cusID) as รหัส,
  fullname as 'ชื่อ-นามสกุล',
  email as อีเมล,
  phone as โทรศัพท์,
  company as บริษัท,
  tax_id as เลขผู้เสียภาษี,
  province as จังหวัด,
  CASE
    WHEN house_number IS NOT NULL THEN
      CONCAT(house_number, ' ',
             IFNULL(CONCAT('หมู่ ', moo, ' '), ''),
             IFNULL(tambon, ''), ' ',
             IFNULL(amphoe, ''), ' ',
             IFNULL(province, ''), ' ',
             IFNULL(postcode, ''))
    ELSE address
  END as ที่อยู่,
  created_by as สร้างโดย,
  DATE_FORMAT(created_at, '%d/%m/%Y') as วันที่สร้าง
FROM cus_detail
ORDER BY cusID DESC;
