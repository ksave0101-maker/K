import mysql from 'mysql2/promise'

// Create a connection pool for MySQL
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3307'),
  database: process.env.MYSQL_DATABASE || 'ksystem',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'Zera2025data',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds for Vercel compatibility
  enableKeepAlive: true,
  timezone: '+00:00'
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err)
})

// Note: Connection test removed for serverless compatibility
// Connections are created on-demand when needed

/**
 * Convert PostgreSQL parameterized query ($1, $2, etc.) to MySQL (?) syntax
 */
function convertPostgresToMysql(sql: string): string {
  return sql.replace(/\$\d+/g, '?')
}

/**
 * Execute MySQL query with automatic retry
 * Supports both MySQL (?) and PostgreSQL ($1, $2) syntax
 * @param sql SQL query string (can use ? or $1, $2 placeholders)
 * @param values Query parameters (optional)
 * @param retries Number of retry attempts (default: 2)
 * @returns Query results
 */
export async function query(sql: string, values?: any[], retries = 2): Promise<any[]> {
  // Convert PostgreSQL syntax to MySQL if needed
  const convertedSql = convertPostgresToMysql(sql)
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    let connection: any = null

    try {
      // Get connection from pool
      connection = await pool.getConnection()

      // Execute query with converted SQL
      const [results] = await connection.query(convertedSql, values)

      return Array.isArray(results) ? results : [results]

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Database query error (attempt ${attempt + 1}/${retries + 1}):`, lastError.message)

      // If this is not the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
      }

    } finally {
      // Always release the connection back to the pool
      if (connection) {
        try {
          connection.release()
        } catch (releaseError) {
          console.error('Error releasing connection:', releaseError)
        }
      }
    }
  }

  // If all retries failed, throw the last error
  throw lastError || new Error('Query failed after retries')
}

// Export pool for advanced usage
export { pool }
