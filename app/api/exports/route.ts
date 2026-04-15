import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

// GET all exports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const expID = searchParams.get('expID')

    let query = 'SELECT * FROM exports'
    const params: any[] = []

    if (expID) {
      query += ' WHERE expID = ?'
      params.push(expID)
    } else {
      query += ' ORDER BY expDate DESC, expID DESC LIMIT 100'
    }

    const [rows]: any = await pool.query(query, params)

    // If single record, also fetch items
    if (expID && rows.length > 0) {
      const [items]: any = await pool.query(
        'SELECT * FROM export_items WHERE expID = ? ORDER BY id',
        [expID]
      )
      return NextResponse.json({ success: true, export: rows[0], items })
    }

    return NextResponse.json({ success: true, data: rows })
  } catch (error: any) {
    console.error('GET /api/exports error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - create new export
export async function POST(request: NextRequest) {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const body = await request.json()
    const {
      expDate,
      customer_id,
      customer_name,
      destination_country,
      destination_address,
      warehouse,
      shipper_name,
      transport_method,
      customs_declaration_no,
      shipping_company,
      tracking_no,
      currency,
      exchange_rate,
      notes,
      items,
      created_by
    } = body

    // Generate document number
    const expNo = await generateDocumentNumber('EXP', 'exports', 'expNo')

    // Calculate totals
    const total_items = items?.length || 0
    const total_quantity = items?.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0) || 0
    const total_amount = items?.reduce((sum: number, item: any) => sum + Number(item.total_price || 0), 0) || 0

    // Insert export record
    const [result]: any = await connection.query(
      `INSERT INTO exports (
        expNo, expDate, customer_id, customer_name, destination_country, destination_address,
        warehouse, shipper_name, transport_method, customs_declaration_no,
        shipping_company, tracking_no,
        total_items, total_quantity, total_amount, currency, exchange_rate,
        notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        expNo, expDate, customer_id, customer_name, destination_country, destination_address,
        warehouse, shipper_name, transport_method, customs_declaration_no,
        shipping_company, tracking_no,
        total_items, total_quantity, total_amount, currency || 'THB', exchange_rate || 1.0000,
        notes, created_by
      ]
    )

    const expID = result.insertId

    // Insert items
    if (items && items.length > 0) {
      for (const item of items) {
        await connection.query(
          `INSERT INTO export_items (
            expID, product_code, product_name, description, quantity, unit,
            unit_price, total_price, hs_code
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            expID,
            item.product_code,
            item.product_name,
            item.description,
            item.quantity,
            item.unit || 'pcs',
            item.unit_price || 0,
            item.total_price || 0,
            item.hs_code
          ]
        )
      }
    }

    await connection.commit()

    return NextResponse.json({
      success: true,
      expID,
      expNo,
      message: 'Export created successfully'
    })
  } catch (error: any) {
    await connection.rollback()
    console.error('POST /api/exports error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    connection.release()
  }
}

// PATCH - update export status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { expID, status, tracking_no } = body

    if (!expID) {
      return NextResponse.json({ success: false, error: 'expID required' }, { status: 400 })
    }

    const updates: string[] = []
    const params: any[] = []

    if (status) {
      updates.push('status = ?')
      params.push(status)
    }

    if (tracking_no !== undefined) {
      updates.push('tracking_no = ?')
      params.push(tracking_no)
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 })
    }

    params.push(expID)

    await pool.query(
      `UPDATE exports SET ${updates.join(', ')} WHERE expID = ?`,
      params
    )

    return NextResponse.json({ success: true, message: 'Export updated' })
  } catch (error: any) {
    console.error('PATCH /api/exports error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const expID = searchParams.get('expID')

    if (!expID) {
      return NextResponse.json({ success: false, error: 'expID required' }, { status: 400 })
    }

    await pool.query('DELETE FROM exports WHERE expID = ?', [expID])

    return NextResponse.json({ success: true, message: 'Export deleted' })
  } catch (error: any) {
    console.error('DELETE /api/exports error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
