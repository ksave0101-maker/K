-- Import acc_customers data into cus_detail
-- Created: 2026-03-24
-- This script adds all acc_customers records to cus_detail with proper field mapping

-- ========================================
-- Insert acc_customers data into cus_detail
-- ========================================

-- CUS-0001: บริษัท ซีเจ มอร์ จำกัด
INSERT INTO cus_detail (siteID, fullname, email, phone, company, tax_id, house_number, tambon, amphoe, province, postcode, message, acc_customer_id, created_by, created_at)
VALUES (2, 'บริษัท ซีเจ มอร์ จำกัด', 'supapan@cjmore.com', '02-2333146', 'คุณสุพรรณ อี.', '0105566001234', '123 ถนนสุขุมวิท', 'คลองเตย', 'คลองเตย', 'กรุงเทพฯ', '10110', '', 1, 'thailand admin', '2026-03-23 15:16:53');

-- CUS-0002: บริษัท ท็อปซูเปอร์มาร์เก็ต จำกัด
INSERT INTO cus_detail (siteID, fullname, email, phone, company, tax_id, house_number, tambon, amphoe, province, postcode, message, acc_customer_id, created_by, created_at)
VALUES (2, 'บริษัท ท็อปซูเปอร์มาร์เก็ต จำกัด', 'info@topsupermarket.com', '02-8317300', 'คุณประยุทธ สมบูรณ์', '0105566002345', '456 ถนนพระราม 4', 'คลองตัน', 'คลองเตย', 'กรุงเทพฯ', '10110', '', 2, 'thailand admin', '2026-03-23 15:16:53');

-- CUS-0003: ห้างหุ้นส่วนจำกัด ลอว์สัน 108
INSERT INTO cus_detail (siteID, fullname, email, phone, company, tax_id, house_number, tambon, amphoe, province, postcode, message, acc_customer_id, created_by, created_at)
VALUES (2, 'ห้างหุ้นส่วนจำกัด ลอว์สัน 108', 'papatsara@lawson108.com', '090-9713035', 'คุณปภัสรา เจ้าของแฟรนไชส์', '0105566003456', '789 ถนนพระราม 9', 'ห้วยขวาง', 'ห้วยขวาง', 'กรุงเทพฯ', '10310', '', 3, 'thailand admin', '2026-03-23 15:16:53');

-- CUS-0004: บริษัท บีซีพีจี จำกัด (มหาชน)
INSERT INTO cus_detail (siteID, fullname, email, phone, company, tax_id, house_number, tambon, amphoe, province, postcode, message, acc_customer_id, created_by, created_at)
VALUES (2, 'บริษัท บีซีพีจี จำกัด (มหาชน)', 'narongk@bcpg.com', '02-3338999', 'คุณณรงค์ ผู้จัดการจัดซื้อ', '0107558000123', '2098 ถนนสุขุมวิท', 'บางจาก', 'พระโขนง', 'กรุงเทพฯ', '10260', '', 4, 'thailand admin', '2026-03-23 15:16:53');

-- CUS-0005: บริษัท ซัสโก้ จำกัด
INSERT INTO cus_detail (siteID, fullname, email, phone, company, tax_id, house_number, tambon, amphoe, province, postcode, message, acc_customer_id, created_by, created_at)
VALUES (2, 'บริษัท ซัสโก้ จำกัด', 'yotsapa@susco.com', '024086065', 'คุณยศภา ผู้จัดการจัดซื้อ', '0105566005678', '1234 ถนนวิภาวดีรังสิต', 'จตุจักร', 'จตุจักร', 'กรุงเทพฯ', '10900', '', 5, 'thailand admin', '2026-03-23 15:16:53');

-- CUS-0006: บริษัท โลตัส โก เฟรช จำกัด
INSERT INTO cus_detail (siteID, fullname, email, phone, company, tax_id, house_number, tambon, amphoe, province, postcode, message, acc_customer_id, created_by, created_at)
VALUES (2, 'บริษัท โลตัส โก เฟรช จำกัด', 'chatusith@lotusgofresh.com', '097-9000-41838', 'คุณชาตุสิทธิ์ ฝ่ายกลยุทธ์พลังงาน', '0105566006789', '567 ถนนรัชดาภิเษก', 'จันทรเกษม', 'จตุจักร', 'กรุงเทพฯ', '10900', '', 6, 'thailand admin', '2026-03-23 15:16:53');

-- CUS-0007: บริษัท เจแอนด์อี ไลท์ติ้ง จำกัด
INSERT INTO cus_detail (siteID, fullname, email, phone, company, tax_id, house_number, tambon, amphoe, province, postcode, message, acc_customer_id, created_by, created_at)
VALUES (2, 'บริษัท เจแอนด์อี ไลท์ติ้ง จำกัด', 'graiakk@jelighting.com', '081-6475249', 'คุณไกรอักษ์ หัวหน้าจัดซื้อแผนกไฟฟ้า', '0105566007890', '888 ถนนเพชรบุรี', 'มักกะสัน', 'ราชเทวี', 'กรุงเทพฯ', '10400', '', 7, 'thailand admin', '2026-03-23 15:16:53');

-- CUS-0008: บริษัท พีทีจี เอ็นเนอร์ยี่ จำกัด
INSERT INTO cus_detail (siteID, fullname, email, phone, company, tax_id, house_number, tambon, amphoe, province, postcode, message, acc_customer_id, created_by, created_at)
VALUES (2, 'บริษัท พีทีจี เอ็นเนอร์ยี่ จำกัด', 'jansouk@ptgenergy.com', '02-1683377', 'คุณจันทร์สุข วิศวกรหัวหน้า', '0105566008901', '999 ถนนวิภาวดีรังสิต', 'ลาดยาว', 'จตุจักร', 'กรุงเทพฯ', '10900', '', 8, 'thailand admin', '2026-03-23 15:16:53');

-- CUS-0009: บริษัท คาลเท็กซ์ (ไทยแลนด์) จำกัด
INSERT INTO cus_detail (siteID, fullname, email, phone, company, tax_id, house_number, tambon, amphoe, province, postcode, message, acc_customer_id, created_by, created_at)
VALUES (2, 'บริษัท คาลเท็กซ์ (ไทยแลนด์) จำกัด', 'somchai@caltex.co.th', '02-2345678', 'คุณสมชาย ผู้จัดการฝ่ายจัดซื้อ', '0105566009012', '1111 ถนนสีลม', 'สีลม', 'บางรัก', 'กรุงเทพฯ', '10500', '', 9, 'thailand admin', '2026-03-23 15:16:53');

-- CUS-0010: บริษัท เชลล์ (ประเทศไทย) จำกัด
INSERT INTO cus_detail (siteID, fullname, email, phone, company, tax_id, house_number, tambon, amphoe, province, postcode, message, acc_customer_id, created_by, created_at)
VALUES (2, 'บริษัท เชลล์ (ประเทศไทย) จำกัด', 'prapha@shell.co.th', '02-3456789', 'คุณประภา หัวหน้าฝ่ายจัดซื้อ', '0105566010123', '2222 ถนนวิทยุ', 'ลุมพินี', 'ปทุมวัน', 'กรุงเทพฯ', '10330', '', 10, 'thailand admin', '2026-03-23 15:16:53');

-- ========================================
-- Verification
-- ========================================

SELECT 'Total in cus_detail' as label, COUNT(*) as count FROM cus_detail
UNION ALL
SELECT 'Linked to acc_customers' as label, COUNT(*) as count FROM cus_detail WHERE acc_customer_id IS NOT NULL;

-- Show sample data
SELECT cd.cusID, cd.fullname, cd.email, cd.province, cd.acc_customer_id, ac.code as acc_code
FROM cus_detail cd
LEFT JOIN acc_customers ac ON cd.acc_customer_id = ac.id
ORDER BY cd.cusID DESC
LIMIT 15;
