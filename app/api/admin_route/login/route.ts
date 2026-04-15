import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// ⚠️ Changed from 'edge' to 'nodejs' to support PostgreSQL
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10

const INFLUX_BASE = process.env.INFLUX_URL || process.env.INFLUX_HOST || 'http://localhost:8086'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, password } = body || {}

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 })
    }

    // Query database for admin user authentication from 'user_list' table
    try {
      const users = await query(
        'SELECT userId, userName, password, name, email, site, typeID FROM user_list WHERE TRIM(userName) = ? LIMIT 1',
        [username.trim()]
      ) as any[]

      if (!users || users.length === 0) {
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
      }

      const user = users[0]

      // Check password (supports bcrypt, MD5 hashes, and plain text)
      let passwordMatches = false

      // Try bcrypt first (bcrypt.compare returns false for non-matching hashes
      // and may throw if the stored password is not a bcrypt hash). If it
      // returns false we should still attempt MD5/plain-text fallbacks.
      try {
        passwordMatches = await bcrypt.compare(password, user.password)
      } catch (e) {
        console.warn('bcrypt.compare threw an error, will try legacy fallbacks', e)
        passwordMatches = false
      }

      // If bcrypt didn't match, attempt MD5 then plain-text fallback for
      // legacy accounts.
      if (!passwordMatches) {
        const md5Hash = crypto.createHash('md5').update(password).digest('hex')
        if (md5Hash === user.password) {
          passwordMatches = true
        } else if (password === user.password) {
          passwordMatches = true
        }
      }

      if (!passwordMatches) {
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
      }

      // Verify InfluxDB is reachable (health endpoint)
      try {
        const healthRes = await fetch(`${INFLUX_BASE}/health`)
        if (!healthRes.ok) {
          console.warn('⚠️ InfluxDB health check failed, but proceeding with login')
        }
      } catch (e) {
        console.warn('⚠️ Failed to reach InfluxDB, but proceeding with login')
      }

      const token = `admin-token-${user.userId}-${Date.now()}`
      return NextResponse.json({
        token,
        username: user.userName,
        userId: user.userId,
        name: user.name,
        typeID: user.typeID
      })

    } catch (dbError: any) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        error: 'Database connection failed: ' + (dbError?.message || 'Unknown error')
      }, { status: 500 })
    }

  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json({
      error: 'Server error: ' + (err?.message || 'Unknown error')
    }, { status: 500 })
  }
}
