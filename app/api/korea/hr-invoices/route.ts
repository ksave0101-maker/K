import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const rows = await query('SELECT * FROM kr_hr_invoices WHERE id = ?', [id])
      if (!rows[0]) return NextResponse.json(null)
      const items = await query('SELECT * FROM kr_hr_invoice_items WHERE invoiceId = ?', [id])
      return NextResponse.json({ ...rows[0], items })
    }

    const rows = await query('SELECT * FROM kr_hr_invoices ORDER BY issueDate DESC LIMIT 200')
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, invoiceNumber, customer, issueDate, dueDate, subtotal, taxRate, taxAmount, totalAmount, paymentStatus, notes, salesContractNumber, items } = body

    await query(
      `INSERT INTO kr_hr_invoices (id, invoiceNumber, customer, issueDate, dueDate, subtotal, taxRate, taxAmount, totalAmount, paymentStatus, notes, salesContractNumber)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, invoiceNumber, customer, issueDate, dueDate, subtotal || 0, taxRate || 10, taxAmount || 0, totalAmount || 0, paymentStatus || 'unpaid', notes || null, salesContractNumber || null]
    )

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(
          'INSERT INTO kr_hr_invoice_items (invoiceId, name, quantity, unit, unitPrice) VALUES (?, ?, ?, ?, ?)',
          [id, item.name, item.quantity || 1, item.unit || 'pcs', item.unitPrice || 0]
        )
      }
    }

    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, paymentStatus } = body
    await query('UPDATE kr_hr_invoices SET paymentStatus = ? WHERE id = ?', [paymentStatus, id])
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
    await query('DELETE FROM kr_hr_invoice_items WHERE invoiceId = ?', [id])
    await query('DELETE FROM kr_hr_invoices WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
