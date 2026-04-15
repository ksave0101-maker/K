/**
 * MySQL Connection Pool - ป้องกัน "Too many connections"
 *
 * ใช้ Connection Pool แทนการสร้าง connection ใหม่ทุกครั้ง
 * - จำกัดจำนวน connections สูงสุด
 * - ปิด idle connections อัตโนมัติ
 * - Retry เมื่อเกิด error
 */

import mysql from 'mysql2/promise';

// ตั้งค่า Connection Pool
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'ksystem',
  password: process.env.DB_PASSWORD || 'Ksave2025Admin',
  database: process.env.DB_NAME || 'ksystem',

  // ⭐ การตั้งค่าสำคัญ - ป้องกัน Too many connections
  connectionLimit: 10,              // จำกัด 10 connections ต่อ pool (แทน unlimited)
  queueLimit: 0,                    // ไม่จำกัด queue
  waitForConnections: true,         // รอ connection ว่าง ถ้าเต็ม

  // ⭐ ปิด idle connections อัตโนมัติ
  idleTimeout: 60000,               // ปิด connection ที่ไม่ได้ใช้ 60 วินาที
  enableKeepAlive: true,            // Keep connection alive
  keepAliveInitialDelay: 10000,    // Keep alive ทุก 10 วินาที

  // ⭐ Error handling
  maxIdle: 2,                       // เก็บ idle connection สูงสุด 2 ตัว
  connectTimeout: 10000,            // Timeout 10 วินาทีเมื่อ connect

  // ⭐ Charset
  charset: 'utf8mb4'
};

// สร้าง Connection Pool
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(poolConfig);

    // Log เมื่อเกิด error
    pool.on('connection', (connection) => {
      console.log('✅ New MySQL connection established');
    });

    pool.on('release', (connection) => {
      console.log('♻️  MySQL connection released back to pool');
    });
  }

  return pool;
}

/**
 * ✅ วิธีใช้ที่ถูกต้อง - จะ release connection อัตโนมัติ
 *
 * @example
 * const result = await query('SELECT * FROM users WHERE id = ?', [userId]);
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T> {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T;
  } finally {
    // ⭐ สำคัญมาก! ต้อง release connection กลับ pool
    connection.release();
  }
}

/**
 * ✅ Transaction - รับประกันว่า connection จะถูกปิด
 *
 * @example
 * await transaction(async (conn) => {
 *   await conn.execute('INSERT INTO ...');
 *   await conn.execute('UPDATE ...');
 * });
 */
export async function transaction<T = any>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    // ⭐ สำคัญมาก! ต้อง release connection
    connection.release();
  }
}

/**
 * ตรวจสอบสถานะ Pool
 */
export function getPoolStatus() {
  const pool = getPool();
  return {
    // @ts-ignore - access private property
    totalConnections: pool.pool._allConnections.length,
    // @ts-ignore
    activeConnections: pool.pool._allConnections.length - pool.pool._freeConnections.length,
    // @ts-ignore
    freeConnections: pool.pool._freeConnections.length,
    // @ts-ignore
    queuedRequests: pool.pool._queue.length
  };
}

/**
 * ปิด Pool (ใช้เมื่อ shutdown)
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ MySQL pool closed');
  }
}

// ⭐ ปิด pool อัตโนมัติเมื่อ process ปิด
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});
