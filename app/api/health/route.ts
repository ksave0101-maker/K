import { NextRequest, NextResponse } from 'next/server'
import { getPoolStats, query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    // Get connection pool statistics
    const poolStats = getPoolStats()

    // Test database connectivity
    const startTime = Date.now()
    let dbConnected = false
    let dbError = null

    try {
      await query('SELECT 1 as test')
      dbConnected = true
    } catch (error) {
      dbError = error instanceof Error ? error.message : String(error)
    }

    const responseTime = Date.now() - startTime

    const health = {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        responseTime: `${responseTime}ms`,
        error: dbError
      },
      connectionPool: poolStats,
      uptime: process.uptime()
    }

    return NextResponse.json(health, {
      status: dbConnected ? 200 : 503
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, {
      status: 500
    })
  }
}
