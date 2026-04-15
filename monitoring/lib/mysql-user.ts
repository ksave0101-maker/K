import mysql from 'mysql2/promise'

// Create MySQL connection pool for user database (lazy initialization)
// Support both MYSQL_* and MYSQL_USER_* environment variables
let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    // Debug: Log environment variables only when pool is created
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 MySQL Connection Config:', {
        host: process.env.MYSQL_HOST || process.env.MYSQL_USER_HOST,
        port: process.env.MYSQL_PORT || process.env.MYSQL_USER_PORT,
        user: process.env.MYSQL_USER,
        database: process.env.MYSQL_DATABASE || process.env.MYSQL_USER_DATABASE,
        password_set: !!(process.env.MYSQL_PASSWORD || process.env.MYSQL_USER_PASSWORD)
      })
    }

    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || process.env.MYSQL_USER_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || process.env.MYSQL_USER_PORT || '3307'),
      user: process.env.MYSQL_USER || process.env.MYSQL_USER_USER || 'ksystem',
      password: process.env.MYSQL_PASSWORD || process.env.MYSQL_USER_PASSWORD || 'Ksave2025Admin',
      database: process.env.MYSQL_DATABASE || process.env.MYSQL_USER_DATABASE || 'ksystem',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+00:00',
      connectTimeout: 10000 // 10 second timeout for Vercel
    })
  }
  return pool
}

// Note: Connection test removed for serverless compatibility
// Connections are created on-demand when needed

/**
 * Execute MySQL query with automatic connection management
 * @param sql SQL query string
 * @param values Query parameters (optional)
 * @returns Query results
 */
export async function queryUser(sql: string, values?: any[]): Promise<any[]> {
  let connection
  try {
    connection = await getPool().getConnection()
    const [rows] = await connection.execute(sql, values)
    return rows as any[]
  } catch (error: any) {
    console.error('❌ MySQL query error:', error.message)
    throw new Error(`Database query failed: ${error.message}`)
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

/**
 * Authenticate user login
 * Uses HTTP API proxy when NEXT_PUBLIC_API_URL is set (for Vercel)
 * Uses direct MySQL connection when running locally
 * @param username Username
 * @param password Password (plain text - will be compared with hashed)
 * @param site Site/Branch
 * @returns User data if authenticated, null otherwise
 */
export async function authenticateUser(
  username: string,
  password: string,
  site?: string
): Promise<{
  userId: number
  userName: string
  name: string
  email: string
  site: string
  typeID: number
} | null> {
  // Check if we should use internal MySQL proxy API (for Vercel deployment)
  const useProxy = process.env.USE_MYSQL_PROXY === 'true'

  if (useProxy) {
    console.log('🌐 Using internal MySQL proxy API for authentication')
    try {
      // Use internal Next.js API route
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/mysql-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, site })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.log('❌ Proxy API authentication failed:', response.status, errorData.error)
        return null
      }

      const data = await response.json()

      if (data.success && data.userId) {
        return {
          userId: data.userId,
          userName: data.username,
          name: data.name || '',
          email: data.email || '',
          site: data.site || '',
          typeID: data.typeID
        }
      }

      return null
    } catch (error: any) {
      console.error('❌ Proxy API authentication error:', error.message)
      // Fall back to direct MySQL connection if proxy fails
      console.log('⚠️ Falling back to direct MySQL connection')
    }
  }

  // Use direct MySQL connection (local development)
  console.log('🔌 Using direct MySQL connection for authentication')
  const sql = `
    SELECT userId, userName, name, email, site, password, typeID
    FROM user_list
    WHERE userName = ?
    LIMIT 1
  `

  const connection = await getPool().getConnection()

  try {
    const [rows] = await connection.execute(sql, [username])
    const users = rows as any[]

    if (users.length === 0) {
      return null
    }

    const user = users[0]

    // Check if password matches (plain text comparison for now)
    // TODO: Use bcrypt for password hashing in production
    if (user.password !== password) {
      return null
    }

    // If site is provided, check if it matches (case-insensitive)
    if (site && user.site) {
      if (user.site.toLowerCase() !== site.toLowerCase()) {
        return null
      }
    } else if (site && !user.site) {
      // User has no site in database but site is required
      return null
    }

    // Return user data (without password)
    return {
      userId: user.userId,
      userName: user.userName,
      name: user.name || '',
      email: user.email || '',
      site: user.site || '',
      typeID: user.typeID
    }
  } finally {
    connection.release()
  }
}

/**
 * Get user by ID
 * @param userId User ID
 * @returns User data
 */
export async function getUserById(userId: number): Promise<any | null> {
  const sql = `
    SELECT ul.userId, ul.userName, ul.name, ul.email, ul.site, ul.typeID,
           ct.TypeName, ct.departmentID, ct.departmentName
    FROM user_list ul
    LEFT JOIN cus_type ct ON ul.typeID = ct.typeID
    WHERE ul.userId = ?
    LIMIT 1
  `

  const connection = await getPool().getConnection()

  try {
    const [rows] = await connection.execute(sql, [userId])
    const users = rows as any[]

    if (users.length === 0) {
      return null
    }

    return users[0]
  } finally {
    connection.release()
  }
}

/**
 * Record login log to U_log_login table
 * @param userId User ID
 * @param pageName Page name where user logged in
 * @returns boolean true if logged successfully
 */
export async function recordLoginLog(userId: number, pageName: string = 'home'): Promise<boolean> {
  const sql = `
    INSERT INTO U_log_login (userID, name, login_timestamp, page_log, create_by)
    SELECT ?, name, NOW(), ?, 'Auto system'
    FROM user_list
    WHERE userId = ?
    LIMIT 1
  `

  const connection = await getPool().getConnection()

  try {
    await connection.execute(sql, [userId, pageName, userId])
    console.log(`✅ Login logged for userId ${userId} at page ${pageName}`)
    return true
  } catch (err: any) {
    console.error('❌ Failed to record login log:', err.message)
    return false
  } finally {
    connection.release()
  }
}

// Export pool getter for advanced usage
export { getPool }
