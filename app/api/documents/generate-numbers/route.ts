import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

// API สำหรับสร้างเลขที่เอกสารอัตโนมัติสำหรับรายการที่ยังไม่มีเลขที่
export async function POST(request: NextRequest) {
  try {
    const results: any = {
      success: true,
      generated: [],
      errors: []
    }

    // ตารางและคอลัมน์ที่ต้องสร้างเลขที่
    const documentTypes = [
      { table: 'purchase_requests', idCol: 'prID', noCol: 'prNo', prefix: 'PR' },
      { table: 'credit_notes', idCol: 'cnID', noCol: 'cnNo', prefix: 'CN' },
      { table: 'expense_bills', idCol: 'ebID', noCol: 'ebNo', prefix: 'EB' },
      { table: 'goods_receipts', idCol: 'grID', noCol: 'grNo', prefix: 'GR' },
      { table: 'payment_vouchers', idCol: 'pvID', noCol: 'pvNo', prefix: 'PV' },
      { table: 'supplier_invoices', idCol: 'siID', noCol: 'siNo', prefix: 'SI' },
      { table: 'stock_cards', idCol: 'scID', noCol: 'scNo', prefix: 'SC' },
      { table: 'stock_transfers', idCol: 'stID', noCol: 'stNo', prefix: 'ST' },
      { table: 'stock_adjustments', idCol: 'saID', noCol: 'saNo', prefix: 'SA' },
      { table: 'warranties', idCol: 'wtID', noCol: 'wtNo', prefix: 'WT' },
      { table: 'production_orders', idCol: 'pdoID', noCol: 'pdoNo', prefix: 'PDO' },
      { table: 'field_work_logs', idCol: 'fwlID', noCol: 'fwlNo', prefix: 'FWL' },
      { table: 'imports', idCol: 'impID', noCol: 'impNo', prefix: 'IMP' },
      { table: 'exports', idCol: 'expID', noCol: 'expNo', prefix: 'EXP' }
    ]

    for (const docType of documentTypes) {
      try {
        // ตรวจสอบว่าตารางมีอยู่หรือไม่
        const [tableExists]: any = await pool.query(
          `SELECT COUNT(*) as cnt FROM information_schema.tables
           WHERE table_schema = DATABASE() AND table_name = ?`,
          [docType.table]
        )

        if (tableExists[0].cnt === 0) {
          results.errors.push({
            table: docType.table,
            error: 'Table does not exist'
          })
          continue
        }

        // ค้นหารายการที่ยังไม่มีเลขที่เอกสาร (NULL หรือ empty string)
        const [rows]: any = await pool.query(
          `SELECT ${docType.idCol} as id FROM ${docType.table}
           WHERE ${docType.noCol} IS NULL OR ${docType.noCol} = ''`,
          []
        )

        if (rows.length > 0) {
          let generatedCount = 0

          for (const row of rows) {
            try {
              // สร้างเลขที่เอกสารใหม่
              const newDocNo = await generateDocumentNumber(
                docType.prefix,
                docType.table,
                docType.noCol
              )

              // อัปเดตเลขที่เอกสารในฐานข้อมูล
              await pool.query(
                `UPDATE ${docType.table} SET ${docType.noCol} = ? WHERE ${docType.idCol} = ?`,
                [newDocNo, row.id]
              )

              generatedCount++
            } catch (err: any) {
              results.errors.push({
                table: docType.table,
                id: row.id,
                error: err.message
              })
            }
          }

          if (generatedCount > 0) {
            results.generated.push({
              table: docType.table,
              prefix: docType.prefix,
              count: generatedCount
            })
          }
        }
      } catch (err: any) {
        results.errors.push({
          table: docType.table,
          error: err.message
        })
      }
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Generate document numbers error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
