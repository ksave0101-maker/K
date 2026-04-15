import mysql from 'mysql2/promise'

// Create MySQL connection pool for customer database
const pool = mysql.createPool({
  host: process.env.MYSQL_CUSTOMER_HOST || process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_CUSTOMER_PORT || process.env.MYSQL_PORT || '3307'),
  user: process.env.MYSQL_CUSTOMER_USER || process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_CUSTOMER_PASSWORD || process.env.MYSQL_PASSWORD || 'Zera2025data',
  database: process.env.MYSQL_CUSTOMER_DATABASE || 'ksystem',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000, // 10 seconds for Vercel compatibility
  timezone: '+00:00'
})

// Note: Connection test removed for serverless compatibility
// Connections are created on-demand when needed

/**
 * Execute MySQL query with automatic connection management
 * @param sql SQL query string
 * @param values Query parameters (optional)
 * @returns Query results
 */
export async function queryCustomer(sql: string, values?: any[]): Promise<any[]> {
  const connection = await pool.getConnection()

  try {
    const [rows] = await connection.execute(sql, values)
    return rows as any[]
  } finally {
    connection.release()
  }
}

/**
 * Insert data into cus_detail table
 * @param data Contact form data
 * @returns Insert result with cusID
 */
export async function insertCustomerContact(data: {
  fullname: string
  email: string
  phone: string
  company?: string
  subject: string
  message: string
  created_by?: string
}): Promise<{ cusID: number }> {
  const sql = `
    INSERT INTO cus_detail (fullname, email, phone, company, subject, message, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `

  const values = [
    data.fullname,
    data.email,
    data.phone,
    data.company || null,
    data.subject,
    data.message,
    data.created_by || 'website_contact_form'
  ]

  const connection = await pool.getConnection()

  try {
    const [result] = await connection.execute(sql, values)
    const insertResult = result as mysql.ResultSetHeader

    return { cusID: insertResult.insertId }
  } finally {
    connection.release()
  }
}

// Export pool for advanced usage
export { pool }
