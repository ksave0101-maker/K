import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')

    if (id) {
      const rows = await query('SELECT * FROM kr_orders WHERE id = ?', [id])
      return NextResponse.json(rows[0] || null)
    }

    let sql = 'SELECT * FROM kr_orders WHERE 1=1'
    const params: any[] = []
    if (status) { sql += ' AND status = ?'; params.push(status) }
    if (customerId) { sql += ' AND customerId = ?'; params.push(customerId) }
    sql += ' ORDER BY date DESC LIMIT 200'

    const rows = await query(sql, params)
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, date, product, quantity, total, status, tracking, customerId } = body
    await query(
      'INSERT INTO kr_orders (id, date, product, quantity, total, status, tracking, customerId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, date || new Date().toISOString().split('T')[0], product, quantity || 0, total || 0, status || 'Processing', tracking || null, customerId || null]
    )
    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
