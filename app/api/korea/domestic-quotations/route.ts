import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const region = searchParams.get('region')

    if (id) {
      const rows = await query('SELECT * FROM kr_domestic_quotations WHERE id = ?', [id])
      return NextResponse.json(rows[0] || null)
    }

    let sql = 'SELECT * FROM kr_domestic_quotations WHERE 1=1'
    const params: any[] = []
    if (status) { sql += ' AND status = ?'; params.push(status) }
    if (region) { sql += ' AND customerRegion = ?'; params.push(region) }
    sql += ' ORDER BY createdDate DESC LIMIT 200'

    const rows = await query(sql, params)
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { quotationNumber, customerName, customerRegion, contactPerson, phone, email, product, quantity, unitPrice, totalAmount, validUntil, status, createdDate, notes } = body
    const result = await query(
      `INSERT INTO kr_domestic_quotations (quotationNumber, customerName, customerRegion, contactPerson, phone, email, product, quantity, unitPrice, totalAmount, validUntil, status, createdDate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [quotationNumber, customerName, customerRegion, contactPerson, phone || null, email || null, product, quantity || 0, unitPrice || 0, totalAmount || 0, validUntil || null, status || 'draft', createdDate || new Date().toISOString().split('T')[0], notes || null]
    )
    return NextResponse.json({ success: true, id: (result as any)[0]?.insertId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, quotationNumber, customerName, customerRegion, contactPerson, phone, email, product, quantity, unitPrice, totalAmount, validUntil, status, notes } = body
    await query(
      `UPDATE kr_domestic_quotations SET quotationNumber=?, customerName=?, customerRegion=?, contactPerson=?, phone=?, email=?, product=?, quantity=?, unitPrice=?, totalAmount=?, validUntil=?, status=?, notes=? WHERE id=?`,
      [quotationNumber, customerName, customerRegion, contactPerson, phone || null, email || null, product, quantity || 0, unitPrice || 0, totalAmount || 0, validUntil || null, status || 'draft', notes || null, id]
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
    await query('DELETE FROM kr_domestic_quotations WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
