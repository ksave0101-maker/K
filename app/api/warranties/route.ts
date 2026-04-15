import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

// GET - ดึงรายการ Warranties
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('wtID')
    const wtNo = searchParams.get('wtNo')
    const serialNumber = searchParams.get('serialNumber')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `
      SELECT
        w.wtID as id,
        w.wtNo,
        w.wtDate,
        w.contract_no,
        w.cusID,
        w.customer_name,
        w.customer_phone,
        w.customer_email,
        w.product_id,
        w.product_name,
        w.serial_number,
        w.purchase_date,
        w.warranty_start_date,
        w.warranty_end_date,
        w.warranty_period,
        w.warranty_type,
        w.coverage_details,
        w.status,
        w.notes,
        w.created_by,
        w.created_at
      FROM warranties w
    `

    // Get single warranty by ID
    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE w.wtID = ?`, [id])

      if (rows && rows.length > 0) {
        const warranty = rows[0]

        // Get warranty claims
        const [claims]: any = await pool.query(
          `SELECT * FROM warranty_claims WHERE wtID = ? ORDER BY claim_date DESC`,
          [warranty.id]
        )

        warranty.claims = claims || []

        return NextResponse.json({
          success: true,
          warranty,
          rows: [warranty]
        })
      }

      return NextResponse.json(
        { success: false, error: 'Warranty not found', rows: [] },
        { status: 404 }
      )
    }

    // Get single warranty by wtNo
    if (wtNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE w.wtNo = ?`, [wtNo])

      if (rows && rows.length > 0) {
        const warranty = rows[0]

        // Get warranty claims
        const [claims]: any = await pool.query(
          `SELECT * FROM warranty_claims WHERE wtID = ? ORDER BY claim_date DESC`,
          [warranty.id]
        )

        warranty.claims = claims || []

        return NextResponse.json({
          success: true,
          warranty,
          rows: [warranty]
        })
      }

      return NextResponse.json(
        { success: false, error: 'Warranty not found', rows: [] },
        { status: 404 }
      )
    }

    // Get warranty by serial number
    if (serialNumber) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE w.serial_number = ?`, [serialNumber])

      if (rows && rows.length > 0) {
        const warranty = rows[0]

        // Get warranty claims
        const [claims]: any = await pool.query(
          `SELECT * FROM warranty_claims WHERE wtID = ? ORDER BY claim_date DESC`,
          [warranty.id]
        )

        warranty.claims = claims || []

        return NextResponse.json({
          success: true,
          warranty,
          rows: [warranty]
        })
      }

      return NextResponse.json(
        { success: false, error: 'Warranty not found', rows: [] },
        { status: 404 }
      )
    }

    // Get list of warranties
    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    // Filter by status
    if (status) {
      query += ` AND w.status = ?`
      params.push(status)
    }

    query += ` ORDER BY w.wtID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM warranties`
    )
    const total = countResult[0]?.total || 0

    return NextResponse.json({ success: true, rows, total, limit, offset })
  } catch (error: any) {
    console.error('Warranties API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - สร้าง Warranty ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      wtDate,
      contract_no,
      cusID,
      customer_name,
      customer_phone,
      customer_email,
      product_id,
      product_name,
      serial_number,
      purchase_date,
      warranty_start_date,
      warranty_end_date,
      warranty_period,
      warranty_period_months,
      warranty_type,
      coverage_details,
      notes,
      created_by
    } = body

    // Generate warranty number
    const wtNo = await generateDocumentNumber('WT', 'warranties', 'wtNo')

    const finalWarrantyPeriod = warranty_period_months || warranty_period

    const [result]: any = await pool.query(
      `INSERT INTO warranties
      (wtNo, wtDate, contract_no, cusID, customer_name, customer_phone, customer_email, product_id, product_name, serial_number,
       purchase_date, warranty_start_date, warranty_end_date, warranty_period, warranty_type, coverage_details,
       notes, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [wtNo, wtDate, contract_no, cusID, customer_name, customer_phone, customer_email, product_id, product_name, serial_number,
       purchase_date, warranty_start_date, warranty_end_date, finalWarrantyPeriod, warranty_type || 'standard',
       coverage_details, notes, created_by]
    )

    return NextResponse.json({
      success: true,
      wtID: result.insertId,
      wtNo,
      message: 'Warranty created successfully'
    })
  } catch (error: any) {
    console.error('Create warranty error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH - อัปเดตสถานะ Warranty
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, wtID, status } = body

    const recordId = id || wtID

    if (!recordId) {
      return NextResponse.json(
        { success: false, error: 'Warranty ID is required' },
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
      `UPDATE warranties SET status = ? WHERE wtID = ?`,
      [status, recordId]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Warranty not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Warranty status updated successfully'
    })
  } catch (error: any) {
    console.error('Update warranty error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - ลบ Warranty
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('wtID')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Warranty ID is required' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM warranties WHERE wtID = ?', [id])

    return NextResponse.json({
      success: true,
      message: 'Warranty deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete warranty error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
