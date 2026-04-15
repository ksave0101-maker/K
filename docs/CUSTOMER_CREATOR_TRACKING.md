# การติดตามผู้สร้างข้อมูลลูกค้า (Customer Creator Tracking)

## 📋 สรุป

เพิ่มระบบติดตามว่าใครเป็นคนสร้างข้อมูลลูกค้า โดยเชื่อมโยงกับตาราง `user_list`

---

## 🔧 การเปลี่ยนแปลง

### **1. เพิ่มคอลัมน์ใหม่ในตาราง `cus_detail`:**

```sql
-- เพิ่มคอลัมน์ FK เชื่อมกับ user_list
ALTER TABLE cus_detail
ADD COLUMN created_by_user_id INT(11) NULL
AFTER created_by;

-- เพิ่ม Foreign Key
ALTER TABLE cus_detail
ADD CONSTRAINT fk_cus_detail_created_by_user
FOREIGN KEY (created_by_user_id) REFERENCES user_list(userId)
ON DELETE SET NULL
ON UPDATE CASCADE;
```

### **2. อัพเดต API `/api/customers`:**

**GET queries ทั้งหมดเพิ่ม JOIN กับ user_list:**
```sql
SELECT cd.*,
       ul.name as created_by_name,
       ul.userName as created_by_username
FROM cus_detail cd
LEFT JOIN user_list ul ON cd.created_by_user_id = ul.userId
```

**Response รวม:**
- `created_by` - ข้อความเดิม (เช่น "thailand admin")
- `created_by_user_id` - FK ไปยัง user_list
- `created_by_name` - ชื่อผู้ใช้จริงจาก user_list
- `created_by_username` - username จาก user_list

---

## 📊 โครงสร้างข้อมูล

### **ก่อนแก้ไข:**
```
cus_detail
├─ created_by: "thailand admin" (text อิสระ)
└─ created_at: timestamp
```

### **หลังแก้ไข:**
```
cus_detail                          user_list
├─ created_by: "thailand admin"     ├─ userId (PK)
├─ created_by_user_id (FK) ───────> ├─ userName
└─ created_at: timestamp            ├─ name
                                    └─ email
```

---

## 🎯 การแสดงผลในตาราง

**หน้า Customers:**
- คอลัมน์ "สร้างโดย" จะแสดง: `created_by_name` (ชื่อจริง) หรือ `created_by` (ถ้าไม่มี FK)

**ตัวอย่าง:**
| ลูกค้า | สร้างโดย (เดิม) | สร้างโดย (ใหม่) |
|--------|-----------------|-----------------|
| คุณไถ่ | thailand admin | - (ยังไม่ได้ link) |
| Test | website_contact_form | - (ยังไม่ได้ link) |

---

## 🔄 Migration Status

### **สถานะปัจจุบัน:**
```sql
SELECT
    created_by,
    COUNT(*) as count,
    COUNT(created_by_user_id) as linked
FROM cus_detail
GROUP BY created_by;
```

**ผลลัพธ์:**
| created_by | count | linked |
|-----------|-------|--------|
| thailand admin | 4 | 0 |
| website_contact_form | 1 | 0 |

---

## 📝 Next Steps

### **Option 1: Map existing data manually**

```sql
-- หา userId ที่ต้องการ link
SELECT userId, userName, name FROM user_list WHERE name LIKE '%admin%';

-- Update records (example)
UPDATE cus_detail
SET created_by_user_id = 1
WHERE created_by = 'thailand admin';
```

### **Option 2: Update customer-add form**

ปรับ `/app/api/customers POST` ให้บันทึก user ID จริง:

```typescript
// ใน POST method
const userId = req.headers.get('x-user-id') // จาก session/auth
const createdByUserId = userId ? parseInt(userId) : null

const [result]: any = await conn.query(
  `INSERT INTO cus_detail (..., created_by, created_by_user_id)
   VALUES (..., ?, ?)`,
  [..., createdBy, createdByUserId]
)
```

### **Option 3: เพิ่มระบบ Authentication**

เก็บ session หรือ JWT token เพื่อรู้ว่าใครกำลัง login อยู่:

```typescript
// middleware หรือ auth helper
export async function getCurrentUser(req: NextRequest) {
  const token = req.cookies.get('auth_token')
  // ... validate token และ return userId
  return { userId, name, userName }
}
```

---

## ✅ Benefits

1. ✅ **ติดตามได้** - รู้ว่าใครสร้างข้อมูลลูกค้าแต่ละคน
2. ✅ **แสดงชื่อจริง** - ไม่ใช่แค่ text "thailand admin"
3. ✅ **Data Integrity** - FK รับประกันว่า user ยังมีอยู่
4. ✅ **Auditing** - สามารถ track การเปลี่ยนแปลงได้
5. ✅ **Reporting** - รายงานว่าพนักงานคนไหนเพิ่มลูกค้ากี่คน

---

## 📁 ไฟล์ที่เกี่ยวข้อง

- ✅ Migration: `database_schemas/add_created_by_user_id_to_cus_detail.sql`
- ✅ API: `app/api/customers/route.ts`
- ✅ UI: `app/Thailand/Admin-Login/customers/page.tsx`
- ✅ UI: `app/Thailand/Admin-Login/customers/list/page.tsx`

---

**Created:** 2026-03-24
**Status:** ✅ Database structure updated, UI updated
**TODO:** Link existing records to actual users
