import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

async function getColumnSet(connection: any, tableName: string) {
  try {
    const [rows]: any = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``)
    return new Set((rows || []).map((r: any) => String(r?.Field || '').trim()))
  } catch {
    return new Set<string>()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'unpaid'
    const branch = searchParams.get('branch')

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

      const paymentStatusExpr = invoiceCols.has('paymentStatus') ? 'i.paymentStatus' : null
      const branchCodeExpr = invoiceCols.has('branch_code') ? 'i.branch_code' : null
      const notesExpr = invoiceCols.has('notes') ? 'i.notes' : null
      const createdAtExpr = invoiceCols.has('created_at')
        ? 'i.created_at'
        : (invoiceCols.has('issueDate') ? 'i.issueDate' : 'i.id')

      let query = `
        SELECT
          ${iCol('id')},
          ${iCol('invoiceNumber')},
          ${iCol('customer')},
          ${iCol('customer_address')},
          ${iCol('customer_phone')},
          ${iCol('customer_email')},
          ${iCol('issueDate')},
          ${iCol('dueDate')},
          ${iCol('subtotal')},
          ${iCol('taxRate')},
          ${iCol('taxAmount')},
          ${iCol('vat_amount')},
          ${iCol('totalAmount')},
          ${iCol('paymentStatus')},
          ${iCol('notes')},
          ${iCol('salesContractNumber')},
          ${iCol('branch_code')},
          ${iCol('pdo_number')},
          ${iCol('pdo_branch')},
          ${iCol('shipment_no')},
          ${iCol('repdo_no')},
          ${iCol('qaqc_no')},
          ${iCol('supplier_name')},
          ${iCol('supplier_phone')},
          ${iCol('supplier_email')},
          ${iCol('created_at')},
          ${poCol('pdoNo', 'linked_pdo_number')},
          ${poCol('pdoDate', 'linked_pdo_date')},
          ${poCol('product_name', 'linked_pdo_product')},
          ${poCol('status', 'linked_pdo_status')}
        FROM kr_hr_invoices i
        LEFT JOIN production_orders po ON ${invoiceCols.has('pdo_number') ? 'i.pdo_number' : 'NULL'} = ${prodCols.has('pdoNo') ? 'po.pdoNo' : 'NULL'}
      `

      const params: string[] = []
      const where: string[] = []

      if (paymentStatusExpr) {
        if (status === 'unpaid') {
          where.push(`${paymentStatusExpr} IN ('unpaid', 'partial', 'overdue')`)
        } else if (status !== 'all') {
          where.push(`${paymentStatusExpr} = ?`)
          params.push(status)
        }
      }

      // Filter by branch_code first, fallback to notes for legacy records
      if (branch && (branchCodeExpr || notesExpr)) {
        const branchCodeMap: { [key: string]: string } = {
          thailand: 'TH', vietnam: 'VN', malaysia: 'MY', brunei: 'BN', korea: 'KR'
        }
        const branchCode = branchCodeMap[branch.toLowerCase()] || branch.slice(0, 2).toUpperCase()

        if (branchCodeExpr && notesExpr) {
          where.push(`(${branchCodeExpr} = ? OR (${branchCodeExpr} IS NULL AND ${notesExpr} LIKE ?))`)
          params.push(branchCode, `%Branch: ${branchCode}%`)
        } else if (branchCodeExpr) {
          where.push(`${branchCodeExpr} = ?`)
          params.push(branchCode)
        } else if (notesExpr) {
          where.push(`${notesExpr} LIKE ?`)
          params.push(`%Branch: ${branchCode}%`)
        }
      }

      if (where.length > 0) {
        query += ` WHERE ${where.join(' AND ')}`
      }

      query += ` ORDER BY ${createdAtExpr} DESC`

      const [rows]: any = await connection.query(query, params)

      return NextResponse.json({
        success: true,
        rows,
        count: rows.length
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
