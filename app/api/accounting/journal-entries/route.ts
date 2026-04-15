import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (id) {
      const [rows]: any = await pool.query('SELECT * FROM acc_journal_entries WHERE id=?', [id])
      const [lines]: any = await pool.query('SELECT * FROM acc_journal_lines WHERE entry_id=? ORDER BY id', [id])
      return NextResponse.json({ ok: true, data: { ...(rows[0] || {}), lines } })
    }
    const [rows]: any = await pool.query('SELECT * FROM acc_journal_entries ORDER BY doc_date DESC, id DESC LIMIT 200')
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const year = new Date().getFullYear()
    const prefix = 'JE'
    const [cnt]: any = await pool.query(
      'SELECT COUNT(*) as c FROM acc_journal_entries WHERE doc_no LIKE ?',
      [prefix + '-' + year + '-%'])
    const docNo = b.doc_no || (prefix + '-' + year + '-' + String((cnt[0].c || 0) + 1).padStart(4, '0'))
    const [r]: any = await pool.query(
      'INSERT INTO acc_journal_entries (doc_no,doc_date,description,status,ref_type,ref_id,created_by) VALUES (?,?,?,?,?,?,?)',
      [docNo, b.doc_date, b.description || null, b.status || 'draft', b.ref_type || null, b.ref_id || null, b.created_by || null])
    const entryId = r.insertId
    for (const line of (b.lines || [])) {
      await pool.query(
        'INSERT INTO acc_journal_lines (entry_id,acc_code,description,debit,credit) VALUES (?,?,?,?,?)',
        [entryId, line.acc_code, line.description || null, line.debit || 0, line.credit || 0])
    }
    return NextResponse.json({ ok: true, id: entryId, doc_no: docNo })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query(
      'UPDATE acc_journal_entries SET doc_date=?,description=?,status=? WHERE id=?',
      [b.doc_date, b.description || null, b.status || 'draft', b.id])
    if (b.lines !== undefined) {
      await pool.query('DELETE FROM acc_journal_lines WHERE entry_id=?', [b.id])
      for (const line of (b.lines || [])) {
        await pool.query(
          'INSERT INTO acc_journal_lines (entry_id,acc_code,description,debit,credit) VALUES (?,?,?,?,?)',
          [b.id, line.acc_code, line.description || null, line.debit || 0, line.credit || 0])
      }
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
