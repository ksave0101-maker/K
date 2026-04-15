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
          `SELECT cd.cusID, cd.fullname, cd.email, cd.phone, cd.company,
                  cd.house_number, cd.moo, cd.tambon, cd.amphoe, cd.province, cd.postcode,
                  cd.tax_id, cd.message, cd.created_by, cd.created_by_user_id, cd.created_at,
                  ul.name as created_by_name, ul.userName as created_by_username
           FROM cus_detail cd
           LEFT JOIN user_list ul ON cd.created_by_user_id = ul.userId
           WHERE cd.cusID = ?`,
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
          `SELECT cd.cusID, cd.fullname, cd.email, cd.phone, cd.company,
                  cd.house_number, cd.moo, cd.tambon, cd.amphoe, cd.province, cd.postcode,
                  cd.tax_id, cd.message, cd.created_by, cd.created_by_user_id, cd.created_at,
                  ul.name as created_by_name, ul.userName as created_by_username
           FROM cus_detail cd
           LEFT JOIN user_list ul ON cd.created_by_user_id = ul.userId
           ORDER BY cd.fullname ASC
           LIMIT 100`
        )
        return NextResponse.json({ success: true, customers: rows })
      }

      const searchTerm = `%${q}%`
      const [rows]: any = await conn.query(
        `SELECT cd.cusID, cd.fullname, cd.email, cd.phone, cd.company,
                cd.house_number, cd.moo, cd.tambon, cd.amphoe, cd.province, cd.postcode,
                cd.tax_id, cd.message, cd.created_by, cd.created_by_user_id, cd.created_at,
                ul.name as created_by_name, ul.userName as created_by_username
         FROM cus_detail cd
         LEFT JOIN user_list ul ON cd.created_by_user_id = ul.userId
         WHERE cd.fullname LIKE ? OR cd.email LIKE ? OR cd.phone LIKE ? OR cd.company LIKE ?
         ORDER BY cd.fullname ASC
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
      const { name, email, phone, company, house_number, moo, tambon, amphoe, province, postcode, tax_id, message, currentUserId, currentUserName, currentUserUsername } = body

      if (!name) {
        return NextResponse.json({ success: false, error: 'name_required' }, { status: 400 })
      }

    const conn = await pool.getConnection()
    try {
        // Use actual user info if available, fallback to 'thailand admin'
        const createdBy = currentUserName || currentUserUsername || 'thailand admin'
        const createdByUserId = currentUserId ? parseInt(currentUserId) : null
        const siteID = 2 // Thailand - ประเทศไทย

      try {
        const [result]: any = await conn.query(
          `INSERT INTO cus_detail (siteID, fullname, email, phone, company, house_number, moo, tambon, amphoe, province, postcode, tax_id, message, created_by, created_by_user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [siteID, name, email || null, phone || null, company || null,
           house_number || null, moo || null, tambon || null, amphoe || null, province || null, postcode || null,
           tax_id || null, message || null, createdBy, createdByUserId]
        )

        const customerId = result.insertId
        // Fetch the inserted row to return full columns including created_at
        const [rows]: any = await conn.query(
          `SELECT cusID, fullname, email, phone, company, house_number, moo, tambon, amphoe, province, postcode, tax_id, message, created_by, created_at FROM cus_detail WHERE cusID = ?`,
          [customerId]
        )
        const customerRow = rows && rows[0] ? rows[0] : null

        return NextResponse.json({ success: true, customerId, customer: customerRow })
      } catch (sqlErr: any) {
        // Detect missing column error (MySQL errno 1054)
        console.error('customers INSERT error:', sqlErr)
        if (sqlErr && (sqlErr.errno === 1054 || sqlErr.code === 'ER_BAD_FIELD_ERROR')) {
          return NextResponse.json({ success: false, error: 'missing_column', message: 'Database is missing a required column.' }, { status: 500 })
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
