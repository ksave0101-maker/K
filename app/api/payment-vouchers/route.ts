import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

// GET - ดึงรายการ Payment Vouchers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('pvID')
    const pvNo = searchParams.get('pvNo')
    const paymentType = searchParams.get('paymentType')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `
      SELECT
        pv.pvID as id,
        pv.pvNo,
        pv.pvDate,
        pv.payment_type,
        pv.payee_id,
        pv.payee_name,
        pv.amount,
        pv.payment_method,
        pv.bank_name,
        pv.cheque_no,
        pv.reference_no,
        pv.description,
        pv.status,
        pv.notes,
        pv.approved_by,
        pv.approved_at,
        pv.created_by,
        pv.created_at
      FROM payment_vouchers pv
    `

    // Get single payment voucher by ID
    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE pv.pvID = ?`, [id])

      if (rows && rows.length > 0) {
        const paymentVoucher = rows[0]

        // Get payment voucher items
        const [items]: any = await pool.query(
          `SELECT * FROM payment_voucher_items WHERE pvID = ? ORDER BY itemID`,
          [paymentVoucher.id]
        )

        paymentVoucher.items = items || []

        return NextResponse.json({
          success: true,
          paymentVoucher,
          rows: [paymentVoucher]
        })
      }

      return NextResponse.json(
        { success: false, error: 'Payment voucher not found', rows: [] },
        { status: 404 }
      )
    }

    // Get single payment voucher by pvNo
    if (pvNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE pv.pvNo = ?`, [pvNo])

      if (rows && rows.length > 0) {
        const paymentVoucher = rows[0]

        // Get payment voucher items
        const [items]: any = await pool.query(
          `SELECT * FROM payment_voucher_items WHERE pvID = ? ORDER BY itemID`,
          [paymentVoucher.id]
        )

        paymentVoucher.items = items || []

        return NextResponse.json({
          success: true,
          paymentVoucher,
          rows: [paymentVoucher]
        })
      }

      return NextResponse.json(
        { success: false, error: 'Payment voucher not found', rows: [] },
        { status: 404 }
      )
    }

    // Get list of payment vouchers
    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    // Filter by payment type
    if (paymentType) {
      query += ` AND pv.payment_type = ?`
      params.push(paymentType)
    }

    query += ` ORDER BY pv.pvID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM payment_vouchers`
    )
    const total = countResult[0]?.total || 0

    return NextResponse.json({ success: true, rows, total, limit, offset })
  } catch (error: any) {
    console.error('Payment Vouchers API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - สร้าง Payment Voucher ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      pvDate,
      payment_type,
      payee_id,
      payee_name,
      amount,
      payment_method,
      bank_name,
      cheque_no,
      reference_no,
      description,
      notes,
      items,
      created_by
    } = body

    // Generate payment voucher number
    const pvNo = await generateDocumentNumber('PV', 'payment_vouchers', 'pvNo')

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Insert payment voucher
      const [result]: any = await connection.query(
        `INSERT INTO payment_vouchers
        (pvNo, pvDate, payment_type, payee_id, payee_name, amount, payment_method, bank_name, cheque_no, reference_no, description, notes, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [pvNo, pvDate, payment_type, payee_id, payee_name, amount || 0, payment_method, bank_name, cheque_no, reference_no, description, notes, created_by]
      )

      const pvID = result.insertId

      // Insert payment voucher items (optional - for multiple payment items)
      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await connection.query(
            `INSERT INTO payment_voucher_items
            (pvID, description, amount, reference_doc)
            VALUES (?, ?, ?, ?)`,
            [
              pvID,
              item.description || '',
              item.amount || 0,
              item.reference_doc || ''
            ]
          )
        }
      }

      await connection.commit()

      return NextResponse.json({
        success: true,
        pvID,
        pvNo,
        message: 'Payment voucher created successfully'
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error('Create payment voucher error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH - อัปเดตสถานะหรืออนุมัติ Payment Voucher
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, pvID, status, approved_by } = body

    const recordId = id || pvID

    if (!recordId) {
      return NextResponse.json(
        { success: false, error: 'Payment voucher ID is required' },
        { status: 400 }
      )
    }

    let updateQuery = 'UPDATE payment_vouchers SET '
    const params: any[] = []

    if (status) {
      updateQuery += 'status = ?'
      params.push(status)
    }

    if (approved_by) {
      if (params.length > 0) updateQuery += ', '
      updateQuery += 'approved_by = ?, approved_at = NOW()'
      params.push(approved_by)
    }

    if (params.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    updateQuery += ' WHERE pvID = ?'
    params.push(recordId)

    const [result]: any = await pool.query(updateQuery, params)

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Payment voucher not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment voucher updated successfully'
    })
  } catch (error: any) {
    console.error('Update payment voucher error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - ลบ Payment Voucher
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('pvID')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Payment voucher ID is required' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM payment_vouchers WHERE pvID = ?', [id])

    return NextResponse.json({
      success: true,
      message: 'Payment voucher deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete payment voucher error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
