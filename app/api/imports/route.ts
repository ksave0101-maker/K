import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

// GET all imports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const impID = searchParams.get('impID')

    let query = 'SELECT * FROM imports'
    const params: any[] = []

    if (impID) {
      query += ' WHERE impID = ?'
      params.push(impID)
    } else {
      query += ' ORDER BY impDate DESC, impID DESC LIMIT 100'
    }

    const [rows]: any = await pool.query(query, params)

    // If single record, also fetch items
    if (impID && rows.length > 0) {
      const [items]: any = await pool.query(
        'SELECT * FROM import_items WHERE impID = ? ORDER BY id',
        [impID]
      )
      return NextResponse.json({ success: true, import: rows[0], items })
    }

    return NextResponse.json({ success: true, data: rows })
  } catch (error: any) {
    console.error('GET /api/imports error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - create new import
export async function POST(request: NextRequest) {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const body = await request.json()
    const {
      impDate,
      supplier_id,
      supplier_name,
      supplier_invoice_no,
      warehouse,
      receiver_name,
      transport_method,
      customs_declaration_no,
      currency,
      exchange_rate,
      notes,
      items,
      created_by
    } = body

    // Generate document number
    const impNo = await generateDocumentNumber('IMP', 'imports', 'impNo')

    // Calculate totals
    const total_items = items?.length || 0
    const total_quantity = items?.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0) || 0
    const total_amount = items?.reduce((sum: number, item: any) => sum + Number(item.total_price || 0), 0) || 0

    // Insert import record
    const [result]: any = await connection.query(
      `INSERT INTO imports (
        impNo, impDate, supplier_id, supplier_name, supplier_invoice_no,
        warehouse, receiver_name, transport_method, customs_declaration_no,
        total_items, total_quantity, total_amount, currency, exchange_rate,
        notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        impNo, impDate, supplier_id, supplier_name, supplier_invoice_no,
        warehouse, receiver_name, transport_method, customs_declaration_no,
        total_items, total_quantity, total_amount, currency || 'THB', exchange_rate || 1.0000,
        notes, created_by
      ]
    )

    const impID = result.insertId

    // Insert items
    if (items && items.length > 0) {
      for (const item of items) {
        await connection.query(
          `INSERT INTO import_items (
            impID, product_code, product_name, description, quantity, unit,
            unit_price, total_price, hs_code, country_of_origin
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            impID,
            item.product_code,
            item.product_name,
            item.description,
            item.quantity,
            item.unit || 'pcs',
            item.unit_price || 0,
            item.total_price || 0,
            item.hs_code,
            item.country_of_origin
          ]
        )
      }
    }

    await connection.commit()

    return NextResponse.json({
      success: true,
      impID,
      impNo,
      message: 'Import created successfully'
    })
  } catch (error: any) {
    await connection.rollback()
    console.error('POST /api/imports error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    connection.release()
  }
}

// PATCH - update import status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { impID, status } = body

    if (!impID) {
      return NextResponse.json({ success: false, error: 'impID required' }, { status: 400 })
    }

    const updates: string[] = []
    const params: any[] = []

    if (status) {
      updates.push('status = ?')
      params.push(status)
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 })
    }

    params.push(impID)

    await pool.query(
      `UPDATE imports SET ${updates.join(', ')} WHERE impID = ?`,
      params
    )

    return NextResponse.json({ success: true, message: 'Import updated' })
  } catch (error: any) {
    console.error('PATCH /api/imports error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const impID = searchParams.get('impID')

    if (!impID) {
      return NextResponse.json({ success: false, error: 'impID required' }, { status: 400 })
    }

    await pool.query('DELETE FROM imports WHERE impID = ?', [impID])

    return NextResponse.json({ success: true, message: 'Import deleted' })
  } catch (error: any) {
    console.error('DELETE /api/imports error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
