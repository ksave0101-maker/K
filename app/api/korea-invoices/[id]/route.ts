import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import type { RowDataPacket } from 'mysql2/promise'

async function getColumnSet(connection: any, tableName: string) {
  try {
    const [rows] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``)
    return new Set(((rows as RowDataPacket[]) || []).map((r: any) => String(r?.Field || '').trim()))
  } catch {
    return new Set<string>()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await pool.getConnection()

    try {
      const invoiceCols = await getColumnSet(connection, 'kr_hr_invoices')
      const prodCols = await getColumnSet(connection, 'production_orders')

      const iCol = (field: string, alias?: string) => {
        const output = alias || field
        return invoiceCols.has(field) ? `i.${field} AS ${output}` : `NULL AS ${output}`
      }

      const poCol = (field: string, alias?: string) => {
        const output = alias || field
        return prodCols.has(field) ? `po.${field} AS ${output}` : `NULL AS ${output}`
      }

      const [rowsRaw] = await connection.query(
        `
        SELECT
          ${iCol('id')},
          ${iCol('invoiceNumber')},
          ${iCol('customer')},
          ${iCol('customer_address')},
          ${iCol('issueDate')},
          ${iCol('dueDate')},
          ${iCol('subtotal')},
          ${iCol('taxRate')},
          ${iCol('taxAmount')},
          ${iCol('totalAmount')},
          ${iCol('paymentStatus')},
          ${iCol('notes')},
          ${iCol('salesContractNumber')},
          ${iCol('pdo_number')},
          ${iCol('pdo_branch')},
          ${iCol('created_at')},
          ${poCol('pdoNo', 'linked_pdo_number')},
          ${poCol('pdoDate', 'linked_pdo_date')},
          ${poCol('product_name', 'linked_pdo_product')},
          ${poCol('status', 'linked_pdo_status')}
        FROM kr_hr_invoices i
        LEFT JOIN production_orders po ON ${invoiceCols.has('pdo_number') ? 'i.pdo_number' : 'NULL'} = ${prodCols.has('pdoNo') ? 'po.pdoNo' : 'NULL'}
        WHERE i.id = ?
        `,
        [params.id]
      )
      const rows = (rowsRaw as RowDataPacket[]) || []

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invoice not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        invoice: rows[0]
      })
    } finally {
      connection.release()
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
