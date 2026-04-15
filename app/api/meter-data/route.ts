import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Use Node.js runtime for MySQL connection
export const dynamic = 'force-dynamic'

/**
 * GET /api/meter-data
 *
 * Query parameters:
 * - meterId: filter by specific meter ID
 * - limit: number of records to return (default: 100)
 * - hours: get data from last N hours (default: 24)
 * - latest: return only latest record per meter (true/false)
 */
export async function GET(req: Request) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'ksystem',
    password: 'Zera2026Admin',
    database: 'ksystem'
  })

  try {
    const url = new URL(req.url)
    const meterId = url.searchParams.get('meterId')
    const limit = Number(url.searchParams.get('limit') || 100)
    const hours = Number(url.searchParams.get('hours') || 24)
    const latest = url.searchParams.get('latest') === 'true'

    let sql = `
      SELECT 
        id,
        meter_id,
        voltage,
        current,
        power,
        timestamp
      FROM meter_data
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ${hours} HOUR)
    `

    const params: any[] = []

    if (meterId) {
      sql += ' AND meter_id = ?'
      params.push(meterId)
    }

    if (latest) {
      sql = `
        SELECT 
          id,
          meter_id,
          voltage,
          current,
          power,
          timestamp
        FROM (
          SELECT 
            id,
            meter_id,
            voltage,
            current,
            power,
            timestamp,
            ROW_NUMBER() OVER (PARTITION BY meter_id ORDER BY timestamp DESC) as rn
          FROM meter_data
          WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ${hours} HOUR)
      `
      if (meterId) {
        sql += ' AND meter_id = ?'
        params.push(meterId)
      }
      sql += `
        ) ranked
        WHERE rn = 1
      `
    } else {
      sql += ' ORDER BY timestamp DESC LIMIT ?'
      params.push(limit)
    }

    const [rows] = await connection.execute(sql, params)

    // Get summary statistics
    let statsSql = 'SELECT meter_id, COUNT(*) as record_count, AVG(voltage) as avg_voltage, AVG(current) as avg_current, AVG(power) as avg_power, MAX(timestamp) as last_update FROM meter_data WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)'
    const statsParams: any[] = [hours]

    if (meterId) {
      statsSql += ' AND meter_id = ?'
      statsParams.push(meterId)
    }

    statsSql += ' GROUP BY meter_id'

    const [stats] = await connection.execute(statsSql, statsParams)

    return NextResponse.json({
      success: true,
      data: rows,
      stats: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Meter data API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch meter data'
    }, { status: 500 })
  } finally {
    await connection.end()
  }
}
