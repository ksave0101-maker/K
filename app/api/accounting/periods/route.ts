import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET() {
  try {
    const [rows]: any = await pool.query('SELECT * FROM acc_periods ORDER BY year DESC, period_num ASC')
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const [r]: any = await pool.query(
      'INSERT INTO acc_periods (year,period_num,name_th,date_start,date_end) VALUES (?,?,?,?,?)',
      [b.year, b.period_num, b.name_th, b.date_start, b.date_end])
    return NextResponse.json({ ok: true, id: r.insertId })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query(
      'UPDATE acc_periods SET year=?,period_num=?,name_th=?,date_start=?,date_end=?,is_closed=?,closed_at=?,closed_by=? WHERE id=?',
      [b.year, b.period_num, b.name_th, b.date_start, b.date_end, b.is_closed || 0, b.closed_at || null, b.closed_by || null, b.id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    const [rows]: any = await pool.query('SELECT is_closed FROM acc_periods WHERE id=?', [id])
    if (rows[0]?.is_closed) return NextResponse.json({ ok: false, error: 'Cannot delete closed period' }, { status: 400 })
    await pool.query('DELETE FROM acc_periods WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
