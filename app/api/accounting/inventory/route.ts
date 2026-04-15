import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const mt = searchParams.get('move_type')
    const q = searchParams.get('q')
    let sql = 'SELECT m.*, p.name_th as product_name, p.code as product_code FROM acc_inventory_movements m LEFT JOIN acc_products p ON m.product_id=p.id WHERE 1=1'
    const params: any[] = []
    if (mt) { sql += ' AND m.move_type=?'; params.push(mt) }
    if (q) { sql += ' AND (m.doc_no LIKE ? OR p.name_th LIKE ? OR m.note LIKE ?)'; const like = `%${q}%`; params.push(like, like, like) }
    sql += ' ORDER BY m.move_date DESC, m.id DESC LIMIT 200'
    const [rows]: any = await pool.query(sql, params)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const prefix = (b.move_type === 'in' ? 'GR' : b.move_type === 'out' ? 'GI' : b.move_type === 'transfer' ? 'GT' : b.move_type === 'adjust' ? 'GA' : 'GC')
    const [cnt]: any = await pool.query('SELECT COUNT(*) as c FROM acc_inventory_movements WHERE doc_no LIKE ?', [prefix + '-%'])
    const docNo = b.doc_no || `${prefix}-${String((cnt[0].c || 0) + 1).padStart(4, '0')}`
    const [r]: any = await pool.query(
      'INSERT INTO acc_inventory_movements (doc_no,move_date,move_type,product_id,qty,ref_doc,note,created_by) VALUES (?,?,?,?,?,?,?,?)',
      [docNo, b.move_date, b.move_type || 'in', b.product_id, b.qty || 0, b.ref_doc || null, b.note || null, b.created_by || null])
    if (b.product_id && b.qty) {
      if (b.move_type === 'adjust') {
        await pool.query('UPDATE acc_products SET qty_onhand=? WHERE id=?', [b.qty, b.product_id])
      } else if (b.move_type === 'out') {
        await pool.query('UPDATE acc_products SET qty_onhand=qty_onhand-? WHERE id=?', [b.qty, b.product_id])
      } else {
        await pool.query('UPDATE acc_products SET qty_onhand=qty_onhand+? WHERE id=?', [b.qty, b.product_id])
      }
    }
    return NextResponse.json({ ok: true, id: r.insertId, doc_no: docNo })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query('UPDATE acc_inventory_movements SET move_date=?,move_type=?,product_id=?,qty=?,ref_doc=?,note=? WHERE id=?',
      [b.move_date, b.move_type, b.product_id, b.qty || 0, b.ref_doc || null, b.note || null, b.id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id')
    const [rows]: any = await pool.query('SELECT * FROM acc_inventory_movements WHERE id=?', [id])
    if (rows[0]) {
      const m = rows[0]
      if (m.product_id && m.qty) {
        if (m.move_type === 'out') await pool.query('UPDATE acc_products SET qty_onhand=qty_onhand+? WHERE id=?', [m.qty, m.product_id])
        else if (m.move_type !== 'adjust') await pool.query('UPDATE acc_products SET qty_onhand=qty_onhand-? WHERE id=?', [m.qty, m.product_id])
      }
    }
    await pool.query('DELETE FROM acc_inventory_movements WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
