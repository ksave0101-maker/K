import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export const runtime = 'nodejs'
export const maxDuration = 10

/**
 * Sync InfluxDB power data to PostgreSQL
 * This endpoint fetches current power data from InfluxDB and stores it in PostgreSQL
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { data } = body || {}

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Missing data array' }, { status: 400 })
    }

    // Insert or update data in PostgreSQL
    const results = []
    for (const record of data) {
      const {
        device,
        ksave_id,
        location,
        time,
        power_before,
        power_metrics,
        er
      } = record

      if (!device || !time) {
        continue // Skip invalid records
      }

      // Calculate ER if not provided
      let calculatedER = er
      if (!calculatedER && power_before?.P && power_metrics?.P) {
        calculatedER = power_before.P - power_metrics.P
      }

      // Insert data into PostgreSQL
      try {
        await query(`
          INSERT INTO influx_power_data (
            device, ksave_id, location, measurement_time,
            before_l1, before_l2, before_l3, before_kwh, before_p, before_q, before_s, before_pf, before_thd, before_f,
            metrics_l1, metrics_l2, metrics_l3, metrics_kwh, metrics_p, metrics_q, metrics_s, metrics_pf, metrics_thd, metrics_f,
            er
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
            $25
          )
          ON CONFLICT (device, measurement_time)
          DO UPDATE SET
            ksave_id = EXCLUDED.ksave_id,
            location = EXCLUDED.location,
            before_l1 = EXCLUDED.before_l1,
            before_l2 = EXCLUDED.before_l2,
            before_l3 = EXCLUDED.before_l3,
            before_kwh = EXCLUDED.before_kwh,
            before_p = EXCLUDED.before_p,
            before_q = EXCLUDED.before_q,
            before_s = EXCLUDED.before_s,
            before_pf = EXCLUDED.before_pf,
            before_thd = EXCLUDED.before_thd,
            before_f = EXCLUDED.before_f,
            metrics_l1 = EXCLUDED.metrics_l1,
            metrics_l2 = EXCLUDED.metrics_l2,
            metrics_l3 = EXCLUDED.metrics_l3,
            metrics_kwh = EXCLUDED.metrics_kwh,
            metrics_p = EXCLUDED.metrics_p,
            metrics_q = EXCLUDED.metrics_q,
            metrics_s = EXCLUDED.metrics_s,
            metrics_pf = EXCLUDED.metrics_pf,
            metrics_thd = EXCLUDED.metrics_thd,
            metrics_f = EXCLUDED.metrics_f,
            er = EXCLUDED.er,
            updated_at = CURRENT_TIMESTAMP
        `, [
          device,
          ksave_id || null,
          location || null,
          time,
          power_before?.L1 || null,
          power_before?.L2 || null,
          power_before?.L3 || null,
          power_before?.kWh || null,
          power_before?.P || null,
          power_before?.Q || null,
          power_before?.S || null,
          power_before?.PF || null,
          power_before?.THD || null,
          power_before?.F || null,
          power_metrics?.L1 || null,
          power_metrics?.L2 || null,
          power_metrics?.L3 || null,
          power_metrics?.kWh || null,
          power_metrics?.P || null,
          power_metrics?.Q || null,
          power_metrics?.S || null,
          power_metrics?.PF || null,
          power_metrics?.THD || null,
          power_metrics?.F || null,
          calculatedER || null
        ])

        results.push({ device, status: 'synced' })
      } catch (insertErr: any) {
        console.error(`Failed to sync device ${device}:`, insertErr)
        results.push({ device, status: 'failed', error: insertErr.message })
      }
    }

    return NextResponse.json({
      ok: true,
      synced: results.filter(r => r.status === 'synced').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    })

  } catch (err: any) {
    console.error('Sync error:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get synced data from PostgreSQL
 * Query parameters:
 * - device: filter by device name
 * - limit: number of records to return (default 100)
 * - offset: pagination offset
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const device = url.searchParams.get('device')
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let sql = `
      SELECT * FROM influx_power_data
    `
    const params: any[] = []

    if (device) {
      sql += ` WHERE device = $1`
      params.push(device)
      sql += ` ORDER BY measurement_time DESC LIMIT $2 OFFSET $3`
      params.push(limit, offset)
    } else {
      sql += ` ORDER BY measurement_time DESC LIMIT $1 OFFSET $2`
      params.push(limit, offset)
    }

    const rows = await query(sql, params)

    return NextResponse.json({
      ok: true,
      count: rows.length,
      data: rows
    })

  } catch (err: any) {
    console.error('Query error:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || 'Unknown error'
    }, { status: 500 })
  }
}
