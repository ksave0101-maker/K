import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

// GET - Fetch all sites
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const active = searchParams.get('active')

    if (id) {
      const [rows]: any = await pool.query('SELECT * FROM site WHERE siteID = ?', [id])
      return NextResponse.json({ ok: true, data: rows[0] || null })
    }

    let sql = 'SELECT * FROM site'
    const params: any[] = []

    if (active === '1' || active === 'true') {
      sql += ' WHERE is_active = 1'
    }

    sql += ' ORDER BY site_code'

    const [rows]: any = await pool.query(sql, params)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// POST - Create new site
export async function POST(req: NextRequest) {
  try {
    const b = await req.json()

    // Auto-generate site_code if not provided
    let siteCode = b.site_code
    if (!siteCode) {
      const [countRows]: any = await pool.query("SELECT COUNT(*) as cnt FROM site")
      const num = (countRows[0].cnt || 0) + 1
      siteCode = `SITE-${String(num).padStart(4, '0')}`
    }

    const [r]: any = await pool.query(
      `INSERT INTO site (site_code, site_name, site_name_en, location, province, country, site_type,
                         manager_name, contact_phone, contact_email, address, is_active, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        siteCode,
        b.site_name,
        b.site_name_en || null,
        b.location || null,
        b.province || null,
        b.country || 'Thailand',
        b.site_type || 'Branch',
        b.manager_name || null,
        b.contact_phone || null,
        b.contact_email || null,
        b.address || null,
        b.is_active ?? 1,
        b.notes || null
      ]
    )
    return NextResponse.json({ ok: true, siteID: r.insertId, site_code: siteCode })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// PUT - Update site
export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing siteID' }, { status: 400 })
    }

    await pool.query(
      `UPDATE site
       SET site_name=?, site_name_en=?, location=?, province=?, country=?, site_type=?,
           manager_name=?, contact_phone=?, contact_email=?, address=?, is_active=?, notes=?
       WHERE siteID=?`,
      [
        b.site_name,
        b.site_name_en || null,
        b.location || null,
        b.province || null,
        b.country || 'Thailand',
        b.site_type || 'Branch',
        b.manager_name || null,
        b.contact_phone || null,
        b.contact_email || null,
        b.address || null,
        b.is_active ?? 1,
        b.notes || null,
        id
      ]
    )
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// DELETE - Delete site
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing siteID' }, { status: 400 })
    }

    // Check if site is used in cus_detail
    const [usage]: any = await pool.query(
      'SELECT COUNT(*) as cnt FROM cus_detail WHERE siteID = ?',
      [id]
    )

    if (usage[0].cnt > 0) {
      return NextResponse.json(
        { ok: false, error: 'Cannot delete site that is linked to customer records' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM site WHERE siteID = ?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
