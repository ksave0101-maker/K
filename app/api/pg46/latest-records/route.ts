import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/pg46/latest-records?limit=10&device_id=1
 *
 * ดึงข้อมูลกระแสไฟล่าสุดจากตาราง power_records
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 10), 1), 200)
    const deviceIdParam = searchParams.get('device_id')

    let sql = `
      SELECT
        id,
        device_id,
        record_time,
        before_L1, before_L2, before_L3, before_kWh, before_P, before_Q, before_S, before_PF, before_THD, before_F,
        metrics_L1, metrics_L2, metrics_L3, metrics_kWh, metrics_P, metrics_Q, metrics_S, metrics_PF, metrics_THD, metrics_F,
        energy_reduction,
        co2_reduction,
        created_at,
        updated_at,
        created_by
      FROM power_records
      WHERE 1=1
    `

    const values: number[] = []

    if (deviceIdParam) {
      const deviceId = Number(deviceIdParam)
      if (!Number.isInteger(deviceId) || deviceId <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid device_id (must be a positive integer)' },
          { status: 400 }
        )
      }
      sql += ' AND device_id = ?'
      values.push(deviceId)
    }

    sql += ' ORDER BY record_time DESC, id DESC LIMIT ?'
    values.push(limit)

    const [rows] = await pool.query(sql, values)

    return NextResponse.json({
      success: true,
      count: Array.isArray(rows) ? rows.length : 0,
      records: rows
    })
  } catch (error: unknown) {
    console.error('❌ PG46 latest-records error:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch latest records'
    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status: 500 }
    )
  }
}
