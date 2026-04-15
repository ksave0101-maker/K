# 🚀 Deploy K-System to Vercel - Step by Step

## ขั้นตอนที่ 1: Login Vercel (ทำครั้งเดียว)

```bash
vercel login
```

ระบบจะให้คุณเลือกวิธี login:
- Email
- GitHub
- GitLab
- Bitbucket

**แนะนำ: เลือก GitHub** (เพราะ repo อยู่บน GitHub แล้ว)

---

## ขั้นตอนที่ 2: Deploy โปรเจค

```bash
cd /home/k-system
vercel
```

Vercel จะถามคำถาม:
1. **Set up and deploy "~/k-system"?** → กด `Y` (Yes)
2. **Which scope?** → เลือก account ของคุณ
3. **Link to existing project?** → กด `N` (No - สร้างใหม่)
4. **What's your project's name?** → `k-system` (หรือชื่ออื่นตามใจชอบ)
5. **In which directory is your code located?** → กด Enter (ใช้ current directory)
6. **Auto-detected Project Settings (Next.js)?** → กด `Y` (Yes)

รอ build ประมาณ 2-3 นาที...

---

## ขั้นตอนที่ 3: Deploy to Production

หลังจาก deploy ครั้งแรกเสร็จ (preview deployment), deploy เป็น production:

```bash
vercel --prod
```

---

## ขั้นตอนที่ 4: เพิ่ม Environment Variables

### Option A: ผ่าน Dashboard (แนะนำ)

1. ไปที่ https://vercel.com/dashboard
2. เลือกโปรเจค `k-system`
3. ไปที่ **Settings** → **Environment Variables**
4. เพิ่ม variables ต่อไปนี้:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001
```

5. กด **Save**
6. Redeploy: `vercel --prod`

### Option B: ผ่าน CLI

```bash
# เพิ่ม environment variables
vercel env add NEXT_PUBLIC_API_URL production
# ป้อน: http://localhost:3001

vercel env add API_URL production
# ป้อน: http://localhost:3001

# Redeploy with new env vars
vercel --prod
```

---

## ขั้นตอนที่ 5: ตั้งค่า ngrok (สำหรับ Production)

### 5.1 ติดตั้ง ngrok

ดาวน์โหลดจาก: https://ngrok.com/download

### 5.2 Start ngrok

```bash
ngrok http 3001
```

คัดลอก URL ที่ได้ (เช่น `https://ksave-monitoring.com`)

### 5.3 อัพเดท Vercel Environment Variables

ไปที่ Vercel Dashboard:
1. **Settings** → **Environment Variables**
2. แก้ไข:
   - `NEXT_PUBLIC_API_URL` = ngrok URL
   - `API_URL` = ngrok URL
3. Redeploy: `vercel --prod`

---

## ✅ เช็คว่า Deploy สำเร็จ

หลัง deploy เสร็จ คุณจะได้:

### Production URL:
```
https://k-system.vercel.app
(หรือชื่อที่คุณตั้ง)
```

### ทดสอบหน้าต่างๆ:
- Homepage: `/`
- Sites: `/sites`
- Thailand Admin: `/Thailand/Admin-Login`
- Device Monitoring: `/device-monitoring?device=Ksave02`
- Compare Monitoring: `/monitor/Compare-Monitoring`

---

## 🔧 อัพเดทโปรเจค (ครั้งต่อไป)

เมื่อมีการเปลี่ยนแปลงโค้ด:

```bash
# 1. Commit และ push
git add .
git commit -m "Your update message"
git push origin main

# 2. Redeploy
vercel --prod
```

Vercel จะ auto-deploy เมื่อมี push ไป GitHub (ถ้าเปิด Git Integration)

---

## ⚠️ สิ่งที่ต้องรู้

### 1. API Endpoints ไม่ทำงานบน Vercel
Vercel เป็น serverless platform, API routes จะทำงานแต่:
- ไม่มี persistent connections
- ไม่สามารถเชื่อมต่อ local MySQL โดยตรง

**วิธีแก้:**
- ใช้ ngrok tunnel ไปยัง local API (localhost:3001)
- หรือ deploy API แยกไปที่ cloud server

### 2. Environment Variables
- `NEXT_PUBLIC_*` = accessible ใน browser
- ไม่มี `NEXT_PUBLIC_` = server-side only

### 3. Static vs Dynamic
- หน้าที่ใช้ `"use client"` จะ render ฝั่ง browser
- API calls จะไป ngrok URL ที่ตั้งค่าไว้

---

## 📱 คำสั่งที่ใช้บ่อย

```bash
# Login
vercel login

# Deploy preview
vercel

# Deploy production  
vercel --prod

# ดู deployment list
vercel ls

# ดู logs
vercel logs

# ลบ project
vercel remove k-system
```

---

## 🆘 แก้ปัญหา

### Build Failed
```bash
# ลองแก้ TypeScript errors
npm run build

# ดู error ใน Vercel dashboard logs
```

### Environment Variables ไม่ทำงาน
- เช็คว่าตั้งเป็น "Production" environment
- Redeploy หลังเปลี่ยน env vars

### API ไม่ตอบ
- เช็คว่า ngrok ยังทำงานอยู่
- เช็ค ngrok URL ใน Vercel env vars
- เช็ค localhost:3001 ยังรันอยู่

---

## 🎯 Next Steps

1. ✅ Deploy ครั้งแรกสำเร็จ
2. ⏳ ตั้งค่า Custom Domain (optional)
3. ⏳ ตั้งค่า ngrok static domain (paid plan)
4. ⏳ เปิด Analytics ใน Vercel

# Deployment Wed Jan 21 21:44:15 KST 2026
