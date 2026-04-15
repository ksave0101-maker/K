import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryUser } from '@/lib/mysql-user'

export const runtime = 'nodejs'

/**
 * Temporary debug endpoint to reset the password for user `pavinee`.
 * Protect this endpoint by setting DEBUG_SECRET in the environment on the server
 * and sending the same value in the `x-debug-token` request header.
 *
 * Request body: { "password": "newPlainPassword" }
 */
export async function POST(req: Request) {
  try {
    const token = req.headers.get('x-debug-token') || ''
    const secret = process.env.DEBUG_SECRET || ''

    if (!secret || token !== secret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { password } = body as any

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'missing_password' }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 10)

    await queryUser('UPDATE user_list SET password = ? WHERE TRIM(userName) = ?', [hash, 'pavinee'])

    return NextResponse.json({ ok: true, message: 'password reset' })
  } catch (err: any) {
    console.error('reset-pavinee error:', err)
    return NextResponse.json({ error: 'server_error', message: err?.message || String(err) }, { status: 500 })
  }
}
