import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, imageUrl } = body

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
      'SELECT id, checkInTime, checkOutTime FROM attendance_records WHERE userId = ? AND date = ?',
      [userId, today]
    )

    if ((existing as any[]).length === 0 || !(existing as any[])[0].checkInTime) {
      return NextResponse.json({
        ok: false,
        error: 'กรุณาเช็คอินก่อน',
        notCheckedIn: true
      }, { status: 400 })
    }

    if ((existing as any[])[0].checkOutTime) {
      return NextResponse.json({
        ok: false,
        error: 'คุณได้เช็คเอาท์วันนี้แล้ว',
        alreadyCheckedOut: true
      }, { status: 400 })
    }

    const now = new Date()
    const checkOutTime = now.toISOString().slice(0, 19).replace('T', ' ')

    // Update attendance record
    await pool.query(
      'UPDATE attendance_records SET checkOutTime = ?, checkOutImage = ? WHERE id = ?',
      [checkOutTime, imageUrl || null, (existing as any[])[0].id]
    )

    // Get employee info
    const [empRows] = await pool.query(
      'SELECT name, name_th FROM user_list WHERE userId = ?',
      [userId]
    )

    const employee = (empRows as any[])[0]

    return NextResponse.json({
      ok: true,
      message: 'เช็คเอาท์สำเร็จ',
      checkOutTime,
      checkInTime: (existing as any[])[0].checkInTime,
      employee: {
        name: employee?.name,
        name_th: employee?.name_th
      }
    })

  } catch (error: any) {
    console.error('Check-out error:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to check out'
    }, { status: 500 })
  }
}
