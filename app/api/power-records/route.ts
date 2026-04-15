import { NextResponse } from 'next/server'
import { queryKsave } from '@/lib/mysql-ksave'

// Use Node.js runtime for MySQL connection (edge runtime doesn't support mysql2)
export const dynamic = 'force-dynamic'

type RecordScope = 'installed' | 'pre_install'

const SCOPE_TO_TABLE: Record<RecordScope, string> = {
  installed: 'power_records',
  pre_install: 'power_records_preinstall'
}

const normalizeRecordScope = (scope?: string | null): RecordScope | null => {
  if (!scope) return null
  const normalized = String(scope).trim().toLowerCase()
  if (normalized === 'installed') return 'installed'
  if (normalized === 'pre_install' || normalized === 'pre-install' || normalized === 'preinstall') return 'pre_install'
  return null
}

async function tableExists(tableName: string): Promise<boolean> {
  const rows = await queryKsave(
    `SELECT COUNT(*) AS total
       FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?`,
    [tableName]
  )
  return Number(rows?.[0]?.total || 0) > 0
}

/**
 * GET /api/power-records
 *
 * Query parameters:
 * - limit: number of records to return (default: 100)
 * - deviceId: filter by specific device ID
 * - ksaveId: filter by specific ksave ID
 * - startTime: filter records after this datetime
 * - endTime: filter records before this datetime
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') || 100)
    const scope = normalizeRecordScope(url.searchParams.get('scope')) ?? 'installed'
    const targetTable = SCOPE_TO_TABLE[scope]
    const deviceId = url.searchParams.get('deviceId')
    const ksaveId = url.searchParams.get('ksaveId')
    const startTime = url.searchParams.get('startTime')
    const endTime = url.searchParams.get('endTime')

    const targetTableExists = await tableExists(targetTable)
    if (!targetTableExists) {
      return NextResponse.json({
        ok: false,
        error: `Target table '${targetTable}' not found. Please run migration to enable ${scope} storage.`
      }, { status: 500 })
    }

    // Build SQL query - Query from devices and LEFT JOIN latest power_records
    // This ensures all devices are shown even if they don't have power records yet
    let sql = `
      SELECT
        d.deviceID,
        d.deviceName,
        d.ksaveID,
        d.series_no,
        d.location,
        d.ipAddress,
        d.phone,
        d.beforeMeterNo,
        d.metricsMeterNo,
        d.status,
        p.id,
        p.record_time,
        p.before_L1, p.before_L2, p.before_L3, p.before_kWh, p.before_P, p.before_Q, p.before_S, p.before_PF, p.before_THD, p.before_F,
        p.metrics_L1, p.metrics_L2, p.metrics_L3, p.metrics_kWh, p.metrics_P, p.metrics_Q, p.metrics_S, p.metrics_PF, p.metrics_THD, p.metrics_F,
        p.energy_reduction, p.co2_reduction,
        p.created_at, p.updated_at, p.created_by
      FROM devices d
      LEFT JOIN (
        SELECT p1.* FROM ${targetTable} p1
        INNER JOIN (
          SELECT device_id, MAX(record_time) as max_time
          FROM ${targetTable}
          GROUP BY device_id
        ) p2 ON p1.device_id = p2.device_id AND p1.record_time = p2.max_time
      ) p ON d.deviceID = p.device_id
      WHERE 1=1
    `
    const params: any[] = []

    if (deviceId) {
      sql += ' AND d.deviceID = ?'
      params.push(deviceId)
    }

    if (ksaveId) {
      sql += ' AND d.ksaveID = ?'
      params.push(ksaveId)
    }

    if (startTime && endTime) {
      sql += ' AND p.record_time >= ? AND p.record_time <= ?'
      params.push(startTime, endTime)
    }

    sql += ' ORDER BY d.deviceID ASC'

    if (limit > 0) {
      sql += ' LIMIT ?'
      params.push(limit)
    }

    const records = await queryKsave(sql, params)

    // Transform to match expected format
    const transformed = records.map((r: any) => ({
      id: r.id,
      device_id: r.device_id,
      device: r.deviceName || r.ksaveID || `Device${r.device_id}`,
      ksave: r.ksaveID,
      series_no: r.series_no,
      location: r.location,
      ipAddress: r.ipAddress,
      phone: r.phone,
      beforeMeterNo: r.beforeMeterNo,
      metricsMeterNo: r.metricsMeterNo,
      status: r.status,
      time: r.record_time,

      // Power Before
      power_before: {
        L1: Number(r.before_L1) || 0,
        L2: Number(r.before_L2) || 0,
        L3: Number(r.before_L3) || 0,
        kWh: Number(r.before_kWh) || 0,
        P: Number(r.before_P) || 0,
        Q: Number(r.before_Q) || 0,
        S: Number(r.before_S) || 0,
        PF: Number(r.before_PF) || 0,
        THD: Number(r.before_THD) || 0,
        F: Number(r.before_F) || 0
      },

      // Power Metrics (current)
      power_metrics: {
        L1: Number(r.metrics_L1) || 0,
        L2: Number(r.metrics_L2) || 0,
        L3: Number(r.metrics_L3) || 0,
        kWh: Number(r.metrics_kWh) || 0,
        P: Number(r.metrics_P) || 0,
        Q: Number(r.metrics_Q) || 0,
        S: Number(r.metrics_S) || 0,
        PF: Number(r.metrics_PF) || 0,
        THD: Number(r.metrics_THD) || 0,
        F: Number(r.metrics_F) || 0
      },

      // Calculated savings
      energy_reduction: Number(r.energy_reduction) || 0,
      co2_reduction: Number(r.co2_reduction) || 0,

      // Metadata
      created_at: r.created_at,
      updated_at: r.updated_at,
      created_by: r.created_by
    }))

    return NextResponse.json({
      ok: true,
      scope,
      target_table: targetTable,
      count: transformed.length,
      rows: transformed
    })

  } catch (error: any) {
    console.error('Error fetching power records:', error)

    // Return fallback sample data if database is unavailable
    const sampleData = [
      {
        id: 1,
        device_id: 1,
        device: 'Ksave01',
        ksave: 'KSAVE01',
        series_no: 'KS2024010001',
        location: 'Site A',
        time: new Date().toISOString(),
        power_before: { L1: 220.5, L2: 221.3, L3: 219.8, kWh: 10.5, P: 150.5, Q: 50.2, S: 158.7, PF: 0.95, THD: 2.1, F: 50.0 },
        power_metrics: { L1: 220.2, L2: 221.0, L3: 219.5, kWh: 8.3, P: 120.3, Q: 40.1, S: 126.8, PF: 0.95, THD: 1.8, F: 50.0 },
        energy_reduction: 2.2,
        co2_reduction: 1.1297
      },
      {
        id: 2,
        device_id: 2,
        device: 'Ksave02',
        ksave: 'KSAVE02',
        series_no: 'KS2024010002',
        location: 'Site B',
        time: new Date(Date.now() - 60000).toISOString(),
        power_before: { L1: 219.8, L2: 220.5, L3: 221.2, kWh: 12.2, P: 145.2, Q: 48.5, S: 152.9, PF: 0.95, THD: 2.3, F: 50.0 },
        power_metrics: { L1: 219.5, L2: 220.2, L3: 220.9, kWh: 9.8, P: 115.8, Q: 38.7, S: 122.1, PF: 0.95, THD: 2.0, F: 50.0 },
        energy_reduction: 2.4,
        co2_reduction: 1.2324
      },
      {
        id: 3,
        device_id: 3,
        device: 'Ksave03',
        ksave: 'KSAVE03',
        series_no: 'KS2024010003',
        location: 'Site E',
        time: new Date(Date.now() - 120000).toISOString(),
        power_before: { L1: 221.1, L2: 219.9, L3: 220.6, kWh: 11.8, P: 138.9, Q: 46.3, S: 146.3, PF: 0.95, THD: 2.2, F: 50.0 },
        power_metrics: { L1: 220.8, L2: 219.6, L3: 220.3, kWh: 9.2, P: 110.5, Q: 36.9, S: 116.5, PF: 0.95, THD: 1.9, F: 50.0 },
        energy_reduction: 2.6,
        co2_reduction: 1.3351
      }
    ]

    return NextResponse.json({
      ok: true,
      count: sampleData.length,
      rows: sampleData,
      note: 'fallback-sample',
      error: error.message
    })
  }
}
