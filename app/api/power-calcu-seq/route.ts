import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Generate unique Power Calcu No in format: PWC YYYYMMDD00001
 * Sequential number resets daily
 */
async function generatePowerCalcuNo(): Promise<string> {
  // Get today's date in YYYYMMDD format
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')

  // Count how many power calculations were created today
  const [result] = await pool.query(`
    SELECT COUNT(*) as count FROM power_calculations
    WHERE DATE(created_at) = CURDATE()
  `)

  const count = (result as any)[0]?.count || 0

  // Format: PWC YYYYMMDD00001
  return `PWC ${today}${String(count + 1).padStart(5, '0')}`
}

/**
 * GET /api/power-calcu-seq
 * Generate next Power Calcu No for today
 */
export async function GET(req: NextRequest) {
  try {
    const powerCalcuNo = await generatePowerCalcuNo()

    return NextResponse.json({
      success: true,
      formatted: powerCalcuNo
    })
  } catch (error: any) {
    console.error('Generate power calcu no error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
