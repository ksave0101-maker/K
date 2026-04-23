import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'

// Map customers_detailed row to a unified shape the frontend expects
function mapRow(r: any) {
  return {
    cusID: r.customerID,
    fullname: r.customerCompanyName || '',
    company: r.contactPersonName || '',
    phone: r.phone || '',
    email: r.email || '',
    address: r.locationProvince || '',
    industryType: r.industryType || '',
    salesOwner: r.salesOwner || '',
    currentStage: r.currentStage || '',
    created_at: r.created_at,
  }
}

const SELECT = `
  SELECT MIN(customerID) AS customerID, customerCompanyName, contactPersonName, contactPosition,
         phone, email, locationProvince, industryType, salesOwner,
         currentStage, notes, MIN(created_at) AS created_at
  FROM customers_detailed
`

const GROUP_BY = `GROUP BY customerCompanyName`

// GET - ค้นหาลูกค้า
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const id = searchParams.get('id')

    const conn = await pool.getConnection()
    try {
      if (id) {
        const [rows]: any = await conn.query(`${SELECT} WHERE customerID = ? ${GROUP_BY}`, [id])
        if (rows.length === 0) {
          return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 })
        }
        return NextResponse.json({ success: true, customer: mapRow(rows[0]) })
      }

      if (q.length < 1) {
        const [rows]: any = await conn.query(
          `${SELECT} ${GROUP_BY} ORDER BY customerCompanyName ASC LIMIT 100`
        )
        return NextResponse.json({ success: true, customers: rows.map(mapRow) })
      }

      const s = `%${q}%`
      const [rows]: any = await conn.query(
        `${SELECT}
         WHERE customerCompanyName LIKE ? OR contactPersonName LIKE ?
            OR phone LIKE ? OR email LIKE ? OR locationProvince LIKE ?
         ${GROUP_BY}
         ORDER BY customerCompanyName ASC
         LIMIT 20`,
        [s, s, s, s, s]
      )
      return NextResponse.json({ success: true, customers: rows.map(mapRow) })
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
    const { name, email, phone, company, address, salesOwner, industryType, notes } = body

    if (!name && !company) {
      return NextResponse.json({ success: false, error: 'name_required' }, { status: 400 })
    }

    const conn = await pool.getConnection()
    try {
      const [result]: any = await conn.query(
        `INSERT INTO customers_detailed
          (customerCompanyName, contactPersonName, phone, email, locationProvince, industryType, salesOwner, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [company || name, name || company, phone || '', email || '',
         address || '', industryType || '', salesOwner || '', notes || '']
      )
      const customerId = result.insertId
      const [rows]: any = await conn.query(`${SELECT} WHERE customerID = ?`, [customerId])
      return NextResponse.json({ success: true, customerId, customer: rows[0] ? mapRow(rows[0]) : null })
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error('customers POST error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
