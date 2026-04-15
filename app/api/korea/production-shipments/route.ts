import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

type ShipmentRow = Record<string, unknown> & {
  items?: unknown
}

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS kr_production_shipments (
      id VARCHAR(50) NOT NULL PRIMARY KEY,
      shipmentNumber VARCHAR(50),
      orderNumber VARCHAR(50),
      destination VARCHAR(100),
      destinationCode VARCHAR(8) DEFAULT 'KR',
      destinationAddress TEXT,
      status VARCHAR(30) DEFAULT 'packed',
      shipDate DATE,
      estimatedDelivery DATE,
      carrier VARCHAR(120),
      trackingNumber VARCHAR(120),
      priority VARCHAR(20) DEFAULT 'normal',
      items JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  // Compatibility for older schema that used ENUM without ML.
  try { await query(`ALTER TABLE kr_production_shipments MODIFY destinationCode VARCHAR(8) DEFAULT 'KR'`) } catch {}
  try { await query(`ALTER TABLE kr_production_shipments MODIFY destination VARCHAR(100)`) } catch {}
  try { await query(`ALTER TABLE kr_production_shipments ADD UNIQUE KEY uq_kr_production_shipments_shipment_number (shipmentNumber)`) } catch {}
}

function parseItems(value: unknown) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function GET() {
  try {
    await ensureTable()
    const rows = await query('SELECT * FROM kr_production_shipments ORDER BY created_at DESC') as ShipmentRow[]
    return NextResponse.json(rows.map(r => ({
      ...r,
      items: parseItems(r.items),
    })))
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const { id, shipmentNumber, orderNumber, destination, destinationCode, destinationAddress, status, shipDate, estimatedDelivery, carrier, trackingNumber, priority, items } = body
    const dupRows = await query(
      `SELECT id FROM kr_production_shipments WHERE shipmentNumber = ? LIMIT 1`,
      [shipmentNumber]
    ) as Array<{ id?: string }>
    if (dupRows.length > 0) {
      return NextResponse.json({ success: false, error: 'Duplicate shipment number' }, { status: 409 })
    }
    await query(
      `INSERT INTO kr_production_shipments (id,shipmentNumber,orderNumber,destination,destinationCode,destinationAddress,status,shipDate,estimatedDelivery,carrier,trackingNumber,priority,items)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, shipmentNumber, orderNumber, destination ?? 'Korea', destinationCode ?? 'KR', destinationAddress ?? '', status ?? 'packed', shipDate ?? null, estimatedDelivery, carrier ?? null, trackingNumber ?? null, priority ?? 'normal', JSON.stringify(items ?? [])]
    )
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const { id, status, shipDate, carrier, trackingNumber } = body
    await query(
      `UPDATE kr_production_shipments SET status=?, shipDate=?, carrier=?, trackingNumber=? WHERE id=?`,
      [status, shipDate ?? null, carrier ?? null, trackingNumber ?? null, id]
    )
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
