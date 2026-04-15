import { NextResponse, NextRequest } from 'next/server'
import mysql from 'mysql2/promise'

export const runtime = 'nodejs'
export const maxDuration = 10

/**
 * MySQL Proxy API for Vercel
 * This endpoint connects directly to MySQL and authenticates users
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, password, site } = body || {}

    console.log('📝 MySQL Proxy authentication attempt:', { username, site })

    // Validate input
    if (!username || !password) {
      return NextResponse.json({
        error: 'Please enter Username and Password'
      }, { status: 400 })
    }

    if (!site) {
      return NextResponse.json({
        error: 'Please enter Site / Branch'
      }, { status: 400 })
    }

    // Database configuration
    const host = process.env.MYSQL_HOST || 'localhost'
    const port = parseInt(process.env.MYSQL_PORT || '3307')
    const user = process.env.MYSQL_USER || 'ksystem'
    const pass = process.env.MYSQL_PASSWORD || 'Ksave2025Admin'
    const database = process.env.MYSQL_DATABASE || 'ksystem'

    console.log('🔍 MySQL Config:', { host, port, user, database, password_set: !!pass })

    // Create connection
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password: pass,
      database,
      connectTimeout: 10000,
      timezone: '+00:00'
    })

    try {
      // Query user
      const [rows] = await connection.execute(
        `SELECT userId, userName, name, email, site, password, typeID
         FROM user_list
         WHERE userName = ?
         LIMIT 1`,
        [username]
      )

      const users = rows as any[]

      if (users.length === 0) {
        console.log('❌ User not found:', username)
        return NextResponse.json({
          error: 'Invalid Username, Password, or Site'
        }, { status: 401 })
      }

      const userRecord = users[0]

      // Check password
      if (userRecord.password !== password) {
        console.log('❌ Invalid password for user:', username)
        return NextResponse.json({
          error: 'Invalid Username, Password, or Site'
        }, { status: 401 })
      }

      // Check site (case-insensitive)
      if (site && userRecord.site) {
        if (userRecord.site.toLowerCase() !== site.toLowerCase()) {
          console.log('❌ Site mismatch:', { provided: site, expected: userRecord.site })
          return NextResponse.json({
            error: 'Invalid Username, Password, or Site'
          }, { status: 401 })
        }
      } else if (site && !userRecord.site) {
        console.log('❌ User has no site but site is required')
        return NextResponse.json({
          error: 'Invalid Username, Password, or Site'
        }, { status: 401 })
      }

      // Record login log
      try {
        await connection.execute(
          `INSERT INTO U_log_login (userID, name, login_timestamp, page_log, create_by)
           VALUES (?, ?, NOW(), ?, 'Auto system')`,
          [userRecord.userId, userRecord.name, '/main-login']
        )
        console.log('✅ Login log recorded for userId:', userRecord.userId)
      } catch (err: any) {
        console.error('⚠️ Failed to record login log:', err.message)
        // Don't fail authentication if logging fails
      }

      // Generate token
      const token = Buffer.from(`${userRecord.userId}-${Date.now()}-${Math.random()}`).toString('base64')

      console.log(`✅ Authentication successful: ${userRecord.userName} from ${userRecord.site}`)

      // Return success response
      return NextResponse.json({
        success: true,
        token,
        userId: userRecord.userId,
        username: userRecord.userName,
        name: userRecord.name || '',
        email: userRecord.email || '',
        site: userRecord.site || '',
        typeID: userRecord.typeID
      })

    } finally {
      await connection.end()
    }

  } catch (err: any) {
    console.error('❌ MySQL Proxy error:', err.message)
    return NextResponse.json({
      error: `Database connection failed: ${err.message}`
    }, { status: 500 })
  }
}
