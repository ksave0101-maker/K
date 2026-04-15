import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'

// GET - ค้นหาลูกค้า
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const id = searchParams.get('id')

    const conn = await pool.getConnection()
    try {
      // ถ้ามี id ให้ดึงข้อมูลลูกค้าตาม id
      if (id) {
        const [rows]: any = await conn.query(
          `SELECT cusID, fullname, email, phone, company, address, subject, message, created_by, created_at
           FROM cus_detail WHERE cusID = ?`,
          [id]
        )
        if (rows.length === 0) {
          return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 })
        }
        return NextResponse.json({ success: true, customer: rows[0] })
      }

      // ค้นหาลูกค้าตามชื่อ, email หรือ phone
      // If no search query provided, return a default list (recent 100 customers)
      if (q.length < 1) {
        const [rows]: any = await conn.query(
          `SELECT cusID, fullname, email, phone, company, address, subject, message, created_by, created_at
           FROM cus_detail
           ORDER BY fullname ASC
           LIMIT 100`
        )
        return NextResponse.json({ success: true, customers: rows })
      }

      const searchTerm = `%${q}%`
      const [rows]: any = await conn.query(
        `SELECT cusID, fullname, email, phone, company, address, subject, message, created_by, created_at
         FROM cus_detail
         WHERE fullname LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?
         ORDER BY fullname ASC
         LIMIT 20`,
        [searchTerm, searchTerm, searchTerm, searchTerm]
      )

      return NextResponse.json({ success: true, customers: rows })
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error('customers GET error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

// POST - เพิ่มลูกค้าใหม่
export async function POST(req: NextRequest) {
  try {
      const body = await req.json()
      const { name, email, phone, company, address, subject, message } = body

      if (!name) {
        return NextResponse.json({ success: false, error: 'name_required' }, { status: 400 })
      }

    const conn = await pool.getConnection()
    try {
        const createdBy = 'thailand admin'
      try {
        const [result]: any = await conn.query(
          `INSERT INTO cus_detail (fullname, email, phone, company, address, subject, message, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [name, email || null, phone || null, company || null, address || null, subject || null, message || null, createdBy]
        )

        const customerId = result.insertId
        // Fetch the inserted row to return full columns including created_at
        const [rows]: any = await conn.query(
          `SELECT cusID, fullname, email, phone, company, address, subject, message, created_by, created_at FROM cus_detail WHERE cusID = ?`,
          [customerId]
        )
        const customerRow = rows && rows[0] ? rows[0] : null

        return NextResponse.json({ success: true, customerId, customer: customerRow })
      } catch (sqlErr: any) {
        // Detect missing column error (MySQL errno 1054)
        console.error('customers INSERT error:', sqlErr)
        if (sqlErr && (sqlErr.errno === 1054 || sqlErr.code === 'ER_BAD_FIELD_ERROR')) {
          return NextResponse.json({ success: false, error: 'missing_column', message: 'Database is missing a required column; please run migration to add `address` and/or `created_by`.' }, { status: 500 })
        }
        return NextResponse.json({ success: false, error: String(sqlErr) }, { status: 500 })
      }
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error('customers POST error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
