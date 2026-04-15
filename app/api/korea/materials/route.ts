import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    if (id) {
      const rows = await query('SELECT * FROM kr_materials WHERE id = ?', [id])
      return NextResponse.json(rows[0] || null)
    }

    let sql = 'SELECT * FROM kr_materials WHERE 1=1'
    const params: any[] = []
    if (status) { sql += ' AND status = ?'; params.push(status) }
    if (category) { sql += ' AND category = ?'; params.push(category) }
    sql += ' ORDER BY urgency = "high" DESC, requiredDate ASC'

    const rows = await query(sql, params)
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, materialCode, materialName, category, quantity, unit, estimatedCost, supplier, urgency, requestedBy, requestDate, requiredDate, notes } = body
    await query(
      `INSERT INTO kr_materials (id, materialCode, materialName, category, quantity, unit, estimatedCost, supplier, urgency, requestedBy, requestDate, requiredDate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, materialCode, materialName, category, quantity || 0, unit || 'pcs', estimatedCost || 0, supplier, urgency || 'medium', requestedBy, requestDate || null, requiredDate || null, notes || null]
    )
    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, materialCode, materialName, category, quantity, unit, estimatedCost, supplier, urgency, requestedBy, requestDate, requiredDate, status, notes } = body
    await query(
      `UPDATE kr_materials SET materialCode=?, materialName=?, category=?, quantity=?, unit=?, estimatedCost=?, supplier=?, urgency=?, requestedBy=?, requestDate=?, requiredDate=?, status=?, notes=? WHERE id=?`,
      [materialCode, materialName, category, quantity || 0, unit || 'pcs', estimatedCost || 0, supplier, urgency || 'medium', requestedBy, requestDate || null, requiredDate || null, status || 'pending', notes || null, id]
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status } = body
    await query('UPDATE kr_materials SET status = ? WHERE id = ?', [status, id])
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
    await query('DELETE FROM kr_materials WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
