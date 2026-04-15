import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('saID')
    const saNo = searchParams.get('saNo')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `SELECT * FROM stock_adjustments`

    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE saID = ?`, [id])
      if (rows && rows.length > 0) {
        const sa = rows[0]
        const [items]: any = await pool.query(`SELECT * FROM stock_adjustment_items WHERE saID = ?`, [sa.saID])
        sa.items = items || []
        return NextResponse.json({ success: true, stockAdjustment: sa, rows: [sa] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    if (saNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE saNo = ?`, [saNo])
      if (rows && rows.length > 0) {
        const sa = rows[0]
        const [items]: any = await pool.query(`SELECT * FROM stock_adjustment_items WHERE saID = ?`, [sa.saID])
        sa.items = items || []
        return NextResponse.json({ success: true, stockAdjustment: sa, rows: [sa] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    if (status) {
      query += ` AND status = ?`
      params.push(status)
    }

    query += ` ORDER BY saID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)
    const [countResult]: any = await pool.query(`SELECT COUNT(*) as total FROM stock_adjustments`)

    return NextResponse.json({ success: true, rows, total: countResult[0]?.total || 0 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { saDate, adjustment_type, reason, location, total_items, notes, items, created_by } = body

    const saNo = await generateDocumentNumber('SA', 'stock_adjustments', 'saNo')
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [result]: any = await connection.query(
        `INSERT INTO stock_adjustments (saNo, saDate, adjustment_type, reason, location, total_items, notes, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [saNo, saDate, adjustment_type || 'adjustment', reason, location, total_items || 0, notes, created_by]
      )

      const saID = result.insertId

      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await connection.query(
            `INSERT INTO stock_adjustment_items (saID, product_id, product_code, description, current_quantity, adjusted_quantity, difference, unit, reason)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [saID, item.product_id || null, item.product_code || '', item.description || '', item.current_quantity || 0, item.adjusted_quantity || 0, item.difference || 0, item.unit || 'pcs', item.reason || '']
          )
        }
      }

      await connection.commit()
      return NextResponse.json({ success: true, saID, saNo })
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
    const { id, saID, status, approved_by } = body
    const recordId = id || saID

    if (!recordId) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    let updates = []
    let params = []

    if (status) { updates.push('status = ?'); params.push(status) }
    if (approved_by) { updates.push('approved_by = ?, approved_at = NOW()'); params.push(approved_by) }

    if (updates.length === 0) return NextResponse.json({ success: false, error: 'No updates' }, { status: 400 })

    const query = `UPDATE stock_adjustments SET ${updates.join(', ')} WHERE saID = ?`
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
    const id = searchParams.get('id') || searchParams.get('saID')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    await pool.query('DELETE FROM stock_adjustments WHERE saID = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
