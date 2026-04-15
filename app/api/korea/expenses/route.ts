import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const date = searchParams.get('date')
    const category = searchParams.get('category')

    let sql = 'SELECT * FROM kr_expenses WHERE 1=1'
    const params: any[] = []
    if (date) { sql += ' AND date = ?'; params.push(date) }
    else if (month) { sql += ' AND DATE_FORMAT(date, "%Y-%m") = ?'; params.push(month) }
    else if (year) { sql += ' AND YEAR(date) = ?'; params.push(year) }
    if (category) { sql += ' AND category = ?'; params.push(category) }
    sql += ' ORDER BY date DESC'

    const rows = await query(sql, params)
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { date, category, description, amount, paidBy, recipient, receipt } = body
    const result = await query(
      'INSERT INTO kr_expenses (date, category, description, amount, paidBy, recipient, receipt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [date, category, description || null, amount || 0, paidBy || null, recipient || null, receipt ? 1 : 0]
    )
    return NextResponse.json({ success: true, id: (result as any)[0]?.insertId || null })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await query('DELETE FROM kr_expenses WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
