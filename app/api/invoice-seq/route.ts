import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date') // expects YYYY-MM-DD

    let yyyy: number, mm: string, dd: string
    if (dateParam) {
      const parts = dateParam.split('-')
      yyyy = parseInt(parts[0], 10)
      mm = (parts[1] || '').padStart(2, '0')
      dd = (parts[2] || '').padStart(2, '0')
    } else {
      const today = new Date()
      yyyy = today.getFullYear()
      mm = String(today.getMonth() + 1).padStart(2, '0')
      dd = String(today.getDate()).padStart(2, '0')
    }

    // YYMMDD format (e.g. 260518) matching existing invoice number style
    const yy = String(yyyy).slice(-2)
    const dateKey = `${yy}${mm}${dd}`
    const prefix = `INV${dateKey}-`

    const [rows]: any = await pool.query(
      `SELECT invNo FROM invoices WHERE invNo LIKE ? ORDER BY invNo DESC LIMIT 1`,
      [`${prefix}%`]
    )

    let seq = 1
    if (rows.length > 0) {
      const lastSeq = parseInt((rows[0].invNo as string).replace(prefix, ''), 10)
      if (!isNaN(lastSeq)) seq = lastSeq + 1
    }

    const invNo = `${prefix}${String(seq).padStart(4, '0')}`

    return NextResponse.json({
      success: true,
      invNo,
      seq,
      date: `${yyyy}-${mm}-${dd}`
    })
  } catch (error: any) {
    console.error('Invoice-seq API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
