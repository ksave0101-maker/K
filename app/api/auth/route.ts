import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

// Changed to nodejs to support MySQL
export const runtime = 'nodejs'
export const maxDuration = 10

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, password } = body || {}

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 })
    }

    // Check username/password from MySQL database table 'users'
    try {
      const users = await query(
        'SELECT id, username, password, full_name FROM users WHERE username = ? LIMIT 1',
        [username]
      ) as any[]

      if (!users || users.length === 0) {
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
      }

      const user = users[0]

      // Check password (currently storing as plain - should use bcrypt in production)
      // WARNING: Storing passwords as plain text is NOT secure for production!
      if (password !== user.password) {
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
      }

      // Login successful - create token
      const token = `user-token-${user.id}-${Date.now()}`

      return NextResponse.json({
        token,
        username: user.username,
        userId: user.id,
        fullName: user.full_name
      })

    } catch (dbError: any) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        error: 'Database connection failed: ' + (dbError?.message || 'Unknown error')
      }, { status: 500 })
    }

  } catch (err: any) {
    console.error('Auth error:', err)
    return NextResponse.json({
      error: 'Server error: ' + (err?.message || 'Unknown error')
    }, { status: 500 })
  }
}
