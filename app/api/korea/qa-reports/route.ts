import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

type DbErrorLike = {
  message?: string
  code?: string
  errno?: number
  sqlState?: string
}

type QaRow = Record<string, unknown> & {
  id?: string
  orderNumber?: string
  productionNumber?: string
  billId?: string
}

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS kr_qa_reports (
      id VARCHAR(50) NOT NULL PRIMARY KEY,
      date DATE,
      station VARCHAR(100),
      inspector VARCHAR(100),
      status ENUM('pass','fail','pending') DEFAULT 'pending',
      notes TEXT,
      billId VARCHAR(50),
      product VARCHAR(200),
      qty INT DEFAULT 0,
      orderNumber VARCHAR(50),
      productionNumber VARCHAR(50),
      serialNumbers JSON,
      inspections JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

function parseJsonArray(value: unknown) {
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

function toErrorPayload(err: unknown) {
  const e = (err || {}) as DbErrorLike
  return {
    error: e.message || 'Unknown error',
    code: e.code || null,
    errno: e.errno || null,
    sqlState: e.sqlState || null,
  }
}

async function getExistingShipmentTables() {
  const candidates = ['kr_production_shipments', 'kr_domestic_shipments', 'kr_int_shipments']
  const existing: string[] = []
  for (const table of candidates) {
    const rows = await query(
      `SELECT 1 AS ok
         FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = ?
        LIMIT 1`,
      [table]
    ) as Array<{ ok?: number }>
    if (rows.length > 0) existing.push(table)
  }
  return existing
}

async function findLockedOrderRefs(refs: string[]) {
  const cleaned = Array.from(new Set(refs.map(v => String(v || '').trim()).filter(Boolean)))
  if (cleaned.length === 0) return new Set<string>()

  const tables = await getExistingShipmentTables()
  if (tables.length === 0) return new Set<string>()

  const placeholders = cleaned.map(() => '?').join(',')
  const locked = new Set<string>()
  for (const table of tables) {
    const rows = await query(
      `SELECT DISTINCT orderNumber
         FROM ${table}
        WHERE orderNumber IN (${placeholders})`,
      cleaned
    ) as Array<{ orderNumber?: string }>
    for (const row of rows) {
      const key = String(row.orderNumber || '').trim()
      if (key) locked.add(key)
    }
  }
  return locked
}

function refsFromQaRow(row: QaRow) {
  return Array.from(
    new Set([
      String(row.orderNumber || '').trim(),
      String(row.productionNumber || '').trim(),
      String(row.billId || '').trim(),
    ].filter(Boolean))
  )
}

function yyyymmdd(dateValue?: unknown) {
  const source = dateValue instanceof Date
    ? dateValue.toISOString().slice(0, 10)
    : String(dateValue || new Date().toISOString().slice(0, 10))
  const onlyDigits = source.slice(0, 10).replace(/-/g, '')
  return /^\d{8}$/.test(onlyDigits) ? onlyDigits : new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

function detectCountryCode(orderNumber?: string, station?: string) {
  const fromOrder = String(orderNumber || '').toUpperCase().match(/^PDO([A-Z]{2})/)
  if (fromOrder?.[1]) return fromOrder[1]
  const stationKey = String(station || '').trim().toLowerCase()
  if (stationKey.includes('thailand')) return 'TH'
  if (stationKey.includes('malaysia')) return 'ML'
  if (stationKey.includes('vietnam')) return 'VT'
  if (stationKey.includes('brunei')) return 'BN'
  if (stationKey.includes('korea')) return 'KR'
  return 'KR'
}

async function generateQaReportId(date?: string, countryCode?: string) {
  const day = yyyymmdd(date)
  const cc = String(countryCode || 'KR').toUpperCase().slice(0, 2)
  const prefix = `QAQC-${day}${cc}`
  const rows = await query(
    `SELECT id
       FROM kr_qa_reports
      WHERE id LIKE ?
      ORDER BY id DESC
      LIMIT 1`,
    [`${prefix}%`]
  ) as Array<{ id?: string }>
  const last = String(rows?.[0]?.id || '')
  const lastSeq = last.startsWith(prefix) ? Number(last.slice(prefix.length)) || 0 : 0
  const seq = String(lastSeq + 1).padStart(6, '0')
  return `${prefix}${seq}`
}

async function migrateLegacyQaIds() {
  const legacyRows = await query(
    `SELECT id, date, station, orderNumber
       FROM kr_qa_reports
      WHERE id LIKE 'QA-%'
      ORDER BY created_at ASC, id ASC
      LIMIT 500`
  ) as Array<{ id?: string; date?: unknown; station?: string; orderNumber?: string }>

  if (!legacyRows.length) return

  for (const row of legacyRows) {
    const oldId = String(row.id || '').trim()
    if (!oldId) continue
    const day = yyyymmdd(row.date)
    const cc = detectCountryCode(row.orderNumber, row.station)
    const prefix = `QAQC-${day}${cc}`

    for (let attempt = 0; attempt < 10; attempt++) {
      const latest = await query(
        `SELECT id FROM kr_qa_reports WHERE id LIKE ? ORDER BY id DESC LIMIT 1`,
        [`${prefix}%`]
      ) as Array<{ id?: string }>
      const lastId = String(latest?.[0]?.id || '')
      const lastSeq = lastId.startsWith(prefix) ? Number(lastId.slice(prefix.length)) || 0 : 0
      const newId = `${prefix}${String(lastSeq + 1).padStart(6, '0')}`

      try {
        await query(`UPDATE kr_qa_reports SET id = ? WHERE id = ?`, [newId, oldId])
        break
      } catch (updateErr: unknown) {
        const code = (updateErr as DbErrorLike)?.code
        if (code === 'ER_DUP_ENTRY') continue
        throw updateErr
      }
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable()
    await migrateLegacyQaIds()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (id) {
      const rows = await query('SELECT * FROM kr_qa_reports WHERE id = ? LIMIT 1', [id]) as QaRow[]
      const row = rows[0]
      if (!row) return NextResponse.json(null)
      const rowRefs = refsFromQaRow(row)
      const lockedRefs = await findLockedOrderRefs(rowRefs)
      return NextResponse.json({
        ...row,
        serialNumbers: parseJsonArray(row.serialNumbers),
        inspections: parseJsonArray(row.inspections),
        isLocked: rowRefs.some(ref => lockedRefs.has(ref)),
      })
    }
    const rows = await query('SELECT * FROM kr_qa_reports ORDER BY date DESC LIMIT 200') as QaRow[]
    const allRefs = rows.flatMap((row) => refsFromQaRow(row))
    const lockedRefs = await findLockedOrderRefs(allRefs)
    return NextResponse.json(rows.map((r) => ({
      ...r,
      serialNumbers: parseJsonArray(r.serialNumbers),
      inspections: parseJsonArray(r.inspections),
      isLocked: refsFromQaRow(r).some(ref => lockedRefs.has(ref)),
    })))
  } catch (err: unknown) {
    console.error('GET /api/korea/qa-reports failed:', err)
    return NextResponse.json(toErrorPayload(err), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const { date, station, inspector, status, notes, billId, product, qty, orderNumber, productionNumber, serialNumbers, inspections } = body
    const normalizedStatus = String(status || 'pending').toLowerCase()
    const countryCode = detectCountryCode(orderNumber, station)

    for (let attempt = 0; attempt < 10; attempt++) {
      const reportId = await generateQaReportId(date, countryCode)
      try {
        await query(
          `INSERT INTO kr_qa_reports (id, date, station, inspector, status, notes, billId, product, qty, orderNumber, productionNumber, serialNumbers, inspections)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [reportId, date || new Date().toISOString().split('T')[0], station, inspector, normalizedStatus, notes || null, billId || null, product || null, qty || 0, orderNumber || null, productionNumber || null, JSON.stringify(serialNumbers || []), JSON.stringify(inspections || [])]
        )
        return NextResponse.json({ success: true, id: reportId })
      } catch (insertErr: unknown) {
        const code = (insertErr as DbErrorLike)?.code
        if (code === 'ER_DUP_ENTRY') continue
        throw insertErr
      }
    }
    return NextResponse.json({ error: 'Failed to generate unique QAQC report id' }, { status: 500 })
  } catch (err: unknown) {
    console.error('POST /api/korea/qa-reports failed:', err)
    return NextResponse.json(toErrorPayload(err), { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const id = body?.id
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
    }
    const updates = (body?.updates && typeof body.updates === 'object' ? body.updates : body) as Record<string, unknown>
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const existingRows = await query(
      'SELECT id, orderNumber, productionNumber, billId FROM kr_qa_reports WHERE id = ? LIMIT 1',
      [id]
    ) as QaRow[]
    const existing = existingRows[0]
    if (!existing) return NextResponse.json({ error: 'report not found' }, { status: 404 })
    const lockedRefs = await findLockedOrderRefs(refsFromQaRow(existing))
    if (refsFromQaRow(existing).some(ref => lockedRefs.has(ref))) {
      return NextResponse.json(
        { error: 'This bill is already used in shipment/delivery and cannot be edited.' },
        { status: 409 }
      )
    }
    delete updates.id
    if (updates.serialNumbers !== undefined) updates.serialNumbers = JSON.stringify(updates.serialNumbers)
    if (updates.inspections !== undefined) updates.inspections = JSON.stringify(updates.inspections)
    if (updates.status !== undefined) updates.status = String(updates.status).toLowerCase()
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ')
    if (!fields) return NextResponse.json({ error: 'no fields to update' }, { status: 400 })
    const values = [...Object.values(updates), id]
    await query(`UPDATE kr_qa_reports SET ${fields} WHERE id = ?`, values)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('PATCH /api/korea/qa-reports failed:', err)
    return NextResponse.json(toErrorPayload(err), { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureTable()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await query('DELETE FROM kr_qa_reports WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('DELETE /api/korea/qa-reports failed:', err)
    return NextResponse.json(toErrorPayload(err), { status: 500 })
  }
}
