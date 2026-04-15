import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

// GET - Fetch customer details with site information
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const q = searchParams.get('q')

    if (id) {
      const [rows]: any = await pool.query(`
        SELECT cd.*, s.site_code, s.site_name, s.site_type, s.province
        FROM cus_detail cd
        LEFT JOIN site s ON cd.siteID = s.siteID
        WHERE cd.cusID = ?
      `, [id])
      return NextResponse.json({ ok: true, data: rows[0] || null })
    }

    let sql = `
      SELECT cd.*, s.site_code, s.site_name, s.site_type, s.province
      FROM cus_detail cd
      LEFT JOIN site s ON cd.siteID = s.siteID
    `
    const params: any[] = []

    if (q) {
      sql += ' WHERE cd.fullname LIKE ? OR cd.company LIKE ? OR cd.email LIKE ? OR cd.phone LIKE ?'
      const like = `%${q}%`
      params.push(like, like, like, like)
    }

    sql += ' ORDER BY cd.created_at DESC'

    const [rows]: any = await pool.query(sql, params)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// POST - Create new customer detail
export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const [r]: any = await pool.query(
      `INSERT INTO cus_detail (siteID, fullname, email, phone, company, address, subject, message, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.siteID || null,
        b.fullname,
        b.email,
        b.phone,
        b.company || null,
        b.address,
        b.subject,
        b.message,
        b.created_by || 'system'
      ]
    )
    return NextResponse.json({ ok: true, cusID: r.insertId })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// PUT - Update customer detail
export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing cusID' }, { status: 400 })
    }

    await pool.query(
      `UPDATE cus_detail
       SET siteID=?, fullname=?, email=?, phone=?, company=?, address=?, subject=?, message=?
       WHERE cusID=?`,
      [
        b.siteID || null,
        b.fullname,
        b.email,
        b.phone,
        b.company || null,
        b.address,
        b.subject,
        b.message,
        id
      ]
    )
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// DELETE - Delete customer detail
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing cusID' }, { status: 400 })
    }

    await pool.query('DELETE FROM cus_detail WHERE cusID = ?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
