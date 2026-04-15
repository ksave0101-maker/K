import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

type CountRow = { cnt: number }
type ColumnNameRow = { COLUMN_NAME: string }
type DocNoRow = { docNo: string | null }

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to generate document number'
}

// API สำหรับสร้างเลขที่เอกสารทุกประเภท โดยเช็คจากฐานข้อมูลจริง
// รองรับ: PR, CN, EB, GR, PV, SI, SC, ST, SA, WT, PDO, FWL, IMP, EXP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Document type is required' },
        { status: 400 }
      )
    }

    // Mapping ระหว่าง type กับ prefix, table name, และ field name
    const documentTypes: Record<string, { prefix: string; table: string; field: string }> = {
      // Sales
      'so': { prefix: 'SO', table: 'sales_orders', field: 'orderNo' },

      // Purchase & Procurement
      'pr': { prefix: 'PR', table: 'purchase_requests', field: 'prNo' },
      'si': { prefix: 'SI', table: 'supplier_invoices', field: 'siNo' },
      'gr': { prefix: 'GR', table: 'goods_receipts', field: 'grNo' },

      // Inventory & Warehouse
      'sc': { prefix: 'SC', table: 'stock_cards', field: 'scNo' },
      'st': { prefix: 'ST', table: 'stock_transfers', field: 'stNo' },
      'sa': { prefix: 'SA', table: 'stock_adjustments', field: 'saNo' },
      'imp': { prefix: 'IMP', table: 'imports', field: 'impNo' },
      'exp': { prefix: 'EXP', table: 'exports', field: 'expNo' },

      // Finance & Payments
      'pv': { prefix: 'PV', table: 'payment_vouchers', field: 'pvNo' },
      'cn': { prefix: 'CN', table: 'credit_notes', field: 'cnNo' },
      'eb': { prefix: 'EB', table: 'expense_bills', field: 'ebNo' },

      // Production & Logistics
      'pdo': { prefix: 'PDO', table: 'production_orders', field: 'pdoNo' },
      'sh': { prefix: 'SH', table: 'kr_shipment_updates', field: 'shipmentNumber' },

      // After Sales
      'wt': { prefix: 'WT', table: 'warranties', field: 'wtNo' },
      'fwl': { prefix: 'FWL', table: 'field_work_logs', field: 'fwlNo' }
    }

    const normalizedType = String(type).toLowerCase()
    const docType = documentTypes[normalizedType]

    if (!docType) {
      return NextResponse.json(
        { success: false, error: `Unknown document type: ${type}` },
        { status: 400 }
      )
    }

    // PDO/SH ใช้ตัวนับกลางแบบ atomic เพื่อให้เลขไม่ซ้ำแม้มีผู้ใช้พร้อมกันหลายคน
    // และลดโอกาสชนเลขจากการใช้งานพร้อมกันหลายคน
    if (normalizedType === 'pdo' || normalizedType === 'sh') {
      const prefix = normalizedType === 'pdo' ? 'PDO' : 'SH'
      const table = normalizedType === 'pdo' ? 'production_orders' : 'kr_shipment_updates'
      const field = normalizedType === 'pdo' ? 'pdoNo' : 'shipmentNumber'
      const docNo = await generateDocumentNumber(prefix, table, field)
      return NextResponse.json({
        success: true,
        docNo,
        prefix,
        type: prefix,
        field
      })
    }

    // สร้างรูปแบบวันที่ YYYYMMDD
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const datePrefix = `${year}${month}${day}`

    // สร้าง pattern สำหรับค้นหา
    const searchPattern = normalizedType === 'pdo'
      ? `PDOTH${datePrefix}-%`
      : `${docType.prefix}-${datePrefix}-%`

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // ตรวจสอบว่าตารางมีอยู่หรือไม่
      const [tableCheck] = await connection.query(
        `SELECT COUNT(*) as cnt FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name = ?`,
        [docType.table]
      )
      const tableCheckRows = tableCheck as CountRow[]

      if (tableCheckRows[0]?.cnt === 0) {
        throw new Error(`Table ${docType.table} does not exist`)
      }

      // ดึงเลขที่เอกสารล่าสุดของวันนี้
      let fieldName = docType.field
      if (normalizedType === 'pdo') {
        const [columnRows] = await connection.query(
          `SELECT COLUMN_NAME
           FROM information_schema.columns
           WHERE table_schema = DATABASE() AND table_name = ?
             AND COLUMN_NAME IN ('pdoNo', 'poNo')`,
          [docType.table]
        )
        const columns = new Set((columnRows as ColumnNameRow[]).map((row) => row.COLUMN_NAME))
        fieldName = columns.has('pdoNo') ? 'pdoNo' : columns.has('poNo') ? 'poNo' : docType.field
      }

      const [rows] = await connection.query(
        normalizedType === 'pdo'
          ? `SELECT ${fieldName} as docNo
             FROM ${docType.table}
             WHERE ${fieldName} LIKE ? OR ${fieldName} LIKE ?
             ORDER BY ${fieldName} DESC
             LIMIT 1`
          : `SELECT ${fieldName} as docNo
             FROM ${docType.table}
             WHERE ${fieldName} LIKE ?
             ORDER BY ${fieldName} DESC
             LIMIT 1`,
        normalizedType === 'pdo'
          ? [searchPattern, `${docType.prefix}-${datePrefix}-%`]
          : [searchPattern]
      )
      const docRows = rows as DocNoRow[]

      let nextNumber = 1

      if (docRows.length > 0 && docRows[0].docNo) {
        // แยกเลขลำดับจากเลขที่เอกสาร เช่น PR-20260324-0005 -> 5
        const lastDocNo = docRows[0].docNo
        const parts = lastDocNo.split('-')
        if (parts.length >= 3) {
          const lastSeq = parseInt(parts[parts.length - 1]) || 0
          nextNumber = lastSeq + 1
        }
      }

      // สร้างเลขที่เอกสารใหม่
      const sequenceStr = String(nextNumber).padStart(5, '0')
      let newDocNo: string

      if (normalizedType === 'pdo') {
        // Production Order: PDOTHYYYYMMDD-#####
        newDocNo = `PDOTH${datePrefix}-${sequenceStr}`
      } else if (docType.prefix === 'WT') {
        // Warranty: WT-TH-YYYYMMDD-#####
        newDocNo = `${docType.prefix}-TH-${datePrefix}-${sequenceStr}`
      } else {
        // เอกสารอื่นๆ: XX-YYYYMMDD-#####
        newDocNo = `${docType.prefix}-${datePrefix}-${sequenceStr}`
      }

      await connection.commit()

      return NextResponse.json({
        success: true,
        docNo: newDocNo,
        prefix: docType.prefix,
        type: type.toUpperCase(),
        field: fieldName,
        sequence: nextNumber,
        lastDocNo: docRows.length > 0 ? docRows[0].docNo : null
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: unknown) {
    console.error('Generate document number error:', error)
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error)
      },
      { status: 500 }
    )
  }
}
