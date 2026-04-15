import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export const runtime = 'nodejs'
export const maxDuration = 10

/**
 * POST /api/power-values
 * Save or update power values (power_before and power_metrics) to influx_power_data table
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      device,
      ksaveID,
      location,
      ipAddress,
      beforeMeterNo,
      metricsMeterNo,
      power_before,
      power_metrics,
      time
    } = body

    // Validation
    if (!device && !ksaveID) {
      return NextResponse.json({
        ok: false,
        error: 'Either device or ksaveID is required'
      }, { status: 400 })
    }

    const deviceName = device || ksaveID
    const ksave = ksaveID || device
    const measurementTime = time ? new Date(time) : new Date()

    // Update or insert device info first
    try {
      await query(`
        INSERT INTO devices ("deviceName", "ksaveID", "ipAddress", location, status, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT ("ksaveID")
        DO UPDATE SET
          "deviceName" = EXCLUDED."deviceName",
          "ipAddress" = EXCLUDED."ipAddress",
          location = EXCLUDED.location,
          "updatedAt" = CURRENT_TIMESTAMP
      `, [deviceName, ksave, ipAddress || null, location || null, 'active'])
    } catch (deviceErr: any) {
      console.warn('Device upsert failed:', deviceErr.message)
    }
    // If an `id` is provided, update that specific record instead of INSERT/UPSERT
    let result
    if (body.id) {
      const id = body.id
      result = await query(`
        UPDATE influx_power_data SET
          device = $2,
          ksave_id = $3,
          location = $4,
          measurement_time = $5,
          before_l1 = $6, before_l2 = $7, before_l3 = $8, before_kwh = $9, before_p = $10, before_q = $11, before_s = $12, before_pf = $13, before_thd = $14, before_f = $15,
          metrics_l1 = $16, metrics_l2 = $17, metrics_l3 = $18, metrics_kwh = $19, metrics_p = $20, metrics_q = $21, metrics_s = $22, metrics_pf = $23, metrics_thd = $24, metrics_f = $25,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, device, ksave_id, location, measurement_time
      `, [
        id,
        deviceName,
        ksave,
        location || null,
        measurementTime,
        // Power Before
        power_before?.L1_N || power_before?.L1 || null,
        power_before?.L2_N || power_before?.L2 || null,
        power_before?.L3_N || power_before?.L3 || null,
        power_before?.kWh || null,
        power_before?.P || null,
        power_before?.Q || null,
        power_before?.S || null,
        power_before?.PF || null,
        power_before?.THD || null,
        power_before?.F || null,
        // Power Metrics
        power_metrics?.L1_N || power_metrics?.L1 || null,
        power_metrics?.L2_N || power_metrics?.L2 || null,
        power_metrics?.L3_N || power_metrics?.L3 || null,
        power_metrics?.kWh || null,
        power_metrics?.P || null,
        power_metrics?.Q || null,
        power_metrics?.S || null,
        power_metrics?.PF || null,
        power_metrics?.THD || null,
        power_metrics?.F || null,
      ])
    } else {
      // Insert power data into influx_power_data table (INSERT ... ON CONFLICT)
      result = await query(`
        INSERT INTO influx_power_data (
          device, ksave_id, location, measurement_time,
          before_l1, before_l2, before_l3, before_kwh, before_p, before_q, before_s, before_pf, before_thd, before_f,
          metrics_l1, metrics_l2, metrics_l3, metrics_kwh, metrics_p, metrics_q, metrics_s, metrics_pf, metrics_thd, metrics_f,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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
          updated_at = CURRENT_TIMESTAMP
        RETURNING id, device, ksave_id, location, measurement_time
      `, [
        deviceName,
        ksave,
        location || null,
        measurementTime,
        // Power Before
        power_before?.L1_N || power_before?.L1 || null,
        power_before?.L2_N || power_before?.L2 || null,
        power_before?.L3_N || power_before?.L3 || null,
        power_before?.kWh || null,
        power_before?.P || null,
        power_before?.Q || null,
        power_before?.S || null,
        power_before?.PF || null,
        power_before?.THD || null,
        power_before?.F || null,
        // Power Metrics
        power_metrics?.L1_N || power_metrics?.L1 || null,
        power_metrics?.L2_N || power_metrics?.L2 || null,
        power_metrics?.L3_N || power_metrics?.L3 || null,
        power_metrics?.kWh || null,
        power_metrics?.P || null,
        power_metrics?.Q || null,
        power_metrics?.S || null,
        power_metrics?.PF || null,
        power_metrics?.THD || null,
        power_metrics?.F || null,
      ])
    }

    return NextResponse.json({
      ok: true,
      saved: result[0],
      message: 'Power values saved to PostgreSQL successfully'
    })

  } catch (err: any) {
    console.error('Failed to save power values:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}

/**
 * GET /api/power-values?device=xxx
 * Get latest power values for a device
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const device = url.searchParams.get('device')
    const q = url.searchParams.get('q')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let rows
    if (q) {
      // partial search by device or ksave_id
      const pattern = `%${q}%`
      rows = await query(`
        SELECT
          id, device, ksave_id, location, measurement_time,
          before_l1, before_l2, before_l3, before_kwh, before_p, before_q, before_s, before_pf, before_thd, before_f,
          metrics_l1, metrics_l2, metrics_l3, metrics_kwh, metrics_p, metrics_q, metrics_s, metrics_pf, metrics_thd, metrics_f,
          er, created_at, updated_at
        FROM influx_power_data
        WHERE device ILIKE $1 OR ksave_id ILIKE $1
        ORDER BY measurement_time DESC
        LIMIT $2
      `, [pattern, limit])
    } else {
      if (!device) {
        return NextResponse.json({
          ok: false,
          error: 'device or q parameter is required'
        }, { status: 400 })
      }
      rows = await query(`
        SELECT
          id, device, ksave_id, location, measurement_time,
          before_l1, before_l2, before_l3, before_kwh, before_p, before_q, before_s, before_pf, before_thd, before_f,
          metrics_l1, metrics_l2, metrics_l3, metrics_kwh, metrics_p, metrics_q, metrics_s, metrics_pf, metrics_thd, metrics_f,
          er, created_at, updated_at
        FROM influx_power_data
        WHERE device = $1 OR ksave_id = $1
        ORDER BY measurement_time DESC
        LIMIT $2
      `, [device, limit])
    }

    return NextResponse.json({
      ok: true,
      data: rows,
      count: rows.length
    })

  } catch (err: any) {
    console.error('Failed to fetch power values:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}

/**
 * DELETE /api/power-values?id=xxx
 * Delete a power value record by ID
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        ok: false,
        error: 'id parameter is required'
      }, { status: 400 })
    }

    // Delete from influx_power_data table
    const result = await query(`
      DELETE FROM influx_power_data
      WHERE id = $1
      RETURNING id, device, measurement_time
    `, [parseInt(id)])

    if (result.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'Record not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      deleted: result[0],
      message: 'Record deleted successfully'
    })

  } catch (err: any) {
    console.error('Failed to delete power value:', err)
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 })
  }
}
