import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('siID')
    const siNo = searchParams.get('siNo')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `SELECT * FROM supplier_invoices`

    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE siID = ?`, [id])
      if (rows && rows.length > 0) {
        const si = rows[0]
        const [items]: any = await pool.query(`SELECT * FROM supplier_invoice_items WHERE siID = ?`, [si.siID])
        si.items = items || []
        return NextResponse.json({ success: true, supplierInvoice: si, rows: [si] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    if (siNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE siNo = ?`, [siNo])
      if (rows && rows.length > 0) {
        const si = rows[0]
        const [items]: any = await pool.query(`SELECT * FROM supplier_invoice_items WHERE siID = ?`, [si.siID])
        si.items = items || []
        return NextResponse.json({ success: true, supplierInvoice: si, rows: [si] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    if (status) {
      query += ` AND status = ?`
      params.push(status)
    }

    query += ` ORDER BY siID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)
    const [countResult]: any = await pool.query(`SELECT COUNT(*) as total FROM supplier_invoices`)

    return NextResponse.json({ success: true, rows, total: countResult[0]?.total || 0, limit, offset })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { siDate, supplier_invoice_no, poID, poNo, supplierID, supplier_name, subtotal, discount, vat, total_amount, due_date, payment_status, notes, items, created_by } = body

    const siNo = await generateDocumentNumber('SI', 'supplier_invoices', 'siNo')
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [result]: any = await connection.query(
        `INSERT INTO supplier_invoices (siNo, siDate, supplier_invoice_no, poID, poNo, supplierID, supplier_name, subtotal, discount, vat, total_amount, due_date, payment_status, notes, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [siNo, siDate, supplier_invoice_no, poID, poNo, supplierID, supplier_name, subtotal || 0, discount || 0, vat || 0, total_amount || 0, due_date, payment_status || 'unpaid', notes, created_by]
      )

      const siID = result.insertId

      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await connection.query(
            `INSERT INTO supplier_invoice_items (siID, product_code, description, quantity, unit_price, total_price)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [siID, item.product_code || '', item.description || '', item.quantity || 1, item.unit_price || 0, item.total_price || 0]
          )
        }
      }

      await connection.commit()
      return NextResponse.json({ success: true, siID, siNo })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, siID, status, payment_status, payment_date } = body
    const recordId = id || siID

    if (!recordId) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    let updates = []
    let params = []

    if (status) { updates.push('status = ?'); params.push(status) }
    if (payment_status) { updates.push('payment_status = ?'); params.push(payment_status) }
    if (payment_date) { updates.push('payment_date = ?'); params.push(payment_date) }

    if (updates.length === 0) return NextResponse.json({ success: false, error: 'No updates' }, { status: 400 })

    const query = `UPDATE supplier_invoices SET ${updates.join(', ')} WHERE siID = ?`
    params.push(recordId)

    await pool.query(query, params)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('siID')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    await pool.query('DELETE FROM supplier_invoices WHERE siID = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
