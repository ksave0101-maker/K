import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

// GET - ดึงรายการ Credit Notes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('cnID')
    const cnNo = searchParams.get('cnNo')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `
      SELECT
        cn.cnID as id,
        cn.cnNo,
        cn.cnDate,
        cn.invID,
        cn.invNo,
        cn.invNo as invoice_ref,
        cn.cusID,
        cn.customer_name,
        cn.reason,
        cn.subtotal,
        cn.discount,
        cn.vat,
        cn.total_amount,
        cn.status,
        cn.notes,
        cn.created_by,
        cn.created_at
      FROM credit_notes cn
    `

    // Get single credit note by ID
    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE cn.cnID = ?`, [id])

      if (rows && rows.length > 0) {
        const creditNote = rows[0]

        // Get credit note items
        const [items]: any = await pool.query(
          `SELECT * FROM credit_note_items WHERE cnID = ? ORDER BY itemID`,
          [creditNote.id]
        )

        creditNote.items = items || []

        return NextResponse.json({
          success: true,
          creditNote,
          rows: [creditNote]
        })
      }

      return NextResponse.json(
        { success: false, error: 'Credit note not found', rows: [] },
        { status: 404 }
      )
    }

    // Get single credit note by cnNo
    if (cnNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE cn.cnNo = ?`, [cnNo])

      if (rows && rows.length > 0) {
        const creditNote = rows[0]

        // Get credit note items
        const [items]: any = await pool.query(
          `SELECT * FROM credit_note_items WHERE cnID = ? ORDER BY itemID`,
          [creditNote.id]
        )

        creditNote.items = items || []

        return NextResponse.json({
          success: true,
          creditNote,
          rows: [creditNote]
        })
      }

      return NextResponse.json(
        { success: false, error: 'Credit note not found', rows: [] },
        { status: 404 }
      )
    }

    // Get list of credit notes
    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    query += ` ORDER BY cn.cnID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM credit_notes`
    )
    const total = countResult[0]?.total || 0

    return NextResponse.json({ success: true, rows, total, limit, offset })
  } catch (error: any) {
    console.error('Credit Notes API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - สร้าง Credit Note ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      cnNo: requestedCnNo,
      cnDate,
      invID,
      invNo,
      invoice_ref,
      cusID,
      customer_name,
      reason,
      subtotal,
      discount,
      vat,
      total_amount,
      notes,
      items,
      created_by
    } = body

    let cnNo = requestedCnNo
    const sourceInvNo = invNo || invoice_ref || null

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      if (cnNo) {
        const [existingRows]: any = await connection.query(
          `SELECT cnID FROM credit_notes WHERE cnNo = ? LIMIT 1`,
          [cnNo]
        )
        if (existingRows.length > 0) {
          const duplicateError = new Error('Credit note number already exists. Please refresh to get a new number.') as Error & { status?: number }
          duplicateError.status = 409
          throw duplicateError
        }
      } else {
        cnNo = await generateDocumentNumber('CN', 'credit_notes', 'cnNo')
      }

      // Insert credit note
      const [result]: any = await connection.query(
        `INSERT INTO credit_notes
        (cnNo, cnDate, invID, invNo, cusID, customer_name, reason, subtotal, discount, vat, total_amount, notes, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [cnNo, cnDate, invID, sourceInvNo, cusID, customer_name, reason, subtotal || 0, discount || 0, vat || 0, total_amount || 0, notes, created_by]
      )

      const cnID = result.insertId

      // Insert credit note items
      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await connection.query(
            `INSERT INTO credit_note_items
            (cnID, description, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)`,
            [
              cnID,
              item.description || '',
              item.quantity || 1,
              item.unit_price || 0,
              item.total_price || ((item.quantity || 1) * (item.unit_price || 0))
            ]
          )
        }
      }

      await connection.commit()

      return NextResponse.json({
        success: true,
        cnID,
        cnNo,
        message: 'Credit note created successfully'
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error('Create credit note error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    )
  }
}

// PATCH - อัปเดตสถานะ Credit Note
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, cnID, status } = body

    const recordId = id || cnID

    if (!recordId) {
      return NextResponse.json(
        { success: false, error: 'Credit note ID is required' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    const [result]: any = await pool.query(
      `UPDATE credit_notes SET status = ? WHERE cnID = ?`,
      [status, recordId]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Credit note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Credit note status updated successfully'
    })
  } catch (error: any) {
    console.error('Update credit note error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - ลบ Credit Note
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('cnID')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Credit note ID is required' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM credit_notes WHERE cnID = ?', [id])

    return NextResponse.json({
      success: true,
      message: 'Credit note deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete credit note error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
