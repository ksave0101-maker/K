import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const conn = await pool.getConnection()
  try {
    // Include additional counters: contracts, follow_ups (open), pre_installation_forms not converted, sales_orders
    const queries = [
      { key: 'orders', q: 'SELECT COUNT(*) AS cnt FROM purchase_orders' },
      { key: 'customers', q: 'SELECT COUNT(*) AS cnt FROM cus_detail' },
      { key: 'products', q: 'SELECT COUNT(*) AS cnt FROM product_list' },
      { key: 'invoices', q: 'SELECT COUNT(*) AS cnt FROM invoices' },
      { key: 'quotations', q: 'SELECT COUNT(*) AS cnt FROM quotations' },
      { key: 'contracts', q: 'SELECT COUNT(*) AS cnt FROM contracts' },
      { key: 'followUps', q: "SELECT COUNT(*) AS cnt FROM follow_ups WHERE status NOT IN ('done','closed')" },
      { key: 'preInstallations', q: 'SELECT COUNT(*) AS cnt FROM pre_installation_forms WHERE orderID IS NULL OR orderID = 0' },
      { key: 'salesOrders', q: 'SELECT COUNT(*) AS cnt FROM sales_orders' }
    ]

    const results = await Promise.all(queries.map(item =>
      conn.query(item.q).then((r:any)=>({ key: item.key, val: r[0][0].cnt })).catch(err=>{
        console.error('stats query error for', item.key, err && err.code)
        return { key: item.key, val: 0 }
      })
    ))

    const stats: any = {}
    for (const r of results) stats[r.key] = Number(r.val || 0)

    return NextResponse.json({ success: true, stats })
  } catch (err) {
    console.error('stats GET error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  } finally {
    conn.release()
  }
}
