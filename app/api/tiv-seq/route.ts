import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(_request: NextRequest) {
  try {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const prefix = `TIV-${yyyy}${mm}${dd}-`

    // Find the latest sequence number for today
    const [rows]: any = await pool.query(
      `SELECT taxNo FROM tax_invoices WHERE taxNo LIKE ? ORDER BY taxNo DESC LIMIT 1`,
      [`${prefix}%`]
    )

    let seq = 1
    if (rows.length > 0) {
      const lastNo = rows[0].taxNo as string
      const lastSeq = parseInt(lastNo.replace(prefix, ''), 10)
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1
      }
    }

    const formatted = `${prefix}${String(seq).padStart(4, '0')}`
    const compact = `${yyyy}${mm}${dd}${String(seq).padStart(4, '0')}`

    return NextResponse.json({
      success: true,
      formatted,
      compact,
      seq,
      date: `${yyyy}-${mm}-${dd}`
    })
  } catch (error: any) {
    console.error('TIV-seq API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
