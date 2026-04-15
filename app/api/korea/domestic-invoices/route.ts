import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (id) {
      const rows = await query('SELECT * FROM kr_domestic_invoices WHERE id = ?', [id])
      return NextResponse.json(rows[0] || null)
    }
    const rows = await query('SELECT * FROM kr_domestic_invoices ORDER BY issueDate DESC LIMIT 200')
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, contractId, customer, product, region, issueDate, paymentDueDate, quantity, unitPrice, totalAmount, paymentMethod, notes } = body
    await query(
      `INSERT INTO kr_domestic_invoices (id, contractId, customer, product, region, issueDate, paymentDueDate, quantity, unitPrice, totalAmount, paymentMethod, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, contractId || null, customer, product, region || null, issueDate, paymentDueDate || null, quantity || 0, unitPrice || 0, totalAmount || 0, paymentMethod || 'bank_transfer', notes || null]
    )
    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await query('DELETE FROM kr_domestic_invoices WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
