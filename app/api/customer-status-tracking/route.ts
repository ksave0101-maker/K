import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

type StatusUpdate = {
  updateID?: number
  cusID: number
  customerName: string
  phone: string
  email: string
  currentStatus: string
  previousStatus: string
  statusDate: string
  notes: string
  updatedBy: string
}

// GET - Fetch all status updates
export async function GET(req: NextRequest) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM customer_status_tracking ORDER BY statusDate DESC, created_at DESC`
    )
    return NextResponse.json({ ok: true, data: rows })
  } catch (error: any) {
    console.error('GET /api/customer-status-tracking error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch records' },
      { status: 500 }
    )
  }
}

// POST - Create new status update
export async function POST(req: NextRequest) {
  try {
    const body: StatusUpdate = await req.json()

    const {
      cusID,
      customerName,
      phone,
      email,
      currentStatus,
      previousStatus,
      statusDate,
      notes,
      updatedBy
    } = body

    if (!customerName || !currentStatus || !statusDate) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: customerName, currentStatus, statusDate' },
        { status: 400 }
      )
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO customer_status_tracking
       (cusID, customerName, phone, email, currentStatus, previousStatus, statusDate, notes, updatedBy, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        cusID || null,
        customerName,
        phone || '',
        email || '',
        currentStatus,
        previousStatus || '',
        statusDate,
        notes || '',
        updatedBy || ''
      ]
    )

    return NextResponse.json({
      ok: true,
      updateID: result.insertId,
      message: 'Status update created successfully'
    })
  } catch (error: any) {
    console.error('POST /api/customer-status-tracking error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to create record' },
      { status: 500 }
    )
  }
}

// PUT - Update existing status update
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Missing updateID parameter' },
        { status: 400 }
      )
    }

    const body: StatusUpdate = await req.json()

    const {
      cusID,
      customerName,
      phone,
      email,
      currentStatus,
      previousStatus,
      statusDate,
      notes,
      updatedBy
    } = body

    if (!customerName || !currentStatus || !statusDate) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: customerName, currentStatus, statusDate' },
        { status: 400 }
      )
    }

    await pool.query(
      `UPDATE customer_status_tracking
       SET cusID = ?, customerName = ?, phone = ?, email = ?,
           currentStatus = ?, previousStatus = ?, statusDate = ?,
           notes = ?, updatedBy = ?
       WHERE updateID = ?`,
      [
        cusID || null,
        customerName,
        phone || '',
        email || '',
        currentStatus,
        previousStatus || '',
        statusDate,
        notes || '',
        updatedBy || '',
        id
      ]
    )

    return NextResponse.json({
      ok: true,
      message: 'Status update updated successfully'
    })
  } catch (error: any) {
    console.error('PUT /api/customer-status-tracking error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to update record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete status update
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Missing updateID parameter' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM customer_status_tracking WHERE updateID = ?', [id])

    return NextResponse.json({
      ok: true,
      message: 'Status update deleted successfully'
    })
  } catch (error: any) {
    console.error('DELETE /api/customer-status-tracking error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to delete record' },
      { status: 500 }
    )
  }
}
