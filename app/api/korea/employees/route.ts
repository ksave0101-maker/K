import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const department = searchParams.get('department')
    const id = searchParams.get('id')

    if (id) {
      const rows = await query('SELECT * FROM kr_employees WHERE id = ?', [id])
      return NextResponse.json(rows[0] || null)
    }
    if (department && department !== 'all') {
      const rows = await query('SELECT * FROM kr_employees WHERE department = ? ORDER BY name ASC', [department])
      return NextResponse.json(rows)
    }
    const rows = await query('SELECT * FROM kr_employees ORDER BY department, name ASC')
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, position, email, phone, department, joinDate } = body
    await query(
      'INSERT INTO kr_employees (id, name, position, email, phone, department, joinDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, position, email || null, phone || null, department, joinDate || null]
    )
    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, position, email, phone, department, joinDate } = body
    await query(
      'UPDATE kr_employees SET name=?, position=?, email=?, phone=?, department=?, joinDate=? WHERE id=?',
      [name, position, email || null, phone || null, department, joinDate || null, id]
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
    await query('DELETE FROM kr_employees WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
