import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 })
    }

    const [rows]: any = await pool.query(
      `SELECT ul.typeID, ct.TypeName as typeName, ct.departmentName
       FROM user_list ul
       LEFT JOIN cus_type ct ON ul.typeID = ct.typeID
       WHERE ul.userId = ?
       LIMIT 1`,
      [Number(userId)]
    )

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const row = rows[0]

    // Try to get employeeId separately — column may not exist yet (migration not run)
    let employeeId: string | null = null
    try {
      const [eidRows]: any = await pool.query(
        'SELECT employeeId FROM user_list WHERE userId = ? LIMIT 1',
        [Number(userId)]
      )
      employeeId = eidRows?.[0]?.employeeId || null
    } catch (_) { /* employeeId column not yet created — migration pending */ }

    return NextResponse.json({
      success: true,
      typeID: row.typeID,
      typeName: row.typeName || null,
      departmentName: row.departmentName || null,
      employeeId: employeeId || null,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
