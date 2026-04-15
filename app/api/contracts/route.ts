import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { RowDataPacket } from 'mysql2'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const search = searchParams.get('search')

    let sql = 'SELECT * FROM contracts WHERE status = "active"'
    const params: any[] = []

    if (id) {
      sql = 'SELECT * FROM contracts WHERE contractID = ?'
      params.push(id)
    } else if (search) {
      sql += ' AND (contractNo LIKE ? OR customer_name LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    sql += ' ORDER BY contract_date DESC LIMIT 100'

    const [rows] = await pool.query<RowDataPacket[]>(sql, params)

    return NextResponse.json({ success: true, data: rows })
  } catch (error: any) {
    console.error('GET /api/contracts error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
