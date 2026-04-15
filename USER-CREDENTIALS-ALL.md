# 👥 User Credentials - ทั้งหมด

## 📊 สรุป Users ทั้งหมด

| Type | Count | Description |
|------|-------|-------------|
| **Type 0** | 4 users | User ทั่วไป (เข้า `/sites` ได้) |
| **Type 1** | 1 user | Super Admin (เข้าทุกอย่างได้) |
| **Type 2** | 1 user | Admin (เข้า admin dashboard ได้) |

---

## 🔐 LOGIN PAGES

### 1. Main Login (สำหรับ User ทั่วไป)
**URL**: `https://www.ksave-monitoring.com/main-login`

### 2. Thailand Admin Login
**URL**: `https://www.ksave-monitoring.com/Thailand/Admin-Login`

### 3. Admin System Login
**URL**: `https://www.ksave-monitoring.com/admin/adminsystem`

---

## 👤 USER ACCOUNTS (Type 0 - ผู้ใช้ทั่วไป)

### User 1: Pavinee
```
Username: pavinee
Password: 018644
Site: republic korea
Email: pavinee@tovzera.com
Type: 0 (User)
```
**เข้าได้:**
- ✅ `/main-login` → `/sites`
- ✅ `/Thailand/Admin-Login` → `/Thailand/Admin-Login/dashboard` ✨ (สิทธิ์พิเศษ - เข้าได้ทุกหน้า!)

---

### User 2: Admin (แต่ไม่ใช่ Admin จริง!)
```
Username: admin
Password: 15388
Site: republic korea
Email: admintest@gmail.com
Type: 0 (User)
```
**เข้าได้:**
- ✅ `/main-login` → `/sites`
- ✅ `/Thailand/Admin-Login` → `/Thailand/Admin-Login/dashboard` ✨ (สิทธิ์พิเศษ - เข้าได้ทุกหน้า!)

**⚠️ หมายเหตุ:** แม้ username จะเป็น "admin" และ typeID = 0 แต่ได้รับสิทธิ์พิเศษให้เข้าได้ทุกหน้า

---

### User 3: User
```
Username: user
Password: 11223344
Site: thailand
Email: usertest@gmail.com
Type: 0 (User)
```
**เข้าได้:**
- ✅ `/main-login` → `/sites`
- ✅ `/Thailand/Admin-Login` → `/Thailand/Admin-Login/dashboard` ✨ (อัพเดทใหม่!)

---

### User 4: Test User
```
Username: testuser
Password: 4444
Site: thailand
Email: test@ksave.com
Type: 0 (User)
```
**เข้าได้:**
- ✅ `/main-login` → `/sites`
- ⚠️ `/Thailand/Admin-Login` → `/sites` (ไม่มีสิทธิ์ dashboard)

---

## 👨‍💼 ADMIN ACCOUNTS

### Admin 1: Thailand Admin (Type 2)
```
Username: thailand_admin
Password: Thailand2026
Site: thailand
Email: admin@kenergy-save.com
Type: 2 (Admin)
```
**เข้าได้:**
- ✅ `/main-login` → `/sites`
- ✅ `/Thailand/Admin-Login` → `/Thailand/Admin-Login/dashboard`
- ✅ Admin features (dashboard, customers, quotation, etc.)

---

### Admin 2: Super Admin (Type 1)
```
Username: superadmin
Password: Admin2026
Site: admin
Email: superadmin@kenergy-save.com
Type: 1 (Super Admin)
```
**เข้าได้:**
- ✅ `/main-login` → `/sites`
- ✅ `/admin/adminsystem` → `/admin/main`
- ✅ `/Thailand/Admin-Login` → `/Thailand/Admin-Login/dashboard`
- ✅ ทุก admin features (สิทธิ์สูงสุด)

---

## 🎯 การใช้งานแต่ละหน้า

### `/main-login` (User Login)
**ใช้ได้ทุก account:**
- ✅ pavinee / 018644 / republic korea
- ✅ admin / 15388 / republic korea
- ✅ user / 11223344 / thailand
- ✅ testuser / 4444 / thailand
- ✅ thailand_admin / Thailand2026 / thailand
- ✅ superadmin / Admin2026 / admin

**Redirect:**
- Type 0 → `/sites` (User view)
- Type 1,2 → `/sites` (แต่มีสิทธิ์เข้า admin)

---

### `/Thailand/Admin-Login` (Thailand Admin)
**ใช้ได้:**
- ✅ thailand_admin / Thailand2026 / Thailand → Dashboard
- ✅ superadmin / Admin2026 / Admin → Dashboard
- ✅ pavinee / 018644 / republic korea → Dashboard ✨ (สิทธิ์พิเศษ!)
- ✅ admin / 15388 / republic korea → Dashboard ✨ (สิทธิ์พิเศษ!)
- ✅ user / 11223344 / thailand → Dashboard ✨
- ⚠️ testuser / 4444 / thailand → Sites (ไม่มีสิทธิ์ dashboard)

**ข้อกำหนด:**
- Admin users (typeID 1,2): เข้าได้ทุกคน
- Republic Korea users: เฉพาะ pavinee และ admin
- Thailand users: เฉพาะ user เท่านั้น

---

### `/admin/adminsystem` (Global Admin)
**ใช้ได้:**
- ✅ superadmin / Admin2026 → `/admin/main`
- ✅ thailand_admin / Thailand2026 → `/admin/main`
- ❌ User ทั่วไป (typeID = 0) เข้าไม่ได้

---

## 📋 สรุปตาราง

| Username | Password | Site | Type | Main Login | Thailand Admin | Admin System |
|----------|----------|------|------|------------|----------------|--------------|
| pavinee | 018644 | republic korea | 0 | ✅ Sites | ✅ Dashboard ✨ | ❌ |
| admin | 15388 | republic korea | 0 | ✅ Sites | ✅ Dashboard ✨ | ❌ |
| user | 11223344 | thailand | 0 | ✅ Sites | ✅ Dashboard ✨ | ❌ |
| testuser | 4444 | thailand | 0 | ✅ Sites | ⚠️ Sites | ❌ |
| thailand_admin | Thailand2026 | thailand | 2 | ✅ Sites | ✅ Dashboard | ✅ Admin |
| superadmin | Admin2026 | admin | 1 | ✅ Sites | ✅ Dashboard | ✅ Admin |

---

## 🔍 ทดสอบการเข้าระบบ

### Test User Login (Type 0):
```bash
curl -X POST http://localhost:3001/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"11223344","site":"thailand"}'
```

### Test Admin Login:
```bash
curl -X POST http://localhost:3001/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"thailand_admin","password":"Thailand2026","site":"thailand"}'
```

---

## ✅ แนะนำสำหรับการใช้งาน

### สำหรับ User ทั่วไป:
- ใช้ `/main-login`
- Credentials ใดก็ได้จาก Type 0

### สำหรับ Admin Thailand:
- ใช้ `/Thailand/Admin-Login`
- Username: `thailand_admin`
- Password: `Thailand2026`

### สำหรับ Super Admin:
- ใช้ `/admin/adminsystem`
- Username: `superadmin`
- Password: `Admin2026`
