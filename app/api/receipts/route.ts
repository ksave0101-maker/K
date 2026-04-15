import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import type { RowDataPacket } from 'mysql2/promise'

type ColumnRow = RowDataPacket & { Field: string }
type CountRow = RowDataPacket & { total?: number }
type ReceiptQueryRow = RowDataPacket & {
  receiptID: number
  receiptNo: string
  receiptDate: string | null
  invID: number | null
  cusID: number | null
  amount: number
  amount_out: string | null
  payment_method: string | null
  notes: string | null
  created_by: string | null
  created_at: string | null
  status?: string
  approved_by?: string | null
  approved_at?: string | null
  approved_signature?: string | null
  customer: string
}

async function getReceiptColumns() {
  const [rows] = await pool.query<RowDataPacket[]>('SHOW COLUMNS FROM receipts')
  const cols = (rows || []) as ColumnRow[]
  return new Set(cols.map((r) => String(r.Field)))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('receiptID')
    const invNo = searchParams.get('invNo')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const receiptColumns = await getReceiptColumns()

    const hasStatus = receiptColumns.has('status')
    const hasApprovedBy = receiptColumns.has('approved_by')
    const hasApprovedAt = receiptColumns.has('approved_at')
    const hasApprovedSignature = receiptColumns.has('approved_signature')

    const baseSelect = `
      SELECT
        r.receiptID,
        r.receiptNo,
        r.receiptDate,
        r.invID,
        r.cusID,
        r.amount,
        r.amount_out,
        r.payment_method,
        r.notes,
        r.created_by,
        r.created_at,
        ${hasStatus ? 'r.status' : `'pending' AS status`},
        ${hasApprovedBy ? 'r.approved_by' : 'NULL AS approved_by'},
        ${hasApprovedAt ? 'r.approved_at' : 'NULL AS approved_at'},
        ${hasApprovedSignature ? 'r.approved_signature' : 'NULL AS approved_signature'},
        COALESCE(c.fullname, '-') as customer
      FROM receipts r
      LEFT JOIN cus_detail c ON r.cusID = c.cusID
    `

    // Single receipt by ID
    if (id) {
      const [rows] = await pool.query<RowDataPacket[]>(baseSelect + ` WHERE r.receiptID = ?`, [id])
      const list = (rows || []) as ReceiptQueryRow[]
      const receipt = list[0] || null
      return NextResponse.json({
        success: true,
        receipt,
        receipts: list
      })
    }

    // Receipts by invoice number
    if (invNo) {
      const [rows] = await pool.query<RowDataPacket[]>(baseSelect + ` WHERE r.invID = ? OR r.receiptNo LIKE ?`, [invNo, `%${invNo}%`])
      const list = (rows || []) as ReceiptQueryRow[]
      return NextResponse.json({
        success: true,
        receipts: list,
        rows: list
      })
    }

    // List all receipts
    let query = baseSelect + ` WHERE 1=1`
    const params: unknown[] = []

    if (status) {
      if (hasStatus) {
        query += ` AND r.status = ?`
        params.push(status)
      } else if (status !== 'pending') {
        query += ` AND 1=0`
      }
    }

    query += ` ORDER BY r.receiptID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query<RowDataPacket[]>(query, params)
    const list = (rows || []) as ReceiptQueryRow[]

    let countSql = `SELECT COUNT(*) as total FROM receipts WHERE 1=1`
    const countParams: unknown[] = []
    if (status) {
      if (hasStatus) {
        countSql += ` AND status = ?`
        countParams.push(status)
      } else if (status !== 'pending') {
        countSql += ` AND 1=0`
      }
    }
    const [countResult] = await pool.query<RowDataPacket[]>(countSql, countParams)
    const countRows = (countResult || []) as CountRow[]
    const total = countRows[0]?.total || 0

    return NextResponse.json({
      success: true,
      rows: list,
      total,
      limit,
      offset
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Receipts API error:', error)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const receiptID = body?.receiptID || body?.id
    const status = body?.status
    const approvedBy = body?.approvedBy || body?.approved_by
    const approvedSignature = body?.approvedSignature || body?.approved_signature

    if (!receiptID) {
      return NextResponse.json({ success: false, error: 'receiptID required' }, { status: 400 })
    }

    const receiptColumns = await getReceiptColumns()
    const updates: string[] = []
    const params: unknown[] = []

    if (status && receiptColumns.has('status')) {
      updates.push('status = ?')
      params.push(status)
    }
    if (approvedBy && receiptColumns.has('approved_by')) {
      updates.push('approved_by = ?')
      params.push(approvedBy)
    }
    if (approvedSignature && receiptColumns.has('approved_signature')) {
      updates.push('approved_signature = ?')
      params.push(approvedSignature)
    }
    if ((status === 'approved' || approvedBy || approvedSignature) && receiptColumns.has('approved_at')) {
      updates.push('approved_at = NOW()')
    }

    if (receiptColumns.has('notes') && (status === 'approved' || approvedBy)) {
      const auditBy = approvedBy || 'unknown'
      const auditLog = `\n[APPROVED ${new Date().toISOString()} by ${auditBy}]`
      updates.push('notes = CONCAT(COALESCE(notes, \'\'), ?)')
      params.push(auditLog)
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No updatable approval fields in receipts table' }, { status: 400 })
    }

    params.push(receiptID)
    await pool.query(`UPDATE receipts SET ${updates.join(', ')} WHERE receiptID = ?`, params)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Receipts PATCH error:', error)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
