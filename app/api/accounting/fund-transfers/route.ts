import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const [rows]: any = await pool.query(
      `SELECT ft.*, fb.bank_name as from_bank, fb.account_no as from_account,
              tb.bank_name as to_bank, tb.account_no as to_account
       FROM acc_fund_transfers ft
       LEFT JOIN acc_bank_accounts fb ON ft.from_bank_id=fb.id
       LEFT JOIN acc_bank_accounts tb ON ft.to_bank_id=tb.id
       ORDER BY ft.transfer_date DESC, ft.id DESC LIMIT 200`)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const [cnt]: any = await pool.query('SELECT COUNT(*) as c FROM acc_fund_transfers')
    const docNo = b.doc_no || `FT-${String((cnt[0].c || 0) + 1).padStart(4, '0')}`
    const [r]: any = await pool.query(
      'INSERT INTO acc_fund_transfers (doc_no,transfer_date,from_bank_id,to_bank_id,amount,fee,description,status,created_by) VALUES (?,?,?,?,?,?,?,?,?)',
      [docNo, b.transfer_date, b.from_bank_id, b.to_bank_id, b.amount || 0, b.fee || 0, b.description || null, b.status || 'draft', b.created_by || null])
    return NextResponse.json({ ok: true, id: r.insertId, doc_no: docNo })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query(
      'UPDATE acc_fund_transfers SET transfer_date=?,from_bank_id=?,to_bank_id=?,amount=?,fee=?,description=?,status=? WHERE id=?',
      [b.transfer_date, b.from_bank_id, b.to_bank_id, b.amount || 0, b.fee || 0, b.description || null, b.status || 'draft', b.id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    await pool.query('DELETE FROM acc_fund_transfers WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
