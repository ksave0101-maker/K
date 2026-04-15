import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const q = new URL(req.url).searchParams.get('q')
    let sql = 'SELECT * FROM acc_bank_accounts'
    const p: any[] = []
    if (q) { sql += ' WHERE bank_name LIKE ? OR account_no LIKE ? OR account_name LIKE ?'; const like = `%${q}%`; p.push(like, like, like) }
    sql += ' ORDER BY bank_name'
    const [rows]: any = await pool.query(sql, p)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const [r]: any = await pool.query(
      'INSERT INTO acc_bank_accounts (account_no,account_name,bank_name,branch,account_type,balance,acc_code) VALUES (?,?,?,?,?,?,?)',
      [b.account_no, b.account_name, b.bank_name, b.branch || null, b.account_type || 'savings', b.balance || 0, b.acc_code || null])
    return NextResponse.json({ ok: true, id: r.insertId })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query(
      'UPDATE acc_bank_accounts SET account_no=?,account_name=?,bank_name=?,branch=?,account_type=?,balance=?,acc_code=? WHERE id=?',
      [b.account_no, b.account_name, b.bank_name, b.branch || null, b.account_type || 'savings', b.balance || 0, b.acc_code || null, b.id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    await pool.query('DELETE FROM acc_bank_accounts WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
