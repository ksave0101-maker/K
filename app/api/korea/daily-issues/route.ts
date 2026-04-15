import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET() {
  try {
    const rows: any[] = await query('SELECT * FROM kr_daily_issues ORDER BY created_at DESC') as any[]
    return NextResponse.json(rows.map(r => ({
      ...r,
      affectedOrders: r.affectedOrders ? JSON.parse(r.affectedOrders) : [],
    })))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, issueNumber, title, description, severity, status, category, reportedBy, reportedDate, assignedTo, department, productionLine, affectedOrders, resolution, resolvedDate } = body
    await query(
      `INSERT INTO kr_daily_issues (id,issueNumber,title,description,severity,status,category,reportedBy,reportedDate,assignedTo,department,productionLine,affectedOrders,resolution,resolvedDate)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, issueNumber, title, description ?? '', severity ?? 'medium', status ?? 'open', category ?? 'production', reportedBy, reportedDate, assignedTo ?? null, department, productionLine ?? null, JSON.stringify(affectedOrders ?? []), resolution ?? null, resolvedDate ?? null]
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status, resolution, resolvedDate, assignedTo } = body
    await query(
      `UPDATE kr_daily_issues SET status=?, resolution=?, resolvedDate=?, assignedTo=? WHERE id=?`,
      [status, resolution ?? null, resolvedDate ?? null, assignedTo ?? null, id]
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
    await query('DELETE FROM kr_daily_issues WHERE id=?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
