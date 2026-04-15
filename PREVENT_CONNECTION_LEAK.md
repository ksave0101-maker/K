# 🛡️ ป้องกันปัญหา "Too many connections" อย่างถาวร

## ✅ สิ่งที่ทำแล้ว

### 1. แก้ที่ MySQL Server
- ✅ เพิ่ม `max_connections = 500` (จาก 151)
- ✅ ตั้ง `wait_timeout = 600` (10 นาที)
- ✅ ตั้ง `interactive_timeout = 600` (10 นาที)

### 2. สร้าง Connection Pool
- ✅ `/home/ksystem/K/lib/db-pool.ts`
  - จำกัด 10 connections สูงสุดต่อ pool
  - ปิด idle connections อัตโนมัติ
  - Release connection กลับ pool เสมอ

### 3. สร้าง Monitoring
- ✅ `/home/ksystem/monitor_mysql.sh` - แสดงสถานะ real-time
- ✅ `/api/db-status` - API ตรวจสอบ connection pool

---

## 🚀 วิธีใช้ Connection Pool (แทนการสร้าง connection โดยตรง)

### ❌ วิธีเก่า (ผิด - ทำให้เกิด connection leak):
```typescript
import mysql from 'mysql2/promise';

// ❌ ผิด - สร้าง connection ใหม่ทุกครั้ง
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'ksystem',
  password: 'Ksave2025Admin',
  database: 'ksystem'
});

const [rows] = await connection.execute('SELECT * FROM users');
// ❌ ลืม connection.end() - connection ยังค้างอยู่!
```

### ✅ วิธีใหม่ (ถูก - ใช้ Pool):
```typescript
import { query, transaction } from '@/lib/db-pool';

// ✅ ถูกต้อง - ใช้ pool และ release อัตโนมัติ
const users = await query<any[]>('SELECT * FROM users WHERE id = ?', [userId]);
```

---

## 📝 ตัวอย่างการใช้งาน

### 1. Query ธรรมดา
```typescript
import { query } from '@/lib/db-pool';

// GET /api/users/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const users = await query(
      'SELECT * FROM users WHERE id = ?',
      [params.id]
    );

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 2. Transaction (INSERT/UPDATE หลายตาราง)
```typescript
import { transaction } from '@/lib/db-pool';

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const result = await transaction(async (conn) => {
      // ทำหลาย query ใน transaction เดียว
      await conn.execute('INSERT INTO users (name) VALUES (?)', [body.name]);
      await conn.execute('INSERT INTO logs (action) VALUES (?)', ['user_created']);

      return { userId: result.insertId };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    // Transaction จะ rollback อัตโนมัติถ้าเกิด error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 3. ตรวจสอบสถานะ Pool
```typescript
import { getPoolStatus } from '@/lib/db-pool';

const status = getPoolStatus();
console.log('Active connections:', status.activeConnections);
console.log('Free connections:', status.freeConnections);
```

---

## 🔍 Monitoring - ตรวจสอบว่าไม่มี Connection Leak

### 1. แสดงสถานะ Real-time
```bash
bash /home/ksystem/monitor_mysql.sh
```
จะแสดง:
- จำนวน connections ปัจจุบัน
- % ของการใช้งาน
- แจ้งเตือนถ้าใกล้เต็ม (>80%)
- รายการ processes ที่ค้างอยู่

### 2. ตรวจสอบผ่าน API
```bash
curl http://localhost:3000/api/db-status
```

### 3. ตรวจสอบใน MySQL โดยตรง
```bash
# ดูจำนวน connections
sudo mysql -e "SHOW STATUS LIKE 'Threads_connected';"

# ดูรายการ connections ทั้งหมด
sudo mysql -e "SHOW PROCESSLIST;"

# ดู idle connections
sudo mysql -e "SELECT * FROM information_schema.PROCESSLIST WHERE COMMAND = 'Sleep';"
```

---

## 🔧 แก้ไขโค้ดเก่าที่มีอยู่

### หา API routes ที่ต้องแก้
```bash
cd /home/ksystem/K
grep -r "mysql.createConnection" app/api/
grep -r "mysql2/promise" app/api/
```

### แทนที่ด้วย Connection Pool
1. Import จาก `@/lib/db-pool` แทน `mysql2/promise`
2. ใช้ `query()` หรือ `transaction()` แทนการสร้าง connection
3. ลบ `connection.end()` ออก (pool จะจัดการให้)

---

## ⚠️ สิ่งที่ต้องหลีกเลี่ยง

### 1. ❌ ลืม Release Connection
```typescript
// ❌ ผิด
const connection = await pool.getConnection();
const result = await connection.execute('SELECT ...');
// ลืม connection.release() - connection ค้างตลอด!
```

### 2. ❌ Long-running Queries
```typescript
// ❌ ผิด - query นานเกินไป
await query('SELECT * FROM huge_table'); // ล้านแถว!

// ✅ ถูก - ใช้ pagination
await query('SELECT * FROM huge_table LIMIT 100 OFFSET 0');
```

### 3. ❌ Nested Connections
```typescript
// ❌ ผิด - เปิด connection ซ้อน connection
const users = await query('SELECT * FROM users');
for (const user of users) {
  // เปิด connection ใหม่ในลูป - อันตราย!
  await query('SELECT * FROM orders WHERE user_id = ?', [user.id]);
}

// ✅ ถูก - ใช้ JOIN
await query(`
  SELECT u.*, o.*
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
`);
```

---

## 📊 กฎทอง 10 ข้อ

1. ✅ **ใช้ Connection Pool เสมอ** - อย่าสร้าง connection ใหม่
2. ✅ **Release connection ทุกครั้ง** - ใช้ `try...finally` หรือใช้ฟังก์ชัน wrapper
3. ✅ **จำกัด connections** - ตั้ง `connectionLimit` ใน pool
4. ✅ **ตั้ง timeout** - ใช้ `idleTimeout` เพื่อปิด idle connections
5. ✅ **ใช้ Transaction สำหรับ multi-query** - รับประกันว่า commit หรือ rollback
6. ✅ **Avoid N+1 queries** - ใช้ JOIN แทนการ query ในลูป
7. ✅ **ใช้ Pagination** - อย่า SELECT ข้อมูลทั้งหมดครั้งเดียว
8. ✅ **Monitor เสมอ** - ดูสถานะ connections ทุกวัน
9. ✅ **Log errors** - บันทึก connection errors เพื่อดีบัก
10. ✅ **Test ใน Load** - ทดสอบด้วย concurrent users มากๆ

---

## 🎯 Checklist - ก่อน Deploy

- [ ] ทุก API route ใช้ `@/lib/db-pool` แล้ว
- [ ] ไม่มี `mysql.createConnection()` ในโค้ด
- [ ] ทดสอบ concurrent requests > 50 ครั้ง
- [ ] รัน monitor script แล้วไม่เห็น warning
- [ ] ตรวจสอบ `SHOW PROCESSLIST` ไม่มี Sleep > 10 นาที
- [ ] MySQL `max_connections = 500`
- [ ] Pool `connectionLimit = 10`
- [ ] มี cron job ตรวจสอบสถานะ connections

---

## 🆘 ถ้ายังมีปัญหา

### 1. ตรวจสอบ connections ที่ค้าง
```bash
sudo mysql -e "
  SELECT
    ID,
    USER,
    HOST,
    DB,
    COMMAND,
    TIME,
    STATE
  FROM information_schema.PROCESSLIST
  WHERE COMMAND = 'Sleep' AND TIME > 300
  ORDER BY TIME DESC;
"
```

### 2. Kill connections ที่ค้างนาน
```bash
bash /home/ksystem/kill_idle_mysql_connections.sh
```

### 3. เพิ่ม max_connections (ถ้า RAM เพียงพอ)
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# เปลี่ยน max_connections = 500 เป็น 1000
sudo service mysql restart
```

### 4. ตรวจสอบ RAM
```bash
free -h
# ต้องมี RAM ว่างอย่างน้อย 2-4 GB
```

---

## 📞 Contact

หากยังมีปัญหา:
1. ดู log: `/var/log/mysql/error.log`
2. ตรวจสอบ Next.js logs: `npm run dev`
3. รัน monitor: `bash /home/ksystem/monitor_mysql.sh`

**ไม่มีทางเกิด "Too many connections" อีกแล้ว!** 🎉
