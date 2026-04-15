import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const docType = searchParams.get('doc_type')
    const search = searchParams.get('q')

    if (id) {
      const [rows]: any = await pool.query(
        'SELECT si.*, c.name_th as customer_name FROM acc_sales_invoices si LEFT JOIN acc_customers c ON si.customer_id = c.id WHERE si.id = ?',
        [id])
      const [items]: any = await pool.query(
        'SELECT sii.*, p.name_th as product_name FROM acc_sales_invoice_items sii LEFT JOIN acc_products p ON sii.product_id = p.id WHERE sii.inv_id = ?',
        [id])
      return NextResponse.json({ ok: true, data: { ...(rows[0] || {}), items } })
    }

    // Build query with filters
    let query = 'SELECT si.*, c.name_th as customer_name FROM acc_sales_invoices si LEFT JOIN acc_customers c ON si.customer_id = c.id WHERE 1=1'
    const params: any[] = []

    // Filter by doc_type
    if (docType) {
      query += ' AND si.doc_type = ?'
      params.push(docType)
    }

    // Filter by search term
    if (search) {
      query += ' AND (si.doc_no LIKE ? OR c.name_th LIKE ? OR si.note LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY si.doc_date DESC, si.id DESC LIMIT 200'

    const [rows]: any = await pool.query(query, params)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const year = new Date().getFullYear()
    const prefix = 'INV'
    const [cnt]: any = await pool.query(
      'SELECT COUNT(*) as c FROM acc_sales_invoices WHERE doc_no LIKE ?',
      [prefix + '-' + year + '-%'])
    const docNo = b.doc_no || (prefix + '-' + year + '-' + String((cnt[0].c || 0) + 1).padStart(4, '0'))
    const [r]: any = await pool.query(
      'INSERT INTO acc_sales_invoices (doc_no,doc_date,customer_id,doc_type,status,due_date,subtotal,discount,vat_amount,total,paid_amount,note,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [docNo, b.doc_date, b.customer_id || null, b.doc_type || 'credit', b.status || 'draft',
       b.due_date || null, b.subtotal || 0, b.discount || 0, b.vat_amount || 0,
       b.total || 0, b.paid_amount || 0, b.note || null, b.created_by || null])
    const invId = r.insertId
    for (const item of (b.items || [])) {
      await pool.query(
        'INSERT INTO acc_sales_invoice_items (inv_id,product_id,description,qty,unit,unit_price,amount) VALUES (?,?,?,?,?,?,?)',
        [invId, item.product_id || null, item.description || null, item.qty || 1, item.unit || null, item.unit_price || 0, item.amount || 0])
    }
    return NextResponse.json({ ok: true, id: invId, doc_no: docNo })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query(
      'UPDATE acc_sales_invoices SET doc_date=?,customer_id=?,doc_type=?,status=?,due_date=?,subtotal=?,discount=?,vat_amount=?,total=?,paid_amount=?,note=? WHERE id=?',
      [b.doc_date, b.customer_id || null, b.doc_type || 'credit', b.status || 'draft',
       b.due_date || null, b.subtotal || 0, b.discount || 0, b.vat_amount || 0,
       b.total || 0, b.paid_amount || 0, b.note || null, b.id])
    if (b.items !== undefined) {
      await pool.query('DELETE FROM acc_sales_invoice_items WHERE inv_id=?', [b.id])
      for (const item of (b.items || [])) {
        await pool.query(
          'INSERT INTO acc_sales_invoice_items (inv_id,product_id,description,qty,unit,unit_price,amount) VALUES (?,?,?,?,?,?,?)',
          [b.id, item.product_id || null, item.description || null, item.qty || 1, item.unit || null, item.unit_price || 0, item.amount || 0])
      }
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await pool.query('DELETE FROM acc_sales_invoices WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
