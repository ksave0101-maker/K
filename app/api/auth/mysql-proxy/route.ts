import { NextResponse, NextRequest } from 'next/server'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 10

// Reuse pool across requests (module-level singleton)
let pool: mysql.Pool | null = null

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.MYSQL_HOST     || 'localhost',
      port:     parseInt(process.env.MYSQL_PORT || '3306'),
      user:     process.env.MYSQL_USER     || 'ksystem',
      password: process.env.MYSQL_PASSWORD || 'Ksave2025Admin',
      database: process.env.MYSQL_DATABASE || 'ksystem',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 5000,
      timezone: '+00:00',
    })
  }
  return pool
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, password, site } = body || {}

    if (!username || !password) {
      return NextResponse.json({ error: 'Please enter Username and Password' }, { status: 400 })
    }

    const connection = await getPool().getConnection()

    try {
      const [rows] = await connection.execute(
        `SELECT ul.userId, ul.userName, ul.name, ul.email, ul.site, ul.password, ul.typeID,
                ct.departmentID
         FROM user_list ul
         LEFT JOIN cus_type ct ON ul.typeID = ct.typeID
         WHERE ul.userName = ?
         LIMIT 1`,
        [username]
      )

      const users = rows as any[]

      if (users.length === 0) {
        return NextResponse.json({ error: 'Invalid Username, Password, or Site' }, { status: 401 })
      }

      const u = users[0]

      // Fetch employeeId separately (column may not exist if migration not run)
      let employeeId = ''
      try {
        const [eidRows] = await connection.execute(
          'SELECT employeeId FROM user_list WHERE userId = ? LIMIT 1',
          [u.userId]
        )
        employeeId = (eidRows as any[])?.[0]?.employeeId || ''
      } catch (_) { /* employeeId column not yet created */ }

      // Check password: bcrypt → MD5 → plaintext fallback
      let passwordMatches = false
      try {
        passwordMatches = await bcrypt.compare(password, u.password)
      } catch (e) {
        console.warn('bcrypt.compare threw an error in mysql-proxy, will try fallbacks', e)
        passwordMatches = false
      }

      if (!passwordMatches) {
        const md5Hash = crypto.createHash('md5').update(password).digest('hex')
        if (md5Hash === u.password) {
          passwordMatches = true
        } else if (password === u.password) {
          passwordMatches = true
        }
      }

      if (!passwordMatches) {
        return NextResponse.json({ error: 'Invalid Username, Password, or Site' }, { status: 401 })
      }

      const isSuperUser = u.typeID === 4 || u.typeID === 7 || u.userId === 1 || u.userId === 7

      if (!isSuperUser && site && u.site) {
        const allowedSites = u.site.split(',').map((s: string) => s.trim().toLowerCase())
        if (!allowedSites.includes(site.toLowerCase())) {
          return NextResponse.json({ error: 'Invalid Username, Password, or Site' }, { status: 401 })
        }
      } else if (!isSuperUser && site && !u.site) {
        return NextResponse.json({ error: 'Invalid Username, Password, or Site' }, { status: 401 })
      }

      // Record login log (non-blocking)
      connection.execute(
        `INSERT INTO U_log_login (userID, name, login_timestamp, page_log, create_by)
         VALUES (?, ?, NOW(), ?, 'Auto system')`,
        [u.userId, u.name, '/main-login']
      ).catch(() => {})

      console.log(`[mysql-proxy] login success for ${u.userName} (id=${u.userId})`)

      const token = Buffer.from(`${u.userId}-${Date.now()}-${Math.random()}`).toString('base64')

      return NextResponse.json({
        success: true,
        token,
        userId:       u.userId,
        username:     u.userName,
        name:         u.name         || '',
        email:        u.email        || '',
        site:         u.site         || '',
        typeID:       u.typeID,
        departmentID: u.departmentID || '',
        employeeId:   employeeId
      })

    } finally {
      connection.release()
    }

  } catch (err: any) {
    return NextResponse.json({ error: `Database connection failed: ${err.message}` }, { status: 500 })
  }
}
