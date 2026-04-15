import { NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET() {
  const connection = await pool.getConnection()
  try {
    const [orderRows]: any = await connection.query(`
      SELECT COUNT(*) AS total,
        SUM(status='pending') AS pending,
        SUM(status='in_progress') AS in_progress,
        SUM(status='completed') AS completed,
        SUM(status='on_hold') AS on_hold,
        SUM(due_date < CURDATE() AND status NOT IN ('completed','cancelled')) AS overdue
      FROM production_orders
    `)
    const ord = orderRows?.[0] || {}

    const [shipTotal]: any = await connection.query(`
      SELECT COUNT(*) AS total,
        SUM(currentStatus='preparing') AS preparing,
        SUM(currentStatus='in-transit') AS in_transit,
        SUM(currentStatus='customs') AS customs,
        SUM(currentStatus='delivered') AS delivered
      FROM kr_shipment_updates
    `)
    const ship = shipTotal?.[0] || {}

    const [qaRows]: any = await connection.query(`SELECT COUNT(*) AS total FROM kr_qa_reports`)
    const qa = qaRows?.[0] || {}

    const [invRows]: any = await connection.query(`
      SELECT COUNT(*) AS total,
        SUM(paymentStatus='unpaid') AS unpaid,
        SUM(paymentStatus='paid') AS paid,
        SUM(paymentStatus='overdue') AS overdue
      FROM kr_hr_invoices
    `)
    const inv = invRows?.[0] || {}

    const [alertOrders]: any = await connection.query(`
      SELECT pdoNo, product_name, due_date, status, priority
      FROM production_orders
      WHERE due_date < CURDATE() AND status NOT IN ('completed','cancelled')
      ORDER BY due_date ASC LIMIT 10
    `)

    const [alertInvoices]: any = await connection.query(`
      SELECT invoiceNumber, customer, totalAmount, dueDate, paymentStatus, branch_code
      FROM kr_hr_invoices
      WHERE paymentStatus IN ('unpaid','overdue')
      ORDER BY dueDate ASC LIMIT 10
    `)

    const [alertShipments]: any = await connection.query(`
      SELECT shipmentNumber, orderNumber, destination, estimatedDelivery, currentStatus
      FROM kr_shipment_updates
      WHERE currentStatus IN ('preparing','in-transit','customs')
      ORDER BY estimatedDelivery ASC LIMIT 10
    `)

    const [recentOrders]: any = await connection.query(`
      SELECT pdoNo, product_name, quantity_ordered, unit, status, due_date, priority
      FROM production_orders
      ORDER BY created_at DESC LIMIT 10
    `)

    const [branchRows]: any = await connection.query(`
      SELECT UPPER(SUBSTRING(pdoNo,4,2)) AS bc,
        COUNT(*) AS total,
        SUM(status='pending') AS pending,
        SUM(status='in_progress') AS in_progress,
        SUM(status='completed') AS completed
      FROM production_orders
      GROUP BY UPPER(SUBSTRING(pdoNo,4,2))
    `)

    const branchMap: Record<string, any> = {}
    for (const r of (branchRows || [])) branchMap[String(r.bc || '')] = r

    const codeKey: Record<string, string> = { TH:'thailand', VN:'vietnam', MY:'malaysia', BN:'brunei', KR:'korea' }
    const branches: Record<string, any> = {}
    for (const [code, key] of Object.entries(codeKey)) {
      const b = branchMap[code] || {}
      branches[key] = {
        totalOrders: Number(b.total||0),
        inProduction: Number(b.in_progress||0),
        readyToShip: Number(b.pending||0),
        shipped: Number(b.completed||0),
        efficiency: b.total>0 ? Math.round((Number(b.completed||0)/Number(b.total))*100) : 0,
        qaReports: 0, dailyIssues: 0, qualityTests: 0, materialsNeeded: 0, dailyOutput: 0,
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalOrders: Number(ord.total||0),
        inProduction: Number(ord.in_progress||0),
        readyToShip: Number(ord.pending||0),
        shipped: Number(ship.delivered||0),
        qualityTests: Number(qa.total||0),
        materialsNeeded: Number(ord.on_hold||0),
        efficiency: ord.total>0 ? Math.round((Number(ord.completed||0)/Number(ord.total))*100) : 0,
        dailyOutput: Number(ord.completed||0),
        qaReports: Number(qa.total||0),
        dailyIssues: Number(ord.overdue||0),
      },
      branches,
      shipments: { total: Number(ship.total||0), preparing: Number(ship.preparing||0), in_transit: Number(ship.in_transit||0), customs: Number(ship.customs||0), delivered: Number(ship.delivered||0) },
      invoices: { total: Number(inv.total||0), unpaid: Number(inv.unpaid||0), paid: Number(inv.paid||0), overdue: Number(inv.overdue||0) },
      alerts: { overdueOrders: alertOrders||[], unpaidInvoices: alertInvoices||[], inTransitShipments: alertShipments||[] },
      recentOrders: recentOrders||[],
    })
  } finally {
    connection.release()
  }
}
