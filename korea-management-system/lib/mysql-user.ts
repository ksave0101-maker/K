import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || process.env.MYSQL_USER_HOST || '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || process.env.MYSQL_USER_PORT || '3306', 10),
      user: process.env.MYSQL_USER || process.env.MYSQL_USER_USER || 'ksystem',
      password: process.env.MYSQL_PASSWORD || process.env.MYSQL_USER_PASSWORD || 'Ksave2025Admin',
      database: process.env.MYSQL_DATABASE || process.env.MYSQL_USER_DATABASE || 'ksystem',
      waitForConnections: true,
      connectionLimit: 3,
      queueLimit: 10,
      maxIdle: 2,
      idleTimeout: 30000,
      timezone: '+00:00',
      connectTimeout: 10000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }

  return pool;
}

export async function queryUser(
  sql: string,
  values?: Array<string | number | boolean | Date | null>
): Promise<unknown[]> {
  let connection: mysql.PoolConnection | undefined;

  try {
    connection = await getPool().getConnection();
    const [rows] = await connection.execute(sql, values);
    return rows as unknown[];
  } finally {
    connection?.release();
  }
}

export async function getUserById(userId: number): Promise<unknown | null> {
  const sql = `
    SELECT ul.userId, ul.userName, ul.name, ul.email, ul.site, ul.typeID,
           ct.TypeName, ct.departmentID, ct.departmentName
    FROM user_list ul
    LEFT JOIN cus_type ct ON ul.typeID = ct.typeID
    WHERE ul.userId = ?
    LIMIT 1
  `;

  const rows = await queryUser(sql, [userId]);
  return rows[0] ?? null;
}
