import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS kr_shipment_updates (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    shipmentNumber VARCHAR(50) NOT NULL,
    orderNumber VARCHAR(50) NOT NULL,
    destination ENUM('Korea','Brunei','Thailand','Vietnam') NOT NULL DEFAULT 'Korea',
    destCode ENUM('KR','BN','TH','VN') NOT NULL DEFAULT 'KR',
    shipmentMethod ENUM('land','sea','air') NOT NULL DEFAULT 'sea',
    currentStatus ENUM('preparing','in-transit','customs','delivered') NOT NULL DEFAULT 'preparing',
    currentLocation VARCHAR(255) DEFAULT NULL,
    estimatedDelivery DATE DEFAULT NULL,
    trackingNumber VARCHAR(100) DEFAULT NULL,
    carrier VARCHAR(150) DEFAULT NULL,
    lastUpdate DATETIME DEFAULT NULL,
    destinationAddress TEXT DEFAULT NULL,
    contactPerson VARCHAR(150) DEFAULT NULL,
    contactPhone VARCHAR(100) DEFAULT NULL,
    packagingNote TEXT DEFAULT NULL,
    totalWeight VARCHAR(50) DEFAULT NULL,
    totalBoxes INT NOT NULL DEFAULT 0,
    items JSON DEFAULT NULL,
    updates JSON DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_kr_shipment_updates_shipment_number (shipmentNumber),
    KEY idx_kr_shipment_updates_order_number (orderNumber),
    KEY idx_kr_shipment_updates_status (currentStatus),
    KEY idx_kr_shipment_updates_destination (destCode),
    KEY idx_kr_shipment_updates_estimated_delivery (estimatedDelivery),
    CONSTRAINT chk_kr_shipment_updates_items_json CHECK (json_valid(items)),
    CONSTRAINT chk_kr_shipment_updates_updates_json CHECK (json_valid(updates))
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`

type ShipmentUpdateLog = {
  timestamp: string
  location: string
  status: string
  notes: string
}

type ShipmentUpdateRow = Record<string, unknown> & {
  items?: unknown
  updates?: unknown
}

type ShipmentUpdatePayload = Record<string, unknown> & {
  id?: string
  shipmentNumber?: string
  orderNumber?: string
  destination?: string
  destCode?: string
  shipmentMethod?: string
  currentStatus?: string
  currentLocation?: string
  estimatedDelivery?: string | null
  trackingNumber?: string | null
  carrier?: string | null
  lastUpdate?: string | null
  destinationAddress?: string | null
  contactPerson?: string | null
  contactPhone?: string | null
  packagingNote?: string | null
  totalWeight?: string | null
  totalBoxes?: number | string | null
  items?: unknown
  updates?: unknown
  appendUpdate?: ShipmentUpdateLog
}

async function ensureTable() {
  await query(CREATE_TABLE_SQL)
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (!value) return fallback
  if (Array.isArray(value) || typeof value === 'object') return value as T
  if (typeof value !== 'string') return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function normalizeRow(row: ShipmentUpdateRow) {
  return {
    ...row,
    items: parseJsonField(row.items, []),
    updates: parseJsonField(row.updates, []),
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable()

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const currentStatus = searchParams.get('currentStatus')
    const destination = searchParams.get('destination')

    if (id) {
      const rows = await query('SELECT * FROM kr_shipment_updates WHERE id = ?', [id]) as ShipmentUpdateRow[]
      return NextResponse.json(rows[0] ? normalizeRow(rows[0]) : null)
    }

    let sql = 'SELECT * FROM kr_shipment_updates WHERE 1=1'
    const params: unknown[] = []

    if (currentStatus) {
      sql += ' AND currentStatus = ?'
      params.push(currentStatus)
    }

    if (destination) {
      sql += ' AND destination = ?'
      params.push(destination)
    }

    sql += ' ORDER BY COALESCE(lastUpdate, created_at) DESC, created_at DESC'

    const rows = await query(sql, params) as ShipmentUpdateRow[]
    return NextResponse.json(rows.map(normalizeRow))
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable()

    const body = await req.json() as ShipmentUpdatePayload
    const id = body.id || `ship-${Date.now()}`
    const updates = Array.isArray(body.updates) ? body.updates : []
    const items = Array.isArray(body.items) ? body.items : []

    await query(
      `INSERT INTO kr_shipment_updates
       (id, shipmentNumber, orderNumber, destination, destCode, shipmentMethod, currentStatus, currentLocation, estimatedDelivery,
        trackingNumber, carrier, lastUpdate, destinationAddress, contactPerson, contactPhone, packagingNote, totalWeight,
        totalBoxes, items, updates)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.shipmentNumber,
        body.orderNumber,
        body.destination ?? 'Korea',
        body.destCode ?? 'KR',
        body.shipmentMethod ?? 'sea',
        body.currentStatus ?? 'preparing',
        body.currentLocation ?? null,
        body.estimatedDelivery || null,
        body.trackingNumber || null,
        body.carrier || null,
        body.lastUpdate || null,
        body.destinationAddress || null,
        body.contactPerson || null,
        body.contactPhone || null,
        body.packagingNote || null,
        body.totalWeight || null,
        Number(body.totalBoxes ?? 0),
        JSON.stringify(items),
        JSON.stringify(updates),
      ]
    )

    return NextResponse.json({ success: true, id })
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureTable()

    const body = await req.json() as ShipmentUpdatePayload
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const updates: string[] = []
    const params: unknown[] = []

    const pushField = (column: string, value: unknown, transform?: (input: unknown) => unknown) => {
      if (value === undefined) return
      updates.push(`${column} = ?`)
      params.push(transform ? transform(value) : value)
    }

    pushField('shipmentNumber', body.shipmentNumber)
    pushField('orderNumber', body.orderNumber)
    pushField('destination', body.destination)
    pushField('destCode', body.destCode)
    pushField('shipmentMethod', body.shipmentMethod)
    pushField('currentStatus', body.currentStatus)
    pushField('currentLocation', body.currentLocation)
    pushField('estimatedDelivery', body.estimatedDelivery || null)
    pushField('trackingNumber', body.trackingNumber || null)
    pushField('carrier', body.carrier || null)
    pushField('lastUpdate', body.lastUpdate || null)
    pushField('destinationAddress', body.destinationAddress || null)
    pushField('contactPerson', body.contactPerson || null)
    pushField('contactPhone', body.contactPhone || null)
    pushField('packagingNote', body.packagingNote || null)
    pushField('totalWeight', body.totalWeight || null)
    pushField('totalBoxes', body.totalBoxes, (value) => Number(value ?? 0))

    if (body.items !== undefined) {
      pushField('items', Array.isArray(body.items) ? body.items : [], (value) => JSON.stringify(value))
    }

    if (body.updates !== undefined) {
      pushField('updates', Array.isArray(body.updates) ? body.updates : [], (value) => JSON.stringify(value))
    } else if (body.appendUpdate) {
      const rows = await query('SELECT updates FROM kr_shipment_updates WHERE id = ?', [id]) as ShipmentUpdateRow[]
      const existingUpdates = parseJsonField<ShipmentUpdateLog[]>(rows[0]?.updates, [])
      const mergedUpdates = [body.appendUpdate as ShipmentUpdateLog, ...existingUpdates]
      pushField('updates', mergedUpdates, (value) => JSON.stringify(value))

      if (body.lastUpdate === undefined && body.appendUpdate.timestamp) {
        pushField('lastUpdate', body.appendUpdate.timestamp)
      }
      if (body.currentLocation === undefined && body.appendUpdate.location) {
        pushField('currentLocation', body.appendUpdate.location)
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    params.push(id)
    await query(`UPDATE kr_shipment_updates SET ${updates.join(', ')} WHERE id = ?`, params)

    const rows = await query('SELECT * FROM kr_shipment_updates WHERE id = ?', [id]) as ShipmentUpdateRow[]
    return NextResponse.json({ success: true, shipment: rows[0] ? normalizeRow(rows[0]) : null })
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}
