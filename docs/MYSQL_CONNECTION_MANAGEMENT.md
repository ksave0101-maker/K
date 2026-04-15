# MySQL Connection Management Guide

## ปัญหา: "Too many connections"

ปัญหานี้เกิดจาก:
1. MySQL มี connection limit (default = 151)
2. Application ไม่ปล่อย connections กลับคืน pool
3. Connection pool ใหญ่เกินไป

---

## ✅ วิธีแก้ไขถาวร (3 ขั้นตอน)

### 1️⃣ เพิ่ม max_connections ใน MySQL (ถาวร)

รันคำสั่ง:
```bash
cd /home/ksystem/K/scripts
./increase_mysql_connections.sh
```

หรือแก้ไขด้วยตัวเอง:
```bash
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
```

เพิ่มบรรทัดนี้ในส่วน `[mysqld]`:
```ini
max_connections = 500
```

จากนั้นรีสตาร์ท:
```bash
sudo systemctl restart mariadb
```

---

### 2️⃣ ลด Connection Pool Limits (เสร็จแล้ว ✅)

**ไฟล์ที่อัพเดตแล้ว:**

#### `/home/ksystem/K/lib/mysql.ts`
```typescript
connectionLimit: 5      // ลดจาก 10 → 5
queueLimit: 20          // ลดจาก 50 → 20
maxIdle: 2              // เก็บ idle connections แค่ 2
idleTimeout: 30000      // ปิด idle หลัง 30 วินาที (ลดจาก 60 วินาที)
```

#### `/home/ksystem/K/lib/mysql-user.ts`
```typescript
connectionLimit: 3      // คงเดิม (ใช้น้อยอยู่แล้ว)
queueLimit: 10          // คงเดิม
maxIdle: 2              // เพิ่มใหม่
idleTimeout: 30000      // เพิ่มใหม่
```

**ผลลัพธ์:**
- ลด active connections จาก 13+ → 8 max
- ปล่อย idle connections เร็วขึ้น (30 วินาที vs 60 วินาที)
- ลดการใช้ memory

---

### 3️⃣ ทำความสะอาด Connections แบบอัตโนมัติ

**สคริปต์ทำความสะอาด:**
```bash
cd /home/ksystem/K/scripts
./cleanup_mysql_connections.sh
```

สคริปต์นี้จะ:
- ✅ แสดงสถานะ connections ปัจจุบัน
- ✅ หา long-running queries
- ✅ นับ sleeping connections
- ✅ ฆ่า sleeping connections ที่เก่ากว่า 5 นาที

---

## 🔍 วิธีตรวจสอบ

### ดูจำนวน connections ปัจจุบัน:
```bash
mysql -u ksystem -p'Ksave2025Admin' -e "SHOW STATUS LIKE 'Threads_connected';"
```

### ดู max_connections:
```bash
mysql -u ksystem -p'Ksave2025Admin' -e "SHOW VARIABLES LIKE 'max_connections';"
```

### ดู active connections แยกตาม user:
```bash
mysql -u ksystem -p'Ksave2025Admin' -e "
  SELECT user, host, COUNT(*) as connections
  FROM information_schema.processlist
  GROUP BY user, host
  ORDER BY connections DESC;
"
```

---

## 🚨 แก้ปัญหาเฉพาะหน้า (Emergency)

ถ้าเจอ "Too many connections" ทันที:

**วิธีที่ 1: รีสตาร์ท MariaDB (เร็วสุด)**
```bash
sudo systemctl restart mariadb
```

**วิธีที่ 2: ฆ่า sleeping connections**
```bash
mysql -u root -p -e "
  SELECT CONCAT('KILL ', id, ';')
  FROM information_schema.processlist
  WHERE command = 'Sleep' AND time > 300;
" | grep KILL | mysql -u root -p
```

**วิธีที่ 3: เพิ่ม max_connections ชั่วคราว**
```sql
SET GLOBAL max_connections = 500;
```
(แต่จะหายเมื่อรีสตาร์ท)

---

## 📊 ผลลัพธ์ที่คาดหวัง

| ก่อนแก้ไข | หลังแก้ไข |
|-----------|-----------|
| max_connections: 151 | max_connections: 500 |
| connectionLimit: 10 | connectionLimit: 5 |
| idleTimeout: 60s | idleTimeout: 30s |
| Connections: 100+ | Connections: <50 |
| ปัญหาบ่อย ❌ | ไม่มีปัญหา ✅ |

---

## 🔧 Best Practices

1. ✅ **Always release connections** - ใช้ `finally` block
2. ✅ **Use connection pool** - อย่าสร้าง connection ใหม่ทุกครั้ง
3. ✅ **Set timeouts** - ป้องกัน connection แขวน
4. ✅ **Monitor regularly** - ตรวจสอบ pool stats
5. ✅ **Kill long queries** - Query ที่ใช้เวลานาน >5 นาทีควรถูกฆ่า

---

## 📝 ตัวอย่าง Code ที่ถูกต้อง

```typescript
export async function query(sql: string, values?: any[]) {
  let connection = null
  try {
    connection = await pool.getConnection()
    const [results] = await connection.query(sql, values)
    return results
  } catch (error) {
    console.error('Query error:', error)
    throw error
  } finally {
    // ✅ MUST release connection
    if (connection) {
      connection.release()
    }
  }
}
```

---

## 🎯 สรุป

การแก้ปัญหา "Too many connections" ต้องทำทั้ง 3 ด้าน:

1. **MySQL Server** - เพิ่ม max_connections → 500
2. **Application Pool** - ลด limits และเพิ่ม auto-cleanup
3. **Monitoring** - ตรวจสอบและทำความสะอาดสม่ำเสมอ

หลังจากทำตามขั้นตอนนี้แล้ว จะไม่มีปัญหา "Too many connections" อีกต่อไป! 🎉

---

**Created:** 2026-03-24
**Last Updated:** 2026-03-24
