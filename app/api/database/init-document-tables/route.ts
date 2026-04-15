import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: NextRequest) {
  try {
    const schemasDir = path.join(process.cwd(), 'database_schemas')

    const schemaFiles = [
      'create_document_counters.sql',
      'create_credit_notes.sql',
      'create_goods_receipts.sql',
      'create_payment_vouchers.sql',
      'create_warranties.sql',
      'create_purchase_requests.sql',
      'create_supplier_invoices.sql',
      'create_stock_cards.sql',
      'create_stock_transfers.sql',
      'create_stock_adjustments.sql',
      'create_expense_bills.sql',
      'create_production_orders.sql',
      'create_vacation_leave_requests.sql'
    ]

    const results = []

    for (const file of schemaFiles) {
      const filePath = path.join(schemasDir, file)

      if (!fs.existsSync(filePath)) {
        results.push({ file, status: 'skipped', reason: 'File not found' })
        continue
      }

      const sql = fs.readFileSync(filePath, 'utf8')

      // Split by semicolon and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        if (statement) {
          await pool.query(statement)
        }
      }

      results.push({ file, status: 'success' })
    }

    return NextResponse.json({
      success: true,
      message: 'Document tables initialized successfully',
      results
    })
  } catch (error: any) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
