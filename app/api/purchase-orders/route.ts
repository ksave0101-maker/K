import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('orderID')
    const orderNo = searchParams.get('orderNo')
    const limit = parseInt(searchParams.get('limit') || '200')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (id) {
      const [rows]: any = await pool.query(
        `SELECT * FROM purchase_orders WHERE orderID = ?`, [id]
      )
      return NextResponse.json({ success: true, order: rows?.[0] || null, rows })
    }

    if (orderNo) {
      const [rows]: any = await pool.query(
        `SELECT * FROM purchase_orders WHERE orderNo = ?`, [orderNo]
      )
      return NextResponse.json({ success: true, order: rows?.[0] || null, rows })
    }

    const [rows]: any = await pool.query(
      `SELECT * FROM purchase_orders ORDER BY orderID DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    )

    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM purchase_orders`
    )
    const total = countResult[0]?.total || 0

    return NextResponse.json({ success: true, rows, total, limit, offset })
  } catch (error: any) {
    console.error('Purchase Orders API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const id = body.id || body.orderID
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    }
    if (body.status) {
      await pool.query(`UPDATE purchase_orders SET status = ? WHERE orderID = ?`, [body.status, id])
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Purchase Orders PATCH error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('orderID')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    }
    await pool.query(`DELETE FROM purchase_orders WHERE orderID = ?`, [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Purchase Orders DELETE error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
