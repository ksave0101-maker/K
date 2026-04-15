import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

type ReportRow = {
  report_id?: number
  report_no?: string
  branch_key?: string
  branch_name?: string
  pdo_id?: string
  pdo_no?: string
  product_name?: string
  quantity?: number
  created_by?: string
  created_at?: string
  updated_at?: string
}

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS kr_production_reports (
      report_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      report_no VARCHAR(32) NOT NULL,
      branch_key VARCHAR(32) NOT NULL,
      branch_name VARCHAR(64) NOT NULL,
      pdo_id VARCHAR(64) NOT NULL,
      pdo_no VARCHAR(64) NOT NULL,
      product_name VARCHAR(255) NULL,
      quantity DECIMAL(18,2) NOT NULL DEFAULT 0,
      created_by VARCHAR(120) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (report_id),
      UNIQUE KEY uq_report_no (report_no),
      UNIQUE KEY uq_branch_pdo (branch_key, pdo_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
}

function todayPrefix() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `REPDO-${yyyy}${mm}${dd}-`
}

async function generateReportNo() {
  const prefix = todayPrefix()
  const rows = await query(
    `SELECT report_no
       FROM kr_production_reports
      WHERE report_no LIKE ?
      ORDER BY report_no DESC
      LIMIT 1`,
    [`${prefix}%`]
  ) as ReportRow[]

  const lastNo = String(rows?.[0]?.report_no || '')
  const lastSeq = lastNo.startsWith(prefix) ? Number(lastNo.slice(prefix.length)) || 0 : 0
  const nextSeq = String(lastSeq + 1).padStart(5, '0')
  return `${prefix}${nextSeq}`
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable()
    const { searchParams } = new URL(req.url)
    const branchKey = searchParams.get('branchKey')
    const pdoID = searchParams.get('pdoID')

    let sql = `SELECT * FROM kr_production_reports WHERE 1=1`
    const params: unknown[] = []
    if (branchKey) {
      sql += ` AND branch_key = ?`
      params.push(branchKey)
    }
    if (pdoID) {
      sql += ` AND pdo_id = ?`
      params.push(pdoID)
    }
    sql += ` ORDER BY created_at DESC`

    const rows = await query(sql, params)
    return NextResponse.json(rows)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const branchKey = String(body?.branchKey || '').trim().toLowerCase()
    const branchName = String(body?.branchName || '').trim()
    const pdoID = String(body?.pdoID || '').trim()
    const pdoNo = String(body?.pdoNo || '').trim()
    const productName = String(body?.productName || '').trim()
    const quantity = Number.parseFloat(String(body?.quantity || 0)) || 0
    const createdBy = String(body?.createdBy || '').trim()

    if (!branchKey || !pdoID || !pdoNo) {
      return NextResponse.json({ error: 'branchKey, pdoID, pdoNo are required' }, { status: 400 })
    }

    const existing = await query(
      `SELECT * FROM kr_production_reports WHERE branch_key = ? AND pdo_id = ? LIMIT 1`,
      [branchKey, pdoID]
    ) as ReportRow[]
    if (existing.length > 0) {
      return NextResponse.json({ success: true, existing: true, report: existing[0] })
    }

    for (let attempt = 0; attempt < 10; attempt++) {
      const reportNo = await generateReportNo()
      try {
        await query(
          `INSERT INTO kr_production_reports
            (report_no, branch_key, branch_name, pdo_id, pdo_no, product_name, quantity, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [reportNo, branchKey, branchName || branchKey, pdoID, pdoNo, productName || null, quantity, createdBy || null]
        )

        const inserted = await query(
          `SELECT * FROM kr_production_reports WHERE report_no = ? LIMIT 1`,
          [reportNo]
        ) as ReportRow[]
        return NextResponse.json({ success: true, existing: false, report: inserted[0] || null })
      } catch (insertError: unknown) {
        const code = (insertError as { code?: string })?.code
        if (code === 'ER_DUP_ENTRY') {
          const samePdo = await query(
            `SELECT * FROM kr_production_reports WHERE branch_key = ? AND pdo_id = ? LIMIT 1`,
            [branchKey, pdoID]
          ) as ReportRow[]
          if (samePdo.length > 0) {
            return NextResponse.json({ success: true, existing: true, report: samePdo[0] })
          }
          continue
        }
        throw insertError
      }
    }

    return NextResponse.json({ error: 'Failed to generate unique report number' }, { status: 500 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
