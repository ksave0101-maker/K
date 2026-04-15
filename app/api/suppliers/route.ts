import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

type SupplierRow = {
  supplier_id: number
  name: string | null
  company: string | null
  tax_id: string | null
  email: string | null
  phone: string | null
  address: string | null
  product_type: string | null
  notes: string | null
  created_by?: string | null
  is_active?: number
}

type CountResult = { insertId: number }

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const q = searchParams.get('q')?.trim()

    if (id) {
      const [rows] = await pool.query('SELECT * FROM suppliers WHERE supplier_id = ?', [id])
      const supplierRows = rows as SupplierRow[]
      return NextResponse.json({ success: true, supplier: supplierRows[0] || null })
    }

    if (q) {
      const like = `%${q}%`
      const [rows] = await pool.query(
        `SELECT * FROM suppliers
         WHERE is_active = 1
           AND (
             name LIKE ?
             OR company LIKE ?
             OR email LIKE ?
             OR phone LIKE ?
             OR tax_id LIKE ?
           )
         ORDER BY supplier_id DESC
         LIMIT 20`,
        [like, like, like, like, like]
      )
      return NextResponse.json({ success: true, rows })
    }

    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY supplier_id DESC')
    return NextResponse.json({ success: true, rows })
  } catch (error: unknown) {
    console.error('Suppliers API error:', error)
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, company, tax_id, email, phone, address, product_type, notes, created_by } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Supplier name is required' }, { status: 400 })
    }

    const [result] = await pool.query(
      `INSERT INTO suppliers (name, company, tax_id, email, phone, address, product_type, notes, created_by, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, company || null, tax_id || null, email || null, phone || null, address || null, product_type || null, notes || null, created_by || null]
    )

    return NextResponse.json({ success: true, id: (result as CountResult).insertId })
  } catch (error: unknown) {
    console.error('Suppliers POST error:', error)
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { supplier_id, name, company, tax_id, email, phone, address, product_type, notes, is_active } = body

    if (!supplier_id) {
      return NextResponse.json({ success: false, error: 'Supplier ID is required' }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ success: false, error: 'Supplier name is required' }, { status: 400 })
    }

    await pool.query(
      `UPDATE suppliers
       SET name = ?, company = ?, tax_id = ?, email = ?, phone = ?, address = ?, product_type = ?, notes = ?, is_active = ?
       WHERE supplier_id = ?`,
      [name, company || null, tax_id || null, email || null, phone || null, address || null, product_type || null, notes || null, is_active ?? 1, supplier_id]
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Suppliers PUT error:', error)
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Supplier ID is required' }, { status: 400 })
    }

    await pool.query('DELETE FROM suppliers WHERE supplier_id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Suppliers DELETE error:', error)
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}
