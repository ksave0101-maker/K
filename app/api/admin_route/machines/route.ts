import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export const runtime = 'nodejs'
export const maxDuration = 10

type DeviceColumnRow = {
  COLUMN_NAME: string
}

type InsertResultRow = {
  insertId?: number
}

type DeviceRecord = Record<string, unknown>

const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key)

const toTrimmedString = (value: unknown) => {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

const toNullableString = (value: unknown) => {
  const normalized = toTrimmedString(value)
  return normalized ? normalized : null
}

const toNullableNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

const toNullableInteger = (value: unknown) => {
  const numericValue = toNullableNumber(value)
  if (numericValue === null) return null
  return Number.isInteger(numericValue) ? numericValue : Math.trunc(numericValue)
}

const normalizeRecordScope = (value: unknown) => {
  const normalized = toTrimmedString(value).toLowerCase()
  if (!normalized) return null
  if (normalized === 'installed') return 'installed'
  if (normalized === 'pre_install' || normalized === 'pre-install' || normalized === 'preinstall') return 'pre_install'
  return null
}

const resolveBodyValue = (body: DeviceRecord, keys: string[]) => {
  for (const key of keys) {
    if (hasOwn(body, key)) return body[key]
  }
  return undefined
}

async function getDeviceColumns() {
  const rows = await query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'devices'`
  ) as DeviceColumnRow[]

  return new Set(rows.map((row) => String(row.COLUMN_NAME)))
}

function appendInsertField(
  fields: Array<[string, unknown]>,
  availableColumns: Set<string>,
  columnName: string,
  value: unknown
) {
  if (!availableColumns.has(columnName)) return
  if (value === undefined) return
  fields.push([columnName, value])
}

function appendUpdateField(
  updates: Array<[string, unknown]>,
  availableColumns: Set<string>,
  columnName: string,
  value: unknown
) {
  if (!availableColumns.has(columnName)) return
  if (value === undefined) return
  updates.push([columnName, value])
}

async function fetchDeviceById(deviceID: number) {
  const rows = await query(
    'SELECT * FROM devices WHERE deviceID = ? LIMIT 1',
    [deviceID]
  ) as DeviceRecord[]

  return rows[0] || null
}

function buildCreateFields(body: DeviceRecord, availableColumns: Set<string>) {
  const deviceName = toTrimmedString(resolveBodyValue(body, ['name', 'deviceName']))
  const ksaveID = toTrimmedString(resolveBodyValue(body, ['ksave', 'ksaveID']))

  if (!deviceName || !ksaveID) {
    return {
      error: 'deviceName/name and ksaveID/ksave are required'
    }
  }

  const sharedEmail = toTrimmedString(resolveBodyValue(body, ['email']))
  const userEmail = toTrimmedString(resolveBodyValue(body, ['userEmail', 'U_email'])) || sharedEmail
  const partnerEmail = toTrimmedString(resolveBodyValue(body, ['partnerEmail', 'P_email'])) || sharedEmail || userEmail

  const fields: Array<[string, unknown]> = []

  appendInsertField(fields, availableColumns, 'deviceName', deviceName)
  appendInsertField(fields, availableColumns, 'ksaveID', ksaveID)
  appendInsertField(fields, availableColumns, 'series_no', toNullableString(resolveBodyValue(body, ['seriesNo', 'series_no'])))
  appendInsertField(fields, availableColumns, 'ipAddress', toNullableString(resolveBodyValue(body, ['ipAddress'])))
  appendInsertField(fields, availableColumns, 'location', toTrimmedString(resolveBodyValue(body, ['location'])))
  appendInsertField(fields, availableColumns, 'site', toTrimmedString(resolveBodyValue(body, ['site'])) || 'thailand')
  appendInsertField(fields, availableColumns, 'status', toTrimmedString(resolveBodyValue(body, ['status'])) || 'OK')
  appendInsertField(fields, availableColumns, 'beforeMeterNo', toTrimmedString(resolveBodyValue(body, ['beforeMeterNo'])) || '1')
  appendInsertField(fields, availableColumns, 'metricsMeterNo', toTrimmedString(resolveBodyValue(body, ['metricsMeterNo'])) || '2')
  appendInsertField(fields, availableColumns, 'U_email', userEmail)
  appendInsertField(fields, availableColumns, 'P_email', partnerEmail)
  appendInsertField(fields, availableColumns, 'phone', toTrimmedString(resolveBodyValue(body, ['phone'])))
  appendInsertField(fields, availableColumns, 'pass_phone', toTrimmedString(resolveBodyValue(body, ['password', 'pass_phone'])))
  appendInsertField(fields, availableColumns, 'create_by', toTrimmedString(resolveBodyValue(body, ['createdBy', 'create_by'])) || 'administrator')
  appendInsertField(fields, availableColumns, 'latitude', toNullableNumber(resolveBodyValue(body, ['latitude'])))
  appendInsertField(fields, availableColumns, 'longitude', toNullableNumber(resolveBodyValue(body, ['longitude'])))
  appendInsertField(fields, availableColumns, 'customerName', toNullableString(resolveBodyValue(body, ['customerName'])))
  appendInsertField(fields, availableColumns, 'customerNameEn', toNullableString(resolveBodyValue(body, ['customerNameEn'])))
  appendInsertField(fields, availableColumns, 'customerPhone', toNullableString(resolveBodyValue(body, ['customerPhone'])))
  appendInsertField(fields, availableColumns, 'customerAddress', toNullableString(resolveBodyValue(body, ['customerAddress'])))
  appendInsertField(fields, availableColumns, 'customer_id', toNullableInteger(resolveBodyValue(body, ['customerId', 'customer_id'])))

  const recordScope = normalizeRecordScope(resolveBodyValue(body, ['recordScope', 'record_scope']))
  appendInsertField(fields, availableColumns, 'record_scope', recordScope || 'installed')

  return { fields, deviceName, ksaveID }
}

function buildUpdateFields(body: DeviceRecord, availableColumns: Set<string>) {
  const updates: Array<[string, unknown]> = []

  const nextDeviceName = resolveBodyValue(body, ['deviceName', 'name'])
  if (nextDeviceName !== undefined) {
    const normalized = toTrimmedString(nextDeviceName)
    if (!normalized) return { error: 'deviceName cannot be empty' }
    appendUpdateField(updates, availableColumns, 'deviceName', normalized)
  }

  const nextKsaveID = resolveBodyValue(body, ['ksaveID', 'ksave'])
  if (nextKsaveID !== undefined) {
    const normalized = toTrimmedString(nextKsaveID)
    if (!normalized) return { error: 'ksaveID cannot be empty' }
    appendUpdateField(updates, availableColumns, 'ksaveID', normalized)
  }

  appendUpdateField(updates, availableColumns, 'series_no', hasOwn(body, 'seriesNo') || hasOwn(body, 'series_no')
    ? toNullableString(resolveBodyValue(body, ['seriesNo', 'series_no']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'ipAddress', hasOwn(body, 'ipAddress')
    ? toNullableString(resolveBodyValue(body, ['ipAddress']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'location', hasOwn(body, 'location')
    ? toTrimmedString(resolveBodyValue(body, ['location']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'site', hasOwn(body, 'site')
    ? toTrimmedString(resolveBodyValue(body, ['site']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'status', hasOwn(body, 'status')
    ? toTrimmedString(resolveBodyValue(body, ['status']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'beforeMeterNo', hasOwn(body, 'beforeMeterNo')
    ? toTrimmedString(resolveBodyValue(body, ['beforeMeterNo']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'metricsMeterNo', hasOwn(body, 'metricsMeterNo')
    ? toTrimmedString(resolveBodyValue(body, ['metricsMeterNo']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'phone', hasOwn(body, 'phone')
    ? toTrimmedString(resolveBodyValue(body, ['phone']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'pass_phone', hasOwn(body, 'password') || hasOwn(body, 'pass_phone')
    ? toTrimmedString(resolveBodyValue(body, ['password', 'pass_phone']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'create_by', hasOwn(body, 'createdBy') || hasOwn(body, 'create_by')
    ? toTrimmedString(resolveBodyValue(body, ['createdBy', 'create_by']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'latitude', hasOwn(body, 'latitude')
    ? toNullableNumber(resolveBodyValue(body, ['latitude']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'longitude', hasOwn(body, 'longitude')
    ? toNullableNumber(resolveBodyValue(body, ['longitude']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'customerName', hasOwn(body, 'customerName')
    ? toNullableString(resolveBodyValue(body, ['customerName']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'customerNameEn', hasOwn(body, 'customerNameEn')
    ? toNullableString(resolveBodyValue(body, ['customerNameEn']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'customerPhone', hasOwn(body, 'customerPhone')
    ? toNullableString(resolveBodyValue(body, ['customerPhone']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'customerAddress', hasOwn(body, 'customerAddress')
    ? toNullableString(resolveBodyValue(body, ['customerAddress']))
    : undefined)
  appendUpdateField(updates, availableColumns, 'customer_id', hasOwn(body, 'customerId') || hasOwn(body, 'customer_id')
    ? toNullableInteger(resolveBodyValue(body, ['customerId', 'customer_id']))
    : undefined)

  if (hasOwn(body, 'recordScope') || hasOwn(body, 'record_scope')) {
    const recordScope = normalizeRecordScope(resolveBodyValue(body, ['recordScope', 'record_scope']))
    if (!recordScope) {
      return { error: 'recordScope must be installed or pre_install' }
    }
    appendUpdateField(updates, availableColumns, 'record_scope', recordScope)
  }

  const sharedEmailProvided = hasOwn(body, 'email')
  const userEmailProvided = hasOwn(body, 'userEmail') || hasOwn(body, 'U_email') || sharedEmailProvided
  const partnerEmailProvided = hasOwn(body, 'partnerEmail') || hasOwn(body, 'P_email')

  if (userEmailProvided) {
    const userEmail = toTrimmedString(resolveBodyValue(body, ['userEmail', 'U_email', 'email']))
    appendUpdateField(updates, availableColumns, 'U_email', userEmail)

    if (!partnerEmailProvided && sharedEmailProvided) {
      appendUpdateField(updates, availableColumns, 'P_email', userEmail)
    }
  }

  if (partnerEmailProvided) {
    const partnerEmail = toTrimmedString(resolveBodyValue(body, ['partnerEmail', 'P_email']))
    appendUpdateField(updates, availableColumns, 'P_email', partnerEmail)
  }

  return { updates }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as DeviceRecord
    const availableColumns = await getDeviceColumns()
    const createPayload = buildCreateFields(body, availableColumns)

    if ('error' in createPayload) {
      return NextResponse.json({ ok: false, error: createPayload.error }, { status: 400 })
    }

    const columns = createPayload.fields.map(([columnName]) => columnName)
    const values = createPayload.fields.map(([, value]) => value)

    const insertResult = await query(
      `INSERT INTO devices (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      values
    ) as InsertResultRow[]

    const insertedId = Number(insertResult[0]?.insertId || 0)
    const savedDevice = insertedId > 0
      ? await fetchDeviceById(insertedId)
      : (
          await query(
            `SELECT *
             FROM devices
             WHERE ksaveID = ?
             ORDER BY deviceID DESC
             LIMIT 1`,
            [createPayload.ksaveID]
          ) as DeviceRecord[]
        )[0] || null

    let influxWritten = false

    try {
      const influxHost = process.env.INFLUX_HOST || process.env.DOCKER_INFLUXDB_INIT_HOST || process.env.INFLUX_URL || 'http://127.0.0.1:8086'
      const influxOrg = process.env.INFLUX_ORG || process.env.DOCKER_INFLUXDB_INIT_ORG || 'K-Energy_Save'
      const influxBucket = process.env.INFLUX_BUCKET || process.env.DOCKER_INFLUXDB_INIT_BUCKET || 'k_db'
      const influxToken = process.env.INFLUX_TOKEN || process.env.DOCKER_INFLUXDB_INIT_TOKEN || ''

      const escTag = (value: unknown) => String(value).replace(/,/g, '\\,').replace(/ /g, '\\ ').replace(/=/g, '\\=')
      const escMeasurement = (value: unknown) => String(value).replace(/,/g, '\\,').replace(/ /g, '\\ ')
      const formatFieldValue = (value: unknown) => {
        if (value === null || value === undefined) return '""'
        if (typeof value === 'boolean') return value ? 'true' : 'false'
        if (typeof value === 'number') return Number.isInteger(value) ? `${value}i` : String(value)
        return `"${String(value).replace(/"/g, '\\"')}"`
      }

      const tagEntries: Record<string, unknown> = { device: createPayload.ksaveID }
      const location = toTrimmedString(resolveBodyValue(body, ['location']))
      if (location) tagEntries.site = location
      if (createPayload.deviceName) tagEntries.name = createPayload.deviceName

      const fields: Record<string, unknown> = { registered: true, createdAt: new Date().toISOString() }

      const tagPart = Object.entries(tagEntries).map(([key, value]) => `${escTag(key)}=${escTag(value)}`).join(',')
      const fieldPart = Object.entries(fields).map(([key, value]) => `${key}=${formatFieldValue(value)}`).join(',')
      const head = tagPart ? `${escMeasurement('machines')},${tagPart}` : escMeasurement('machines')
      const line = `${head} ${fieldPart}`

      const writeUrl = `${influxHost.replace(/\/$/, '')}/api/v2/write?org=${encodeURIComponent(influxOrg)}&bucket=${encodeURIComponent(influxBucket)}&precision=s`
      const headers: Record<string, string> = { 'Content-Type': 'text/plain; charset=utf-8' }
      if (influxToken) headers.Authorization = `Token ${influxToken}`

      const influxRes = await fetch(writeUrl, {
        method: 'POST',
        headers,
        body: line,
      })

      if (influxRes.ok) {
        influxWritten = true
      } else {
        console.warn('InfluxDB write failed (non-critical):', influxRes.status, await influxRes.text())
      }
    } catch (influxError: unknown) {
      console.warn('InfluxDB write error (non-critical):', influxError)
    }

    return NextResponse.json({
      ok: true,
      machine: savedDevice,
      written: 1,
      influxWritten,
      mysqlWritten: true,
      note: influxWritten ? 'Machine saved to both MySQL and InfluxDB' : 'Machine saved to MySQL (InfluxDB write failed)'
    })
  } catch (error: unknown) {
    console.error('Create machine error:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '100', 10)
    const offset = parseInt(url.searchParams.get('offset') || '0', 10)
    const availableColumns = await getDeviceColumns()
    const orderColumn = availableColumns.has('created_at') ? 'created_at' : 'deviceID'

    const devices = await query(
      `SELECT *
       FROM devices
       ORDER BY ${orderColumn} DESC, deviceID DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    ) as DeviceRecord[]

    const total = await query('SELECT COUNT(*) as count FROM devices') as Array<{ count?: number }>

    return NextResponse.json({
      ok: true,
      machines: devices,
      total: Number(total[0]?.count || 0),
      limit,
      offset
    })
  } catch (error: unknown) {
    console.error('Failed to fetch machines:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const deviceID = Number(url.searchParams.get('id') || 0)

    if (!deviceID) {
      return NextResponse.json({
        ok: false,
        error: 'id parameter is required'
      }, { status: 400 })
    }

    const body = await req.json().catch(() => ({})) as DeviceRecord
    const availableColumns = await getDeviceColumns()
    const updatePayload = buildUpdateFields(body, availableColumns)

    if ('error' in updatePayload) {
      return NextResponse.json({
        ok: false,
        error: updatePayload.error
      }, { status: 400 })
    }

    if (updatePayload.updates.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'No fields to update'
      }, { status: 400 })
    }

    if (availableColumns.has('updated_at')) {
      updatePayload.updates.push(['updated_at', 'CURRENT_TIMESTAMP'])
    }

    const setClauses = updatePayload.updates.map(([columnName, value]) => (
      value === 'CURRENT_TIMESTAMP' ? `${columnName} = CURRENT_TIMESTAMP` : `${columnName} = ?`
    ))
    const values = updatePayload.updates
      .filter(([, value]) => value !== 'CURRENT_TIMESTAMP')
      .map(([, value]) => value)

    values.push(deviceID)

    await query(
      `UPDATE devices
       SET ${setClauses.join(', ')}
       WHERE deviceID = ?`,
      values
    )

    const updatedDevice = await fetchDeviceById(deviceID)

    if (!updatedDevice) {
      return NextResponse.json({
        ok: false,
        error: 'Device not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      device: updatedDevice,
      message: 'Device updated successfully'
    })
  } catch (error: unknown) {
    console.error('Failed to update device:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const deviceID = Number(url.searchParams.get('id') || 0)

    if (!deviceID) {
      return NextResponse.json({
        ok: false,
        error: 'id parameter is required'
      }, { status: 400 })
    }

    const device = await fetchDeviceById(deviceID)

    if (!device) {
      return NextResponse.json({
        ok: false,
        error: 'Device not found'
      }, { status: 404 })
    }

    await query('DELETE FROM devices WHERE deviceID = ?', [deviceID])

    return NextResponse.json({
      ok: true,
      deleted: device,
      message: 'Device deleted successfully'
    })
  } catch (error: unknown) {
    console.error('Failed to delete device:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
