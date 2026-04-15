import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('stID')
    const stNo = searchParams.get('stNo')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `SELECT * FROM stock_transfers`

    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE stID = ?`, [id])
      if (rows && rows.length > 0) {
        const st = rows[0]
        const [items]: any = await pool.query(`SELECT * FROM stock_transfer_items WHERE stID = ?`, [st.stID])
        st.items = items || []
        return NextResponse.json({ success: true, stockTransfer: st, rows: [st] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    if (stNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE stNo = ?`, [stNo])
      if (rows && rows.length > 0) {
        const st = rows[0]
        const [items]: any = await pool.query(`SELECT * FROM stock_transfer_items WHERE stID = ?`, [st.stID])
        st.items = items || []
        return NextResponse.json({ success: true, stockTransfer: st, rows: [st] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    if (status) {
      query += ` AND status = ?`
      params.push(status)
    }

    query += ` ORDER BY stID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)
    const [countResult]: any = await pool.query(`SELECT COUNT(*) as total FROM stock_transfers`)

    return NextResponse.json({ success: true, rows, total: countResult[0]?.total || 0 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { stDate, from_location, to_location, transfer_type, total_items, requested_by, notes, items, created_by } = body

    const stNo = await generateDocumentNumber('ST', 'stock_transfers', 'stNo')
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [result]: any = await connection.query(
        `INSERT INTO stock_transfers (stNo, stDate, from_location, to_location, transfer_type, total_items, requested_by, notes, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [stNo, stDate, from_location, to_location, transfer_type || 'internal', total_items || 0, requested_by, notes, created_by]
      )

      const stID = result.insertId

      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await connection.query(
            `INSERT INTO stock_transfer_items (stID, product_id, product_code, description, quantity, unit, condition_status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [stID, item.product_id || null, item.product_code || '', item.description || '', item.quantity || 0, item.unit || 'pcs', item.condition_status || 'good', item.notes || '']
          )
        }
      }

      await connection.commit()
      return NextResponse.json({ success: true, stID, stNo })
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
    const { id, stID, status, approved_by, received_by } = body
    const recordId = id || stID

    if (!recordId) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    let updates = []
    let params = []

    if (status) { updates.push('status = ?'); params.push(status) }
    if (approved_by) { updates.push('approved_by = ?, approved_at = NOW()'); params.push(approved_by) }
    if (received_by) { updates.push('received_by = ?, received_at = NOW()'); params.push(received_by) }

    if (updates.length === 0) return NextResponse.json({ success: false, error: 'No updates' }, { status: 400 })

    const query = `UPDATE stock_transfers SET ${updates.join(', ')} WHERE stID = ?`
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
    const id = searchParams.get('id') || searchParams.get('stID')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    await pool.query('DELETE FROM stock_transfers WHERE stID = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
