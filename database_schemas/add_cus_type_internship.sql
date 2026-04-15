-- เพิ่มประเภทลูกค้า/ผู้ใช้งานใหม่: นักศึกษาฝึกงาน (Internship)
-- ป้องกันข้อมูลซ้ำด้วยเงื่อนไข NOT EXISTS

INSERT INTO `cus_type` (
  `typeID`,
  `TypeName`,
  `departmentID`,
  `departmentName`,
  `site`,
  `extra_permissions`
)
SELECT
  COALESCE(MAX(`typeID`), 0) + 1,
  'นักศึกษาฝึกงาน (Internship)',
  'Internship',
  'Internship',
  'thailand,republic korea',
  NULL
FROM `cus_type`
WHERE NOT EXISTS (
  SELECT 1
  FROM `cus_type`
  WHERE `TypeName` = 'นักศึกษาฝึกงาน (Internship)'
);

-- ตรวจสอบผลลัพธ์หลังรัน
SELECT `typeID`, `TypeName`, `departmentID`, `departmentName`, `site`
FROM `cus_type`
WHERE `TypeName` = 'นักศึกษาฝึกงาน (Internship)';

-- เพิ่มประเภทลูกค้า/ผู้ใช้งานใหม่: ผู้ช่วย (Assistant)
-- ป้องกันข้อมูลซ้ำด้วยเงื่อนไข NOT EXISTS

INSERT INTO `cus_type` (
  `typeID`,
  `TypeName`,
  `departmentID`,
  `departmentName`,
  `site`,
  `extra_permissions`
)
SELECT
  COALESCE(MAX(`typeID`), 0) + 1,
  'ผู้ช่วย (Assistant)',
  'Assistant',
  'Assistant',
  'thailand,republic korea',
  NULL
FROM `cus_type`
WHERE NOT EXISTS (
  SELECT 1
  FROM `cus_type`
  WHERE `TypeName` = 'ผู้ช่วย (Assistant)'
);

-- ตรวจสอบผลลัพธ์หลังรัน
SELECT `typeID`, `TypeName`, `departmentID`, `departmentName`, `site`
FROM `cus_type`
WHERE `TypeName` = 'ผู้ช่วย (Assistant)';
