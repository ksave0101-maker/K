import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (id) {
      const [rows]: any = await pool.query(
        `SELECT po.*,
                po.wht_amount as wht,
                s.name_th as supplier_name, s.tax_id as supplier_tax_id
         FROM acc_purchase_orders po
         LEFT JOIN acc_suppliers s ON po.supplier_id = s.id
         WHERE po.id = ?`, [id])
      const [items]: any = await pool.query(
        `SELECT pi.*, p.name_th as product_name FROM acc_purchase_order_items pi
         LEFT JOIN acc_products p ON pi.product_id = p.id
         WHERE pi.po_id = ?`, [id])
      return NextResponse.json({ ok: true, data: { ...rows[0], items } })
    }
    const docType = searchParams.get('doc_type')
    const q = searchParams.get('q')
    let where = ''
    const params: any[] = []
    if (docType === 'credit') {
      // ซื้อเงินเชื่อ — payment_type = 'credit' หรือ doc_no CREDIT% (backward compat)
      where += ` AND (po.payment_type = 'credit' OR po.doc_no LIKE 'CREDIT%')`
    } else if (docType === 'cash') {
      where += ` AND (po.payment_type = 'cash' OR po.doc_no LIKE 'CASH%')`
    } else if (docType === 'po') {
      // ใบสั่งซื้อ (PO) — ดึงทั้งหมดที่ไม่ใช่ credit/cash หรือยังไม่มี payment_type
      where += ` AND (po.payment_type IS NULL OR po.payment_type NOT IN ('credit','cash') OR po.doc_no LIKE 'PO%')`
    }
    if (q) { where += ' AND (po.doc_no LIKE ? OR s.name_th LIKE ? OR s.tax_id LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`) }
    const [rows]: any = await pool.query(
      `SELECT po.id, po.doc_no, po.doc_date, po.supplier_id, po.status, po.payment_type,
              po.subtotal, po.discount, po.vat_amount, po.total, po.note,
              s.name_th as supplier_name, s.tax_id as supplier_tax_id
       FROM acc_purchase_orders po
       LEFT JOIN acc_suppliers s ON po.supplier_id = s.id
       WHERE 1=1${where}
       ORDER BY po.doc_date DESC, po.id DESC LIMIT 200`, params)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()

    // Auto-generate document number based on doc_type
    let docNo = b.doc_no
    if (!docNo) {
      const docType = b.doc_type || 'order'
      let prefix = 'PO'

      // Determine prefix based on document type
      switch (docType) {
        case 'cash':
          prefix = 'CASH'
          break
        case 'credit':
          prefix = 'CREDIT'
          break
        case 'order':
          prefix = 'PO'
          break
        default:
          prefix = 'PO'
      }

      docNo = await generateDocumentNumber(prefix, 'acc_purchase_orders', 'doc_no')
    }

    const [r]: any = await pool.query(
      `INSERT INTO acc_purchase_orders
        (doc_no, doc_date, due_date, supplier_id, payment_type, status,
         subtotal, discount, vat_amount, total, note,
         price_exempt, price_before_vat, wht_rate, wht_amount, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        docNo, b.doc_date, b.due_date||null, b.supplier_id||null,
        b.doc_type==='credit'?'credit': b.doc_type==='cash'?'cash':null,
        b.status||'draft',
        b.subtotal||0, b.discount||0, b.vat||b.vat_amount||0, b.total||0, b.note||null,
        b.price_exempt||0, b.price_before_vat||0, b.wht_rate||0, b.wht||b.wht_amount||0,
        b.created_by||null
      ]
    )
    const poId = r.insertId
    if (b.items?.length) {
      for (const item of b.items) {
        await pool.query(
          `INSERT INTO acc_purchase_order_items (po_id,product_id,description,qty,unit,unit_price,amount)
           VALUES (?,?,?,?,?,?,?)`,
          [poId, item.product_id||null, item.description||null, item.qty||1, item.unit||null, item.unit_price||0, item.amount||0]
        )
      }
    }
    return NextResponse.json({ ok: true, id: poId, doc_no: docNo })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query(
      `UPDATE acc_purchase_orders SET
        doc_date=?, due_date=?, supplier_id=?, payment_type=?, status=?,
        subtotal=?, discount=?, vat_amount=?, total=?, note=?,
        price_exempt=?, price_before_vat=?, wht_rate=?, wht_amount=?
       WHERE id=?`,
      [
        b.doc_date, b.due_date||null, b.supplier_id||null,
        b.doc_type==='credit'?'credit': b.doc_type==='cash'?'cash':null,
        b.status||'draft',
        b.subtotal||0, b.discount||0, b.vat||b.vat_amount||0, b.total||0, b.note||null,
        b.price_exempt||0, b.price_before_vat||0, b.wht_rate||0, b.wht||b.wht_amount||0,
        b.id
      ]
    )
    if (b.items !== undefined) {
      await pool.query('DELETE FROM acc_purchase_order_items WHERE po_id=?', [b.id])
      for (const item of (b.items || [])) {
        await pool.query(
          `INSERT INTO acc_purchase_order_items (po_id,product_id,description,qty,unit,unit_price,amount)
           VALUES (?,?,?,?,?,?,?)`,
          [b.id, item.product_id||null, item.description||null, item.qty||1, item.unit||null, item.unit_price||0, item.amount||0]
        )
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
    await pool.query('DELETE FROM acc_purchase_orders WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
