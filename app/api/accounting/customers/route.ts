import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const q = searchParams.get('q')
    if (id) {
      const [rows]: any = await pool.query('SELECT * FROM acc_customers WHERE id = ?', [id])
      return NextResponse.json({ ok: true, data: rows[0] || null })
    }
    let sql = 'SELECT * FROM acc_customers'
    const params: any[] = []
    if (q) { sql += ' WHERE name_th LIKE ? OR code LIKE ? OR tax_id LIKE ?'; const like = `%${q}%`; params.push(like, like, like) }
    sql += ' ORDER BY id DESC'
    const [rows]: any = await pool.query(sql, params)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const [countRows]: any = await pool.query("SELECT COUNT(*) as cnt FROM acc_customers")
    const code = b.code || `CUS-${String((countRows[0].cnt || 0) + 1).padStart(4, '0')}`
    const [r]: any = await pool.query(
      `INSERT INTO acc_customers (code,name_th,name_en,tax_id,contact_name,phone,email,address,credit_days,credit_limit,is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [code, b.name_th, b.name_en||null, b.tax_id||null, b.contact_name||null, b.phone||null, b.email||null, b.address||null, b.credit_days||30, b.credit_limit||0, 1]
    )
    return NextResponse.json({ ok: true, id: r.insertId })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query(
      `UPDATE acc_customers SET name_th=?,name_en=?,tax_id=?,contact_name=?,phone=?,email=?,address=?,credit_days=?,credit_limit=?,is_active=? WHERE id=?`,
      [b.name_th, b.name_en||null, b.tax_id||null, b.contact_name||null, b.phone||null, b.email||null, b.address||null, b.credit_days||30, b.credit_limit||0, b.is_active??1, b.id]
    )
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await pool.query('DELETE FROM acc_customers WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
