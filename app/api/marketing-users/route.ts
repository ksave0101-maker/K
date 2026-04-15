import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-pool'

// GET - ดึงรายชื่อ users ที่สามารถใช้งาน Marketing ได้
export async function GET(request: NextRequest) {
  try {
    // ดึงเฉพาะ users ที่มีสิทธิ์ใช้งาน Marketing
    // typeID: 0 = Admin, 1 = Executive, 16 = M_Marketing, 17 = Marketing, 18 = pavinee, 19 = Branch Manager
    const users = await query<any[]>(
      `SELECT userId, userName, name, typeID, email
      FROM user_list
      WHERE typeID IN (0, 1, 16, 17, 18, 19)
      ORDER BY name ASC`
    )

    return NextResponse.json({ success: true, users })
  } catch (error: any) {
    console.error('Get marketing users error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: error.message },
      { status: 500 }
    )
  }
}
