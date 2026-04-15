import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('ebID')
    const ebNo = searchParams.get('ebNo')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `SELECT * FROM expense_bills`

    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE ebID = ?`, [id])
      if (rows && rows.length > 0) {
        const eb = rows[0]
        const [items]: any = await pool.query(`SELECT * FROM expense_bill_items WHERE ebID = ?`, [eb.ebID])
        eb.items = items || []
        return NextResponse.json({ success: true, expenseBill: eb, rows: [eb] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    if (ebNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE ebNo = ?`, [ebNo])
      if (rows && rows.length > 0) {
        const eb = rows[0]
        const [items]: any = await pool.query(`SELECT * FROM expense_bill_items WHERE ebID = ?`, [eb.ebID])
        eb.items = items || []
        return NextResponse.json({ success: true, expenseBill: eb, rows: [eb] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    if (status) {
      query += ` AND status = ?`
      params.push(status)
    }

    if (category) {
      query += ` AND category = ?`
      params.push(category)
    }

    query += ` ORDER BY ebID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)
    const [countResult]: any = await pool.query(`SELECT COUNT(*) as total FROM expense_bills`)

    return NextResponse.json({ success: true, rows, total: countResult[0]?.total || 0 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ebNo: requestedEbNo, ebDate, expense_type, category, vendor_name, vendor_invoice_no, amount, vat, total_amount, payment_method, payment_status, department, project_code, description, notes, items, created_by } = body

    let ebNo = requestedEbNo
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      if (ebNo) {
        const [existingRows]: any = await connection.query(
          `SELECT ebID FROM expense_bills WHERE ebNo = ? LIMIT 1`,
          [ebNo]
        )
        if (existingRows.length > 0) {
          const duplicateError = new Error('EB number already exists. Please refresh to get a new number.') as Error & { status?: number }
          duplicateError.status = 409
          throw duplicateError
        }
      } else {
        ebNo = await generateDocumentNumber('EB', 'expense_bills', 'ebNo')
      }

      const [result]: any = await connection.query(
        `INSERT INTO expense_bills (ebNo, ebDate, expense_type, category, vendor_name, vendor_invoice_no, amount, vat, total_amount, payment_method, payment_status, department, project_code, description, notes, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [ebNo, ebDate, expense_type, category, vendor_name, vendor_invoice_no, amount || 0, vat || 0, total_amount || 0, payment_method, payment_status || 'unpaid', department, project_code, description, notes, created_by]
      )

      const ebID = result.insertId

      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await connection.query(
            `INSERT INTO expense_bill_items (ebID, description, quantity, unit_price, total_price)
             VALUES (?, ?, ?, ?, ?)`,
            [ebID, item.description || '', item.quantity || 1, item.unit_price || 0, item.total_price || 0]
          )
        }
      }

      await connection.commit()
      return NextResponse.json({ success: true, ebID, ebNo })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ebID, status, payment_status, payment_date, approved_by } = body
    const recordId = id || ebID

    if (!recordId) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    let updates = []
    let params = []

    if (status) { updates.push('status = ?'); params.push(status) }
    if (payment_status) { updates.push('payment_status = ?'); params.push(payment_status) }
    if (payment_date) { updates.push('payment_date = ?'); params.push(payment_date) }
    if (approved_by) { updates.push('approved_by = ?, approved_at = NOW()'); params.push(approved_by) }

    if (updates.length === 0) return NextResponse.json({ success: false, error: 'No updates' }, { status: 400 })

    const query = `UPDATE expense_bills SET ${updates.join(', ')} WHERE ebID = ?`
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
    const id = searchParams.get('id') || searchParams.get('ebID')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    await pool.query('DELETE FROM expense_bills WHERE ebID = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
