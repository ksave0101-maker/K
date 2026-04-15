import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('scID')
    const scNo = searchParams.get('scNo')
    const product_id = searchParams.get('product_id')
    const product_code = searchParams.get('product_code')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `SELECT * FROM stock_cards`

    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE scID = ?`, [id])
      return NextResponse.json({ success: true, stockCard: rows[0] || null, rows })
    }

    if (scNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE scNo = ?`, [scNo])
      return NextResponse.json({ success: true, stockCard: rows[0] || null, rows })
    }

    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    if (product_id) {
      query += ` AND product_id = ?`
      params.push(product_id)
    }

    if (product_code) {
      query += ` AND product_code = ?`
      params.push(product_code)
    }

    query += ` ORDER BY scID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)
    const [countResult]: any = await pool.query(`SELECT COUNT(*) as total FROM stock_cards`)

    return NextResponse.json({ success: true, rows, total: countResult[0]?.total || 0 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scDate, product_id, product_code, product_name, transaction_type, reference_no, quantity_in, quantity_out, balance, unit, unit_cost, location, notes, created_by } = body

    const scNo = await generateDocumentNumber('SC', 'stock_cards', 'scNo')

    const [result]: any = await pool.query(
      `INSERT INTO stock_cards (scNo, scDate, product_id, product_code, product_name, transaction_type, reference_no, quantity_in, quantity_out, balance, unit, unit_cost, location, notes, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [scNo, scDate, product_id, product_code, product_name, transaction_type, reference_no, quantity_in || 0, quantity_out || 0, balance || 0, unit || 'pcs', unit_cost || 0, location, notes, created_by]
    )

    return NextResponse.json({ success: true, scID: result.insertId, scNo })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('scID')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    await pool.query('DELETE FROM stock_cards WHERE scID = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
