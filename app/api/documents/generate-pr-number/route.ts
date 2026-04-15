import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

// API สำหรับสร้างเลขที่ PR (Purchase Request) ใหม่
// เช็คจากฐานข้อมูลจริงแล้วรันต่อ
export async function POST(request: NextRequest) {
  try {
    const prefix = 'PR'
    const table = 'purchase_requests'
    const field = 'prNo'

    // สร้างรูปแบบวันที่ YYYYMMDD
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const datePrefix = `${year}${month}${day}`

    // สร้าง pattern สำหรับค้นหา เช่น PR-20260324-%
    const searchPattern = `${prefix}-${datePrefix}-%`

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // ดึงเลขที่เอกสารล่าสุดของวันนี้
      const [rows]: any = await connection.query(
        `SELECT ${field} as docNo
         FROM ${table}
         WHERE ${field} LIKE ?
         ORDER BY ${field} DESC
         LIMIT 1`,
        [searchPattern]
      )

      let nextNumber = 1

      if (rows.length > 0 && rows[0].docNo) {
        // แยกเลขลำดับจากเลขที่เอกสาร เช่น PR-20260324-0005 -> 5
        const lastDocNo = rows[0].docNo
        const parts = lastDocNo.split('-')
        if (parts.length >= 3) {
          const lastSeq = parseInt(parts[parts.length - 1]) || 0
          nextNumber = lastSeq + 1
        }
      }

      // สร้างเลขที่เอกสารใหม่
      const sequenceStr = String(nextNumber).padStart(5, '0')
      const newDocNo = `${prefix}-${datePrefix}-${sequenceStr}`

      await connection.commit()

      return NextResponse.json({
        success: true,
        prNo: newDocNo,
        sequence: nextNumber,
        lastDocNo: rows.length > 0 ? rows[0].docNo : null
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error('Generate PR number error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate PR number'
      },
      { status: 500 }
    )
  }
}
