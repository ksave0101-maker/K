import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const q = searchParams.get('q')
    const status = searchParams.get('status')

    if (id) {
      const rows = await query('SELECT * FROM kr_customers WHERE id = ?', [id])
      return NextResponse.json(rows[0] || null)
    }
    if (q) {
      const rows = await query('SELECT * FROM kr_customers WHERE name LIKE ? OR nameEn LIKE ? OR company LIKE ? OR phone LIKE ? LIMIT 50', [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`])
      return NextResponse.json(rows)
    }

    let sql = 'SELECT * FROM kr_customers WHERE 1=1'
    const params: any[] = []
    if (status) { sql += ' AND status = ?'; params.push(status) }
    sql += ' ORDER BY name ASC LIMIT 200'

    const rows = await query(sql, params)
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, nameEn, email, phone, company, address, type, status, joinDate } = body
    const result = await query(
      `INSERT INTO kr_customers (name, nameEn, email, phone, company, address, type, status, joinDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, nameEn || null, email || null, phone || null, company || null, address || null, type || 'individual', status || 'active', joinDate || new Date().toISOString().split('T')[0]]
    )
    return NextResponse.json({ success: true, id: (result as any)[0]?.insertId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, nameEn, email, phone, company, address, type, status, rating } = body
    await query(
      `UPDATE kr_customers SET name=?, nameEn=?, email=?, phone=?, company=?, address=?, type=?, status=?, rating=? WHERE id=?`,
      [name, nameEn || null, email || null, phone || null, company || null, address || null, type || 'individual', status || 'active', rating || 0, id]
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await query('DELETE FROM kr_customers WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
