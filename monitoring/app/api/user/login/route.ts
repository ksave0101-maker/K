import { NextResponse, NextRequest } from 'next/server'
import { authenticateUser, recordLoginLog } from '@/lib/mysql-user'

export const runtime = 'nodejs'
export const maxDuration = 10 // Maximum duration for Vercel serverless function (seconds)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, password, site, pageName } = body || {}

    console.log('📝 User login attempt:', { username, site, pageName })

    // Validate input
    if (!username || !password) {
      return NextResponse.json({
        error: 'กรุณากรอก Username และ Password'
      }, { status: 400 })
    }

    if (!site) {
      return NextResponse.json({
        error: 'กรุณากรอก Site / Branch'
      }, { status: 400 })
    }

    // Authenticate user
    const user = await authenticateUser(username, password, site)

    if (!user) {
      console.log('❌ Login failed: Invalid credentials or site')
      return NextResponse.json({
        error: 'Username, Password หรือ Site ไม่ถูกต้อง'
      }, { status: 401 })
    }

    // Record login log to database
    await recordLoginLog(user.userId, pageName || '/sites')

    // Generate simple token (JWT can be used for production)
    const token = Buffer.from(`${user.userId}-${Date.now()}-${Math.random()}`).toString('base64')

    console.log(`✅ Login successful: ${user.userName} (${user.name}) from ${user.site}`)

    // Return success with user data
    return NextResponse.json({
      success: true,
      token,
      userId: user.userId,
      username: user.userName,
      name: user.name,
      email: user.email,
      site: user.site,
      typeID: user.typeID
    })

  } catch (err: any) {
    console.error('❌ User login error:', err.message || err)
    return NextResponse.json({
      error: 'An error occurred during login. Please try again.'
    }, { status: 500 })
  }
}
