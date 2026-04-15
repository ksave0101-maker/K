import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const branch = searchParams.get('branch')

    if (id) {
      const rows = await query('SELECT * FROM kr_quotations WHERE id = ?', [id])
      return NextResponse.json(rows[0] || null)
    }

    let sql = 'SELECT * FROM kr_quotations WHERE 1=1'
    const params: any[] = []
    if (status) { sql += ' AND status = ?'; params.push(status) }
    if (branch) { sql += ' AND branch = ?'; params.push(branch) }
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
    const { id, quotationNumber, customerName, customerCountry, branch, contactPerson, email, product, quantity, unitPrice, totalAmount, currency, validUntil, status, createdDate, notes } = body
    await query(
      `INSERT INTO kr_quotations (id, quotationNumber, customerName, customerCountry, branch, contactPerson, email, product, quantity, unitPrice, totalAmount, currency, validUntil, status, createdDate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, quotationNumber, customerName, customerCountry, branch, contactPerson, email || null, product, quantity || 0, unitPrice || 0, totalAmount || 0, currency || 'USD', validUntil || null, status || 'pending-signature', createdDate || new Date().toISOString().split('T')[0], notes || null]
    )
    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, quotationNumber, customerName, customerCountry, branch, contactPerson, email, product, quantity, unitPrice, totalAmount, currency, validUntil, status, notes } = body
    await query(
      `UPDATE kr_quotations SET quotationNumber=?, customerName=?, customerCountry=?, branch=?, contactPerson=?, email=?, product=?, quantity=?, unitPrice=?, totalAmount=?, currency=?, validUntil=?, status=?, notes=? WHERE id=?`,
      [quotationNumber, customerName, customerCountry, branch, contactPerson, email || null, product, quantity || 0, unitPrice || 0, totalAmount || 0, currency || 'USD', validUntil || null, status, notes || null, id]
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
    await query('DELETE FROM kr_quotations WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
