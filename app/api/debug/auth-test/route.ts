import { NextResponse, NextRequest } from 'next/server'
import { queryUser } from '@/lib/mysql-user'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, password } = body || {}

    if (!username || !password) {
      return NextResponse.json({ error: 'username and password required' }, { status: 400 })
    }

    const sql = `
      SELECT ul.userId, ul.userName, ul.password, ul.name, ul.email, ul.site, ul.typeID,
             ct.departmentID
      FROM user_list ul
      LEFT JOIN cus_type ct ON ul.typeID = ct.typeID
      WHERE ul.userName = ?
      LIMIT 1
    `

    const rows = await queryUser(sql, [username])

    if (!rows || rows.length === 0) {
      return NextResponse.json({ userExists: false })
    }

    const user = rows[0]
    const hash = user.password || ''
    const passwordMatches = await bcrypt.compare(password, hash)

    const safeUser = {
      userId: user.userId,
      userName: user.userName,
      name: user.name || '',
      email: user.email || '',
      site: user.site || '',
      typeID: user.typeID,
      departmentID: user.departmentID || ''
    }

    return NextResponse.json({
      userExists: true,
      passwordMatches,
      user: safeUser,
      hashedPassword: process.env.DEBUG_SHOW_HASH === 'true' ? hash : undefined
    })
  } catch (err: any) {
    console.error('❌ Debug auth error:', err.message || err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
