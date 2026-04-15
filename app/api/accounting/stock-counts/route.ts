import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (id) {
      const [rows]: any = await pool.query('SELECT * FROM acc_stock_counts WHERE id=?', [id])
      const [items]: any = await pool.query(
        'SELECT sci.*, p.name_th as product_name, p.code as product_code FROM acc_stock_count_items sci LEFT JOIN acc_products p ON sci.product_id=p.id WHERE sci.count_id=?', [id])
      return NextResponse.json({ ok: true, data: { ...(rows[0] || {}), items } })
    }
    const [rows]: any = await pool.query('SELECT sc.*, (SELECT COUNT(*) FROM acc_stock_count_items WHERE count_id=sc.id) as item_count FROM acc_stock_counts sc ORDER BY sc.count_date DESC, sc.id DESC LIMIT 200')
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const [cnt]: any = await pool.query('SELECT COUNT(*) as c FROM acc_stock_counts')
    const docNo = b.doc_no || `SC-${String((cnt[0].c || 0) + 1).padStart(4, '0')}`
    const [r]: any = await pool.query(
      'INSERT INTO acc_stock_counts (doc_no,count_date,status,note,created_by) VALUES (?,?,?,?,?)',
      [docNo, b.count_date, b.status || 'draft', b.note || null, b.created_by || null])
    const countId = r.insertId
    for (const item of (b.items || [])) {
      const diff = (item.actual_qty || 0) - (item.system_qty || 0)
      await pool.query(
        'INSERT INTO acc_stock_count_items (count_id,product_id,system_qty,actual_qty,difference) VALUES (?,?,?,?,?)',
        [countId, item.product_id, item.system_qty || 0, item.actual_qty || 0, diff])
    }
    return NextResponse.json({ ok: true, id: countId, doc_no: docNo })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query('UPDATE acc_stock_counts SET count_date=?,status=?,note=? WHERE id=?',
      [b.count_date, b.status || 'draft', b.note || null, b.id])
    if (b.items !== undefined) {
      await pool.query('DELETE FROM acc_stock_count_items WHERE count_id=?', [b.id])
      for (const item of (b.items || [])) {
        const diff = (item.actual_qty || 0) - (item.system_qty || 0)
        await pool.query(
          'INSERT INTO acc_stock_count_items (count_id,product_id,system_qty,actual_qty,difference) VALUES (?,?,?,?,?)',
          [b.id, item.product_id, item.system_qty || 0, item.actual_qty || 0, diff])
      }
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    await pool.query('DELETE FROM acc_stock_counts WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
