import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, faceDescriptor, imageUrl } = body

    if (!userId) {
      return NextResponse.json({
        ok: false,
        error: 'userId is required'
      }, { status: 400 })
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Check if already checked in today
    const [existing] = await pool.query(
      'SELECT id, checkInTime FROM attendance_records WHERE userId = ? AND date = ?',
      [userId, today]
    )

    if ((existing as any[]).length > 0 && (existing as any[])[0].checkInTime) {
      return NextResponse.json({
        ok: false,
        error: 'คุณได้เช็คอินวันนี้แล้ว',
        alreadyCheckedIn: true
      }, { status: 400 })
    }

    const now = new Date()
    const checkInTime = now.toISOString().slice(0, 19).replace('T', ' ')

    // Insert or update attendance record
    if ((existing as any[]).length > 0) {
      await pool.query(
        'UPDATE attendance_records SET checkInTime = ?, checkInImage = ? WHERE id = ?',
        [checkInTime, imageUrl || null, (existing as any[])[0].id]
      )
    } else {
      await pool.query(
        'INSERT INTO attendance_records (userId, checkInTime, checkInImage, date) VALUES (?, ?, ?, ?)',
        [userId, checkInTime, imageUrl || null, today]
      )
    }

    // Get employee info
    const [empRows] = await pool.query(
      'SELECT name, name_th FROM user_list WHERE userId = ?',
      [userId]
    )

    const employee = (empRows as any[])[0]

    return NextResponse.json({
      ok: true,
      message: 'เช็คอินสำเร็จ',
      checkInTime,
      employee: {
        name: employee?.name,
        name_th: employee?.name_th
      }
    })

  } catch (error: any) {
    console.error('Check-in error:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to check in'
    }, { status: 500 })
  }
}
