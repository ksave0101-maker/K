import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('quoteID')
    const quoteNo = searchParams.get('quoteNo')
    const limit = parseInt(searchParams.get('limit') || '200')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Single quotation by ID
    if (id) {
      const [rows]: any = await pool.query(
        `SELECT * FROM quotations WHERE quoteID = ?`, [id]
      )
      return NextResponse.json({ success: true, quotation: rows?.[0] || null, rows })
    }

    // Single quotation by quoteNo
    if (quoteNo) {
      const [rows]: any = await pool.query(
        `SELECT * FROM quotations WHERE quoteNo = ?`, [quoteNo]
      )
      return NextResponse.json({ success: true, quotation: rows?.[0] || null, rows })
    }

    // List all
    const [rows]: any = await pool.query(
      `SELECT * FROM quotations ORDER BY quoteID DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    )

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM quotations`
    )
    const total = countResult[0]?.total || 0

    return NextResponse.json({ success: true, rows, total, limit, offset })
  } catch (error: any) {
    console.error('Quotations API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      quoteNo,
      quoteDate,
      cusID,
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      discountAmount,
      vatAmount,
      total,
      notes,
      createdBy,
    } = body

    if (!quoteNo || !customerName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert quotation
    const [result]: any = await pool.query(
      `INSERT INTO quotations (
        quoteNo, quoteDate, cusID, customer_name, customer_email, customer_phone,
        subtotal, discount, vat, total, items, notes, status, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, NOW())`,
      [
        quoteNo,
        quoteDate || null,
        cusID || null,
        customerName,
        customerEmail || null,
        customerPhone || null,
        subtotal || 0,
        discountAmount || 0,
        vatAmount || 0,
        total || 0,
        JSON.stringify(items || []),
        notes || null,
        createdBy || null,
      ]
    )

    return NextResponse.json({
      success: true,
      quoteID: result.insertId
    })
  } catch (error: any) {
    console.error('Quotations POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const id = body.id || body.quoteID
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    }
    if (body.status) {
      await pool.query(`UPDATE quotations SET status = ? WHERE quoteID = ?`, [body.status, id])
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Quotations PATCH error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('quoteID')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    }
    await pool.query(`DELETE FROM quotations WHERE quoteID = ?`, [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Quotations DELETE error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
