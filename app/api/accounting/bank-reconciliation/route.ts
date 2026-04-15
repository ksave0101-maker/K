import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const [rows]: any = await pool.query(
      `SELECT br.*, ba.bank_name, ba.account_no
       FROM acc_bank_reconciliation br
       LEFT JOIN acc_bank_accounts ba ON br.bank_acc_id=ba.id
       ORDER BY br.recon_date DESC, br.id DESC LIMIT 200`)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const diff = (b.statement_balance || 0) - (b.book_balance || 0)
    const [r]: any = await pool.query(
      'INSERT INTO acc_bank_reconciliation (bank_acc_id,recon_date,statement_balance,book_balance,difference,status,note,created_by) VALUES (?,?,?,?,?,?,?,?)',
      [b.bank_acc_id, b.recon_date, b.statement_balance || 0, b.book_balance || 0, diff, b.status || 'draft', b.note || null, b.created_by || null])
    return NextResponse.json({ ok: true, id: r.insertId })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    const diff = (b.statement_balance || 0) - (b.book_balance || 0)
    await pool.query(
      'UPDATE acc_bank_reconciliation SET bank_acc_id=?,recon_date=?,statement_balance=?,book_balance=?,difference=?,status=?,note=? WHERE id=?',
      [b.bank_acc_id, b.recon_date, b.statement_balance || 0, b.book_balance || 0, diff, b.status || 'draft', b.note || null, b.id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    await pool.query('DELETE FROM acc_bank_reconciliation WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
