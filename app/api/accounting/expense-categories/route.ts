import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const q = new URL(req.url).searchParams.get('q')
    let sql = 'SELECT * FROM acc_expense_categories'
    const p: any[] = []
    if (q) { sql += ' WHERE code LIKE ? OR name_th LIKE ? OR name_en LIKE ?'; const like = `%${q}%`; p.push(like, like, like) }
    sql += ' ORDER BY code'
    const [rows]: any = await pool.query(sql, p)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const [cnt]: any = await pool.query('SELECT COUNT(*) as c FROM acc_expense_categories')
    const code = b.code || `EX${String((cnt[0].c || 0) + 1).padStart(2, '0')}`
    const [r]: any = await pool.query(
      'INSERT INTO acc_expense_categories (code,name_th,name_en,acc_code) VALUES (?,?,?,?)',
      [code, b.name_th, b.name_en || null, b.acc_code || null])
    return NextResponse.json({ ok: true, id: r.insertId })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query('UPDATE acc_expense_categories SET code=?,name_th=?,name_en=?,acc_code=?,is_active=? WHERE id=?',
      [b.code, b.name_th, b.name_en || null, b.acc_code || null, b.is_active ?? 1, b.id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    await pool.query('DELETE FROM acc_expense_categories WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
