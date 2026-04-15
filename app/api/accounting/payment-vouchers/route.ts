import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const vt = searchParams.get('voucher_type')
    const pt = searchParams.get('party_type')
    const q = searchParams.get('q')
    let sql = 'SELECT * FROM acc_payment_vouchers WHERE 1=1'
    const p: any[] = []
    if (vt) { sql += ' AND voucher_type=?'; p.push(vt) }
    if (pt) { sql += ' AND party_type=?'; p.push(pt) }
    if (q) { sql += ' AND (doc_no LIKE ? OR party_name LIKE ? OR description LIKE ?)'; const like = `%${q}%`; p.push(like, like, like) }
    sql += ' ORDER BY doc_date DESC, id DESC LIMIT 200'
    const [rows]: any = await pool.query(sql, p)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const prefix = b.voucher_type === 'receive' ? 'RV' : 'PV'
    const [cnt]: any = await pool.query('SELECT COUNT(*) as c FROM acc_payment_vouchers WHERE doc_no LIKE ?', [prefix + '-%'])
    const docNo = b.doc_no || `${prefix}-${String((cnt[0].c || 0) + 1).padStart(4, '0')}`
    const [r]: any = await pool.query(
      'INSERT INTO acc_payment_vouchers (doc_no,doc_date,voucher_type,party_type,party_id,party_name,amount,method,bank_acc_id,description,korea_invoice_id,status,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [docNo, b.doc_date, b.voucher_type || 'pay', b.party_type || 'supplier', b.party_id || null,
       b.party_name || null, b.amount || 0, b.method || 'cash', b.bank_acc_id || null,
       b.description || null, b.korea_invoice_id || null, b.status || 'draft', b.created_by || null])
    return NextResponse.json({ ok: true, id: r.insertId, doc_no: docNo })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query(
      'UPDATE acc_payment_vouchers SET doc_date=?,voucher_type=?,party_type=?,party_id=?,party_name=?,amount=?,method=?,bank_acc_id=?,description=?,korea_invoice_id=?,status=? WHERE id=?',
      [b.doc_date, b.voucher_type, b.party_type, b.party_id || null, b.party_name || null,
       b.amount || 0, b.method || 'cash', b.bank_acc_id || null, b.description || null, b.korea_invoice_id || null, b.status || 'draft', b.id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    await pool.query('DELETE FROM acc_payment_vouchers WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
