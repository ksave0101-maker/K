import { NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

const DOC_TABLES = [
  'vacation_leave_requests',
  'purchase_requests',
  'supplier_invoices',
  'goods_receipts',
  'stock_cards',
  'stock_transfers',
  'stock_adjustments',
  'payment_vouchers',
  'credit_notes',
  'expense_bills',
  'production_orders',
  'field_work_logs',
  'warranties',
]

export async function GET() {
  try {
    const results = await Promise.all(
      DOC_TABLES.map(async (table) => {
        try {
          const [rows]: any = await pool.query(
            `SELECT COUNT(*) AS cnt FROM \`${table}\``
          )
          return rows[0]?.cnt ?? 0
        } catch {
          return 0
        }
      })
    )

    const total = results.reduce((sum: number, n: number) => sum + Number(n), 0)

    const breakdown: Record<string, number> = {}
    DOC_TABLES.forEach((t, i) => {
      breakdown[t] = Number(results[i])
    })

    return NextResponse.json({ total, breakdown })
  } catch (err: any) {
    return NextResponse.json({ total: 0, breakdown: {}, error: err.message }, { status: 500 })
  }
}
