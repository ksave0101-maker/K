import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-pool'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fromDate, toDate, onlyWithDate } = body

    let sql = `
      SELECT
        DATE_FORMAT(po.doc_date, '%d/%m/%Y') as date,
        po.doc_no as docNo,
        DATE_FORMAT(po.tax_invoice_date, '%d/%m/%Y') as taxDate,
        s.tax_id as taxId,
        CASE WHEN po.payment_type = 'credit' THEN 'เชื่อ' ELSE 'สด' END as credit,
        COALESCE(s.branch_code, '') as branch,
        COALESCE(s.name_th, s.supplier_name, '') as description,
        (po.subtotal - COALESCE(po.discount, 0)) as amount,
        (po.subtotal - COALESCE(po.discount, 0)) as taxBase,
        po.vat_amount as vatAmount,
        po.vat_amount as vat
      FROM acc_purchase_orders po
      LEFT JOIN acc_suppliers s ON po.supplier_id = s.id
      WHERE po.doc_date BETWEEN ? AND ?
        AND po.status IN ('confirmed', 'received', 'completed')
    `

    const params: any[] = [fromDate, toDate]

    // Add filter for records without tax invoice
    if (onlyWithDate) {
      sql += ` AND po.tax_invoice_date IS NULL`
    }

    sql += ` ORDER BY po.doc_date ASC, po.doc_no ASC`

    const rows = await query(sql, params)

    return NextResponse.json({
      success: true,
      records: rows,
      count: Array.isArray(rows) ? rows.length : 0
    })

  } catch (error: any) {
    console.error('VAT Purchase API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch VAT purchase data'
      },
      { status: 500 }
    )
  }
}
