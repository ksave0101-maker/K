import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Create MySQL connection pool for user database (lazy initialization)
// Support both MYSQL_* and MYSQL_USER_* environment variables
let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    // Debug: Log environment variables only when pool is created
    if (process.env.NODE_ENV !== 'production') {
  
    }

    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || process.env.MYSQL_USER_HOST || '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || process.env.MYSQL_USER_PORT || '3306'),
      user: process.env.MYSQL_USER || process.env.MYSQL_USER_USER || 'ksystem',
      password: process.env.MYSQL_PASSWORD || process.env.MYSQL_USER_PASSWORD || 'Ksave2025Admin',
      database: process.env.MYSQL_DATABASE || process.env.MYSQL_USER_DATABASE || 'ksystem',
      waitForConnections: true,
      connectionLimit: 3,
      queueLimit: 10,
      maxIdle: 2, // Keep only 2 idle connections
      idleTimeout: 30000, // Close idle connections after 30 seconds
      timezone: '+00:00',
      connectTimeout: 10000, // 10 second timeout for Vercel
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
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
  departmentID: string
} | null> {
  // Check if we should use internal MySQL proxy API (for Vercel deployment)
  const useProxy = process.env.USE_MYSQL_PROXY === 'true'

  if (useProxy) {
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
          typeID: data.typeID,
          departmentID: data.departmentID || ''
        }
      }

      return null
    } catch (error: any) {
      console.error('Proxy auth error:', error.message)
    }
  }

  // Use direct MySQL connection
  const sql = `
    SELECT ul.userId, ul.userName, ul.name, ul.email, ul.site, ul.password, ul.typeID,
           ct.departmentID
    FROM user_list ul
    LEFT JOIN cus_type ct ON ul.typeID = ct.typeID
     WHERE LOWER(TRIM(ul.userName)) = LOWER(?)
       OR LOWER(TRIM(COALESCE(ul.email, ''))) = LOWER(?)
    LIMIT 1
  `

  const connection = await getPool().getConnection()

  try {
    const loginInput = username.trim()
    const [rows] = await connection.execute(sql, [loginInput, loginInput])
    const users = rows as any[]

    if (users.length === 0) {
      console.log('[AUTH] No user found for', username);
      return null;
    }

    const user = users[0];
    console.log('[AUTH] User record:', user);

    // Check if password matches (supports bcrypt, MD5, and plaintext)
    const storedPassword = user.password || '';
    let passwordMatches = false;

    // Try bcrypt first
    try {
      passwordMatches = await bcrypt.compare(password, storedPassword);
    } catch (err: any) {
      passwordMatches = false;
    }

    if (!passwordMatches) {
      // Try MD5
      const md5Hash = crypto.createHash('md5').update(password).digest('hex');
      if (md5Hash === storedPassword) {
        passwordMatches = true;
        console.log('[AUTH] Password verified with MD5 for', username);
      } else {
        // Fallback: if stored password appears to be plaintext and matches input, accept and upgrade to bcrypt
        const looksLikeHash = typeof storedPassword === 'string' && /^\$2[aby]\$/.test(storedPassword);
        if (!looksLikeHash && storedPassword === password) {
          passwordMatches = true;
          try {
            const newHash = await bcrypt.hash(password, 10);
            // Update password hash in DB (non-blocking but await to ensure consistency)
            await connection.execute('UPDATE user_list SET password = ? WHERE userId = ?', [newHash, user.userId]);
            console.log('[AUTH] Upgraded plaintext password to bcrypt for', username);
          } catch (err: any) {
            console.error('[AUTH] Failed to upgrade password hash for', username, (err && (err as any).message) || err);
          }
        } else {
          console.log('[AUTH] Password mismatch for', username);
          return null;
        }
      }
    }

    // Super users (typeID 4/7/18 or userId 1/7 or site contains 'admin') bypass site check
    const siteValue = (user.site || '').toString().toLowerCase();
    console.log('[AUTH] siteValue:', siteValue, 'input site:', site);
    const isSuperUser = user.typeID === 4 || user.typeID === 7 || user.typeID === 18
      || user.userId === 1 || user.userId === 7
      || siteValue.includes('admin');
    console.log('[AUTH] isSuperUser:', isSuperUser);

    // If site is provided, check if it matches (supports comma-separated sites in DB)
    if (!isSuperUser && site && user.site) {
      const allowedSites = user.site.split(',').map((s: string) => s.trim().toLowerCase());
      console.log('[AUTH] allowedSites:', allowedSites);
      if (!allowedSites.includes(site.trim().toLowerCase())) {
        console.log('[AUTH] Site mismatch for', username, 'allowed:', allowedSites, 'input:', site);
        return null;
      }
    } else if (!isSuperUser && site && !user.site) {
      // User has no site in database but site is required
      console.log('[AUTH] Site required but missing in DB for', username);
      return null;
    }

    // Return user data (without password)
    return {
      userId: user.userId,
      userName: user.userName,
      name: user.name || '',
      email: user.email || '',
      site: user.site || '',
      typeID: user.typeID,
      departmentID: user.departmentID || ''
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
