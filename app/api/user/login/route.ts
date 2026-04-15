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
        error: 'Please enter Username and Password'
      }, { status: 400 })
    }

    // Authenticate user (site is optional - if not provided, any site is accepted)
    const user = await authenticateUser(username, password, site || undefined)

    if (!user) {
      console.log('❌ Login failed: Invalid credentials or site')
      return NextResponse.json({
        error: 'Username, Password or Site is incorrect'
      }, { status: 401 })
    }

    // Record login log to database
    recordLoginLog(user.userId, pageName || "/sites").catch(() => {})

    // Generate simple token (JWT can be used for production)
    const token = Buffer.from(`${user.userId}-${Date.now()}-${Math.random()}`).toString('base64')

    console.log(`✅ Login successful: ${user.userName} (${user.name}) from ${user.site}`)

    const normalizedUsername = (user.userName || '').toString().trim().toLowerCase()
    const normalizedDeptId = (user.departmentID || '').toString().trim()
    const hasGlobalSuperAccess = normalizedUsername === 'pavinee' || normalizedDeptId === 'Executive'

    // Return success with user data
    return NextResponse.json({
      success: true,
      token,
      userId: user.userId,
      username: user.userName,
      name: user.name,
      email: user.email,
      site: user.site,
      typeID: hasGlobalSuperAccess ? 4 : user.typeID,
      departmentID: hasGlobalSuperAccess ? 'Executive' : user.departmentID,
      superAccess: hasGlobalSuperAccess
    })

  } catch (err: any) {
    console.error('❌ User login error:', err.message || err)
    console.error('❌ Full error stack:', err.stack || 'No stack trace')
    console.error('❌ Error details:', {
      name: err.name,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      message: err.message
    })
    return NextResponse.json({
      error: 'An error occurred during login. Please try again.',
      debug: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 })
  }
}
