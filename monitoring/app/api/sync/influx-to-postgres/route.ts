import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ksaveID, deviceName, time, power_before, power_metrics } = body

    if (!ksaveID || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: ksaveID, time' },
        { status: 400 }
      )
    }

    // Insert power reading into PostgreSQL
    const sql = `
      INSERT INTO power_readings (
        "ksaveID", "deviceName", measurement_time,
        before_l1, before_l2, before_l3, before_kwh, before_p, before_q, before_s, before_pf, before_thd, before_f,
        metrics_l1, metrics_l2, metrics_l3, metrics_kwh, metrics_p, metrics_q, metrics_s, metrics_pf, metrics_thd, metrics_f
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      )
      RETURNING id
    `

    const values = [
      ksaveID,
      deviceName || null,
      new Date(time),
      // Power Before
      power_before?.L1_N || null,
      power_before?.L2_N || null,
      power_before?.L3_N || null,
      power_before?.kWh || null,
      power_before?.P || null,
      power_before?.Q || null,
      power_before?.S || null,
      power_before?.PF || null,
      power_before?.THD || null,
      power_before?.F || null,
      // Power Metrics
      power_metrics?.L1_N || null,
      power_metrics?.L2_N || null,
      power_metrics?.L3_N || null,
      power_metrics?.kWh || null,
      power_metrics?.P || null,
      power_metrics?.Q || null,
      power_metrics?.S || null,
      power_metrics?.PF || null,
      power_metrics?.THD || null,
      power_metrics?.F || null,
    ]

    const result = await query(sql, values)

    return NextResponse.json({
      success: true,
      id: result[0]?.id,
      message: 'Power reading saved to PostgreSQL'
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync: ' + (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch recent readings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ksaveID = searchParams.get('ksaveID')
    const limit = parseInt(searchParams.get('limit') || '100')
    const hours = parseInt(searchParams.get('hours') || '24')

    let sql = `
      SELECT * FROM power_readings
      WHERE measurement_time > NOW() - INTERVAL '${hours} hours'
    `

    const params: any[] = []

    if (ksaveID) {
      sql += ` AND "ksaveID" = $1`
      params.push(ksaveID)
    }

    sql += ` ORDER BY measurement_time DESC LIMIT $${params.length + 1}`
    params.push(limit)

    const readings = await query(sql, params)

    return NextResponse.json({
      success: true,
      count: readings.length,
      readings
    })

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch: ' + (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    )
  }
}
