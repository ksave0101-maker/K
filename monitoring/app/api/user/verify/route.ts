import { NextResponse, NextRequest } from 'next/server'
import { getUserById } from '@/lib/mysql-user'

export const runtime = 'nodejs'
export const maxDuration = 10

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { userId } = body || {}

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const user = await getUserById(Number(userId))

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return minimal user data (no sensitive fields)
    return NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        userName: user.userName,
        name: user.name || '',
        email: user.email || '',
        site: user.site || '',
        typeID: user.typeID
      }
    })
  } catch (err: any) {
    console.error('❌ User verify error:', err.message || err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
