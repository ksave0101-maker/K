import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const [rows]: any = await pool.query(
      `SELECT * FROM sales_orders WHERE orderID = ? OR orderNo = ?`, [id, id]
    )
    const order = rows?.[0] || null
    if (order) {
      const [items]: any = await pool.query(
        `SELECT * FROM sales_order_items WHERE orderID = ?`, [order.orderID]
      )
      order.items = items || []
    }
    return NextResponse.json({ success: true, order })
  } catch (err: any) {
    console.error('GET /api/sales-orders/[id] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
