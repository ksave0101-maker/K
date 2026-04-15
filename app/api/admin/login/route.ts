import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, recordLoginLog } from '@/lib/mysql-user'

export const runtime = 'nodejs'
export const maxDuration = 10

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, pageName } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Only allow 'admin' username for R&D System
    if (username.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Only admin users are allowed.' },
        { status: 403 }
      )
    }

    // Authenticate user (admin user)
    const user = await authenticateUser(username, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Record login log to database
    await recordLoginLog(user.userId, pageName || '/admin')

    // Generate a simple token (in production use JWT or proper session)
    const token = btoa(`${user.userName}:${user.userId}:${Date.now()}`)

    console.log(`✅ Admin login successful: ${user.userName} (${user.name})`)

    return NextResponse.json({
      success: true,
      token,
      message: 'Login successful',
      user: {
        id: user.userId,
        username: user.userName,
        fullname: user.name
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Database connection failed: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}