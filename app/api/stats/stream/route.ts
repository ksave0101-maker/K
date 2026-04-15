import { NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import type mysql from 'mysql2/promise'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const QUERIES = [
  { key: 'orders', q: 'SELECT COUNT(*) AS cnt FROM purchase_orders' },
  { key: 'customers', q: 'SELECT COUNT(*) AS cnt FROM cus_detail' },
  { key: 'products', q: 'SELECT COUNT(*) AS cnt FROM product_list' },
  { key: 'invoices', q: 'SELECT COUNT(*) AS cnt FROM invoices' },
  { key: 'quotations', q: 'SELECT COUNT(*) AS cnt FROM quotations' },
  { key: 'contracts', q: 'SELECT COUNT(*) AS cnt FROM contracts' },
  { key: 'followUps', q: "SELECT COUNT(*) AS cnt FROM follow_ups WHERE status NOT IN ('done','closed')" },
  { key: 'preInstallations', q: 'SELECT COUNT(*) AS cnt FROM pre_installation_forms WHERE orderID IS NULL OR orderID = 0' },
  { key: 'salesOrders', q: 'SELECT COUNT(*) AS cnt FROM sales_orders' },
  { key: 'receipts', q: 'SELECT COUNT(*) AS cnt FROM receipts' },
  { key: 'deliveryNotes', q: 'SELECT COUNT(*) AS cnt FROM delivery_notes' },
  { key: 'powerCalculations', q: 'SELECT COUNT(*) AS cnt FROM power_calculations' },
  { key: 'taxInvoices', q: 'SELECT COUNT(*) AS cnt FROM tax_invoices' },
  { key: 'pendingBills', q: 'SELECT COUNT(*) AS cnt FROM `Pending Bills`' },
  { key: 'customerTesting', q: 'SELECT COUNT(*) AS cnt FROM customer_testing' },
  { key: 'suppliers', q: 'SELECT COUNT(*) AS cnt FROM suppliers' },
  { key: 'koreaTracking', q: 'SELECT COUNT(*) AS cnt FROM korea_order_tracking' },
]

async function fetchStats(): Promise<Record<string, number>> {
  let conn: mysql.PoolConnection | null = null
  try {
    conn = await pool.getConnection()
    const stats: Record<string, number> = {}
    for (const item of QUERIES) {
      try {
        const [rows] = await conn.query(item.q)
        const firstRow = Array.isArray(rows) ? rows[0] as { cnt?: number } : undefined
        stats[item.key] = Number(firstRow?.cnt || 0)
      } catch (err: unknown) {
        const errCode = err && typeof err === 'object' && 'code' in err ? String(err.code) : 'unknown'
        console.error('stats stream query error for', item.key, errCode)
        stats[item.key] = 0
      }
    }
    return stats
  } catch (err) {
    console.error('stats stream fetchStats error:', err)
    return {}
  } finally {
    try { if (conn) conn.release() } catch {}
  }
}

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false

      const send = (data: string) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(data))
        } catch {
          closed = true
        }
      }

      // Send ready ping
      send('data: {"type":"ready"}\n\n')

      // Send initial stats
      try {
        const stats = await fetchStats()
        if (Object.keys(stats).length > 0) {
          send(`data: ${JSON.stringify({ success: true, stats })}\n\n`)
        }
      } catch (e) {
        console.error('stats stream initial fetch error', e)
      }

      // Poll every 30 seconds
      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval)
          return
        }
        try {
          const stats = await fetchStats()
          if (Object.keys(stats).length > 0) {
            send(`data: ${JSON.stringify({ success: true, stats })}\n\n`)
          }
        } catch (e) {
          console.error('stats stream poll error:', e)
        }
      }, 30000)

      // Keep connection alive with heartbeat every 25 seconds
      const heartbeat = setInterval(() => {
        if (closed) {
          clearInterval(heartbeat)
          return
        }
        send(': ping\n\n')
      }, 25000)

      // Cleanup after 10 minutes to avoid zombie connections
      setTimeout(() => {
        closed = true
        clearInterval(interval)
        clearInterval(heartbeat)
        try { controller.close() } catch {}
      }, 10 * 60 * 1000)
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
