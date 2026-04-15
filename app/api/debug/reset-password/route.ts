import { NextResponse, NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPool } from '@/lib/mysql-user'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    if (process.env.DEBUG_ALLOW_PASSWORD_RESET !== 'true') {
      return NextResponse.json({ error: 'Password reset disabled. Enable DEBUG_ALLOW_PASSWORD_RESET=true' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const { userId, newPassword } = body || {}

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'userId and newPassword required' }, { status: 400 })
    }

    const hashed = bcrypt.hashSync(newPassword, 10)

    const pool = getPool()
    const conn = await pool.getConnection()
    try {
      await conn.execute('UPDATE user_list SET password = ? WHERE userId = ?', [hashed, Number(userId)])
      console.log(`[DEBUG] Password updated for userId ${userId}`)
      return NextResponse.json({ success: true })
    } finally {
      conn.release()
    }
  } catch (err: any) {
    console.error('❌ Reset password error:', err.message || err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
