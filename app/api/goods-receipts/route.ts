import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

// GET - ดึงรายการ Goods Receipts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('grID')
    const grNo = searchParams.get('grNo')
    const poNo = searchParams.get('poNo')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `
      SELECT
        gr.grID as id,
        gr.grNo,
        gr.grDate,
        gr.poID,
        gr.poNo,
        gr.supplierID,
        gr.supplier_name,
        gr.total_items,
        gr.status,
        gr.notes,
        gr.received_by,
        gr.created_by,
        gr.created_at
      FROM goods_receipts gr
    `

    // Get single goods receipt by ID
    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE gr.grID = ?`, [id])

      if (rows && rows.length > 0) {
        const goodsReceipt = rows[0]

        // Get goods receipt items
        const [items]: any = await pool.query(
          `SELECT * FROM goods_receipt_items WHERE grID = ? ORDER BY itemID`,
          [goodsReceipt.id]
        )

        goodsReceipt.items = items || []

        return NextResponse.json({
          success: true,
          goodsReceipt,
          rows: [goodsReceipt]
        })
      }

      return NextResponse.json(
        { success: false, error: 'Goods receipt not found', rows: [] },
        { status: 404 }
      )
    }

    // Get single goods receipt by grNo
    if (grNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE gr.grNo = ?`, [grNo])

      if (rows && rows.length > 0) {
        const goodsReceipt = rows[0]

        // Get goods receipt items
        const [items]: any = await pool.query(
          `SELECT * FROM goods_receipt_items WHERE grID = ? ORDER BY itemID`,
          [goodsReceipt.id]
        )

        goodsReceipt.items = items || []

        return NextResponse.json({
          success: true,
          goodsReceipt,
          rows: [goodsReceipt]
        })
      }

      return NextResponse.json(
        { success: false, error: 'Goods receipt not found', rows: [] },
        { status: 404 }
      )
    }

    // Get goods receipts by purchase order number
    if (poNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE gr.poNo = ?`, [poNo])
      return NextResponse.json({ success: true, rows })
    }

    // Get list of goods receipts
    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    query += ` ORDER BY gr.grID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM goods_receipts`
    )
    const total = countResult[0]?.total || 0

    return NextResponse.json({ success: true, rows, total, limit, offset })
  } catch (error: any) {
    console.error('Goods Receipts API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - สร้าง Goods Receipt ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      grDate,
      poID,
      poNo,
      supplierID,
      supplier_name,
      total_items,
      notes,
      items,
      received_by,
      created_by
    } = body

    // Generate goods receipt number
    const grNo = await generateDocumentNumber('GR', 'goods_receipts', 'grNo')

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Insert goods receipt
      const [result]: any = await connection.query(
        `INSERT INTO goods_receipts
        (grNo, grDate, poID, poNo, supplierID, supplier_name, total_items, notes, received_by, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [grNo, grDate, poID, poNo, supplierID, supplier_name, total_items || 0, notes, received_by, created_by]
      )

      const grID = result.insertId

      // Insert goods receipt items
      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await connection.query(
            `INSERT INTO goods_receipt_items
            (grID, product_code, description, quantity_ordered, quantity_received, unit, condition_status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              grID,
              item.product_code || '',
              item.description || '',
              item.quantity_ordered || 0,
              item.quantity_received || 0,
              item.unit || 'pcs',
              item.condition_status || 'good',
              item.notes || ''
            ]
          )
        }
      }

      await connection.commit()

      return NextResponse.json({
        success: true,
        grID,
        grNo,
        message: 'Goods receipt created successfully'
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error('Create goods receipt error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH - อัปเดตสถานะ Goods Receipt
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, grID, status } = body

    const recordId = id || grID

    if (!recordId) {
      return NextResponse.json(
        { success: false, error: 'Goods receipt ID is required' },
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
      `UPDATE goods_receipts SET status = ? WHERE grID = ?`,
      [status, recordId]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Goods receipt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Goods receipt status updated successfully'
    })
  } catch (error: any) {
    console.error('Update goods receipt error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - ลบ Goods Receipt
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('grID')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Goods receipt ID is required' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM goods_receipts WHERE grID = ?', [id])

    return NextResponse.json({
      success: true,
      message: 'Goods receipt deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete goods receipt error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
