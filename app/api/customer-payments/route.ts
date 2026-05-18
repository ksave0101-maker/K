import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cusID = searchParams.get('cusID')
    const id = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `
      SELECT
        r.receiptID as id,
        r.receiptDate as date,
        COALESCE(c.fullname, '-') as customer_name,
        r.amount,
        r.payment_method,
        r.receiptNo,
        r.invID,
        r.cusID,
        r.notes,
        r.created_by,
        r.created_at,
        COALESCE(r.status, IF(r.amount > 0, 'paid', 'pending')) as status
      FROM receipts r
      LEFT JOIN cus_detail c ON r.cusID = c.cusID
    `

    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE r.receiptID = ?`, [id])
      return NextResponse.json({ success: true, payment: rows?.[0] || null, rows })
    }

    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    if (cusID) {
      query += ` AND r.cusID = ?`
      params.push(cusID)
    }

    query += ` ORDER BY r.receiptID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)

    return NextResponse.json({ success: true, rows })
  } catch (error: any) {
    console.error('Customer payments API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const id = body?.id || body?.receiptID
    const status = body?.status

    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
    if (!status) return NextResponse.json({ success: false, error: 'status required' }, { status: 400 })

    await pool.query(`UPDATE receipts SET status = ? WHERE receiptID = ?`, [status, id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Customer payments PATCH error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
