import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'

async function initTables() {
  const conn = await pool.getConnection()
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS th_pre_install_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batchId VARCHAR(100) NOT NULL UNIQUE,
        cusID INT DEFAULT NULL,
        customerName VARCHAR(255) DEFAULT '',
        location VARCHAR(500) DEFAULT '',
        createdAt DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_batchId (batchId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    await conn.execute(`
      ALTER TABLE th_pre_install_batches
      ADD COLUMN IF NOT EXISTS cusID INT DEFAULT NULL
    `).catch(() => {})
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS th_pre_install_phase_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batchId VARCHAR(100) NOT NULL,
        meter INT DEFAULT 1,
        phase VARCHAR(10) NOT NULL,
        record_time VARCHAR(100) DEFAULT '',
        value FLOAT DEFAULT 0,
        voltage VARCHAR(50) DEFAULT '',
        pf VARCHAR(50) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_batchId_meter_phase (batchId, meter, phase)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS th_pre_install_phase_file_uploads (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        batchId VARCHAR(100) NOT NULL,
        cusID INT DEFAULT NULL,
        customerName VARCHAR(255) DEFAULT '',
        location VARCHAR(500) DEFAULT '',
        meter INT DEFAULT 1,
        phase VARCHAR(10) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_ext VARCHAR(20) DEFAULT '',
        file_size BIGINT DEFAULT 0,
        mime_type VARCHAR(120) DEFAULT '',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_batch_meter_phase_time (batchId, meter, phase, uploaded_at),
        KEY idx_cusid_time (cusID, uploaded_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS th_pre_install_phase_file_records (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        upload_id BIGINT NOT NULL,
        row_no INT NOT NULL,
        record_time VARCHAR(100) DEFAULT '',
        current_value FLOAT DEFAULT 0,
        voltage VARCHAR(50) DEFAULT '',
        pf VARCHAR(50) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_upload_row (upload_id, row_no),
        CONSTRAINT fk_th_pre_install_phase_file_records_upload
          FOREIGN KEY (upload_id)
          REFERENCES th_pre_install_phase_file_uploads(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    await conn.execute(`ALTER TABLE th_pre_install_phase_file_uploads DROP FOREIGN KEY fk_th_pre_install_phase_uploads_customer`).catch(() => {})
    await conn.execute(`ALTER TABLE th_pre_install_batches DROP FOREIGN KEY fk_th_pre_install_batches_customer`).catch(() => {})
    await conn.execute(`
      UPDATE th_pre_install_phase_file_uploads u
      LEFT JOIN customers_detailed c ON c.customerID = u.cusID
      SET u.cusID = NULL
      WHERE u.cusID IS NOT NULL AND c.customerID IS NULL
    `).catch(() => {})
    await conn.execute(`
      UPDATE th_pre_install_batches b
      LEFT JOIN customers_detailed c ON c.customerID = b.cusID
      SET b.cusID = NULL
      WHERE b.cusID IS NOT NULL AND c.customerID IS NULL
    `).catch(() => {})
    // FK: cusID → customers_detailed.customerID (matches /api/customers)
    await conn.execute(`ALTER TABLE th_pre_install_phase_file_uploads ADD CONSTRAINT fk_th_pre_install_phase_uploads_customer FOREIGN KEY (cusID) REFERENCES customers_detailed(customerID) ON DELETE SET NULL ON UPDATE CASCADE`).catch(() => {})
    await conn.execute(`ALTER TABLE th_pre_install_batches ADD CONSTRAINT fk_th_pre_install_batches_customer FOREIGN KEY (cusID) REFERENCES customers_detailed(customerID) ON DELETE SET NULL ON UPDATE CASCADE`).catch(() => {})
  } finally {
    conn.release()
  }
}

interface ParsedRecord {
  record_time: string
  value: number
  voltage: string
  pf: string
}

function currentColumnAliases(phase: string): string[] {
  const aliases: Record<string, string[]> = {
    L1: ['current 1', 'current1', 'current_1', 'current-1', 'phase 1', 'phase1', 'l1', 'phase a', 'phasea', 'ia'],
    L2: ['current 2', 'current2', 'current_2', 'current-2', 'phase 2', 'phase2', 'l2', 'phase b', 'phaseb', 'ib'],
    L3: ['current 3', 'current3', 'current_3', 'current-3', 'phase 3', 'phase3', 'l3', 'phase c', 'phasec', 'ic'],
  }
  return aliases[phase] || []
}

// ── CSV parser ─────────────────────────────────────────────────────────────
function normalizeCell(value: unknown): string {
  return String(value ?? '').trim().replace(/['"]/g, '')
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const cols: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    const next = line[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === delimiter && !inQuotes) {
      cols.push(normalizeCell(current))
      current = ''
      continue
    }

    current += ch
  }

  cols.push(normalizeCell(current))
  return cols
}

function detectDelimiter(lines: string[]): string {
  const candidates = [',', ';', '\t', '|']
  let best = ','
  let bestScore = -1

  for (const delimiter of candidates) {
    let score = 0
    for (const line of lines.slice(0, 10)) {
      const cols = splitDelimitedLine(line, delimiter)
      if (cols.length > 1) score += cols.length
    }
    if (score > bestScore) {
      bestScore = score
      best = delimiter
    }
  }

  return best
}

function looksNumeric(value: unknown): boolean {
  const normalized = String(value ?? '').replace(/,/g, '').trim()
  if (!normalized) return false
  const num = Number(normalized)
  return !isNaN(num) && isFinite(num)
}

function looksDateLike(value: unknown): boolean {
  const text = String(value ?? '').trim()
  if (!text) return false
  return /(\d{1,4}[/\-]\d{1,2}[/\-]\d{2,4})|(\d{1,2}:\d{2})/.test(text)
}

function detectHeaderRow(rows: string[][], phase: string): number {
  const aliases = currentColumnAliases(phase)
  let bestRow = 0
  let bestScore = -1

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i].map(col => String(col || '').toLowerCase().trim())
    const next = rows[i + 1] || []
    let score = 0

    for (const cell of row) {
      if (!cell) continue
      if (['timestamp', 'datetime', 'date', 'time', 'current', 'amp', 'amps', 'volt', 'pf', 'power factor', 'powerfactor'].some(k => cell.includes(k))) score += 2
      if (aliases.some(alias => cell.includes(alias))) score += 4
      if (!looksNumeric(cell)) score += 0.25
    }

    const numericNext = next.filter(col => looksNumeric(col)).length
    const textCurrent = row.filter(col => col && !looksNumeric(col)).length
    if (textCurrent > 0 && numericNext > 0) score += 2

    if (score > bestScore) {
      bestScore = score
      bestRow = i
    }
  }

  return bestRow
}

// Auto-detect the best numeric column for current value (fallback when headers unrecognized)
function autoDetectValueCol(sampleRows: string[][], colCount: number): number {
  let bestCol = -1
  let bestScore = 0
  for (let c = 0; c < colCount; c++) {
    let score = 0
    for (const row of sampleRows) {
      const v = parseFloat(String(row[c] ?? '').replace(/,/g, ''))
      if (!isNaN(v) && v > 0 && v < 3000) score++
    }
    if (score > bestScore) { bestScore = score; bestCol = c }
  }
  return bestScore >= Math.max(1, sampleRows.length / 2) ? bestCol : -1
}

// Auto-detect timestamp column (fallback)
function autoDetectTimeCol(sampleRows: string[][], colCount: number): number {
  for (let c = 0; c < colCount; c++) {
    let hits = 0
    for (const row of sampleRows) {
      if (looksDateLike(row[c] ?? '')) hits++
    }
    if (hits >= Math.max(1, sampleRows.length / 2)) return c
  }
  return -1
}

function parseCSV(text: string, phase: string): ParsedRecord[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []

  const delimiter = detectDelimiter(lines)
  const rows = lines.map(line => splitDelimitedLine(line, delimiter))
  const headerRowIndex = detectHeaderRow(rows, phase)
  const headers = (rows[headerRowIndex] || []).map(h => String(h || '').toLowerCase())
  const find = (...pats: string[]) => {
    for (const p of pats) {
      const i = headers.findIndex(h => h.includes(p))
      if (i >= 0) return i
    }
    return -1
  }

  // Sample data rows for fallback detection
  const dataRows = rows.slice(headerRowIndex + 1).filter(row => row.some(col => String(col || '').trim()))
  const colCount = Math.max(headers.length, ...dataRows.map(row => row.length), 0)
  const sampleData = dataRows.slice(0, 10).map(row => Array.from({ length: colCount }, (_, i) => normalizeCell(row[i])))

  let tIdx = find('timestamp', 'datetime', 'date', 'time')
  const phaseSpecificIdx = find(...currentColumnAliases(phase))
  let vIdx = phaseSpecificIdx >= 0
    ? phaseSpecificIdx
    : find('current', 'amp', 'amps', 'i_', 'value', 'val')
  const voltIdx = find('volt', 'v_', 'vl', 'kv')
  const pfIdx = find('pf', 'power_factor', 'powerfactor', 'cos')

  // Fallback: auto-detect columns if not found
  if (vIdx < 0) vIdx = autoDetectValueCol(sampleData, colCount)
  if (tIdx < 0) tIdx = autoDetectTimeCol(sampleData, colCount)

  if (vIdx < 0) return []

  const records: ParsedRecord[] = []
  for (let i = 0; i < dataRows.length; i++) {
    const cols = Array.from({ length: colCount }, (_, idx) => normalizeCell(dataRows[i]?.[idx]))
    const rawVal = parseFloat(String(cols[vIdx] ?? '').replace(/,/g, ''))
    if (isNaN(rawVal) || rawVal < 0) continue
    records.push({
      record_time: tIdx >= 0 ? cols[tIdx] : String(i + 1),
      value: rawVal,
      voltage: voltIdx >= 0 ? cols[voltIdx] : '',
      pf: pfIdx >= 0 ? cols[pfIdx] : '',
    })
  }
  return records
}

// ── Excel parser ───────────────────────────────────────────────────────────
function formatExcelCell(value: unknown): string {
  if (value instanceof Date) {
    const d = value as Date
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return normalizeCell(value)
}

function parseExcelSheet(rows: any[][], phase: string): ParsedRecord[] {
  if (rows.length < 2) return []

  const normalizedRows = rows
    .map(row => (row || []).map(col => formatExcelCell(col)))
    .filter(row => row.some(col => String(col || '').trim()))

  if (normalizedRows.length < 2) return []

  const headerRowIndex = detectHeaderRow(normalizedRows, phase)
  const headers = (normalizedRows[headerRowIndex] || []).map(h => String(h || '').toLowerCase().trim())
  const find = (...pats: string[]) => {
    for (const p of pats) {
      const i = headers.findIndex(h => h.includes(p))
      if (i >= 0) return i
    }
    return -1
  }

  const dataRows = normalizedRows.slice(headerRowIndex + 1)
  const colCount = Math.max(headers.length, ...dataRows.map(row => row.length), 0)
  const sampleData = dataRows.slice(0, 10).map(row => Array.from({ length: colCount }, (_, i) => normalizeCell(row[i])))

  let tIdx = find('timestamp', 'datetime', 'date', 'time')
  const phaseSpecificIdx = find(...currentColumnAliases(phase))
  let vIdx = phaseSpecificIdx >= 0
    ? phaseSpecificIdx
    : find('current', 'amp', 'amps', 'i_', 'value', 'val')
  const voltIdx = find('volt', 'v_', 'vl', 'kv')
  const pfIdx = find('pf', 'power_factor', 'powerfactor', 'cos')

  if (vIdx < 0) vIdx = autoDetectValueCol(sampleData, colCount)
  if (tIdx < 0) tIdx = autoDetectTimeCol(sampleData, colCount)

  if (vIdx < 0) return []

  const records: ParsedRecord[] = []
  for (let i = 0; i < dataRows.length; i++) {
    const row = Array.from({ length: colCount }, (_, idx) => normalizeCell(dataRows[i]?.[idx]))
    const rawVal = parseFloat(String(row[vIdx] ?? '').replace(/,/g, ''))
    if (isNaN(rawVal) || rawVal < 0) continue
    records.push({
      record_time: tIdx >= 0 ? row[tIdx] : String(i + 1),
      value: rawVal,
      voltage: voltIdx >= 0 ? row[voltIdx] : '',
      pf: pfIdx >= 0 ? row[pfIdx] : '',
    })
  }

  return records
}

function parseExcel(buffer: Buffer, phase: string): ParsedRecord[] {
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })

  let bestRecords: ParsedRecord[] = []
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName]
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
    const records = parseExcelSheet(rows, phase)
    if (records.length > bestRecords.length) bestRecords = records
  }

  return bestRecords
}

// ── PDF + AI (Gemini) parser ───────────────────────────────────────────────
async function parsePDF(buffer: Buffer, phase: string): Promise<ParsedRecord[]> {
  // Extract raw text first
  let rawText = ''
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParseModule = require('pdf-parse')
    const pdfParse = pdfParseModule.default ?? pdfParseModule
    const data = await pdfParse(buffer)
    rawText = data.text
  } catch {
    return []
  }

  // Try Gemini AI if API key is set
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (apiKey) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const prompt = `
Extract electrical current measurement data for phase ${phase} from this text.
Return ONLY a JSON array, no markdown, no explanation.
Each item: {"record_time":"...", "value": <number>, "voltage":"...", "pf":"..."}
If voltage or pf not found, use empty string "".
Extract ALL data rows found.

Text:
${rawText.slice(0, 8000)}
`
      const result = await model.generateContent(prompt)
      const responseText = result.response.text().trim()
      const jsonStr = responseText.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
      const parsed = JSON.parse(jsonStr)
      if (Array.isArray(parsed)) {
        return parsed
          .filter((r: any) => typeof r.value === 'number' && !isNaN(r.value))
          .map((r: any) => ({
            record_time: String(r.record_time ?? ''),
            value: Number(r.value),
            voltage: String(r.voltage ?? ''),
            pf: String(r.pf ?? ''),
          }))
      }
    } catch { /* fallback to regex */ }
  }

  // Regex fallback: extract numbers that look like current readings
  const records: ParsedRecord[] = []
  const lines = rawText.split(/\n/).filter(l => l.trim())
  const timePattern = /(\d{4}[-/]\d{2}[-/]\d{2}[\sT]\d{2}:\d{2}(:\d{2})?|\d{2}[/:]\d{2}[/:]\d{4})/
  const numPattern = /\b(\d{1,4}(?:\.\d{1,3})?)\b/g
  for (const line of lines) {
    const tMatch = line.match(timePattern)
    const nums: number[] = []
    let m: RegExpExecArray | null
    numPattern.lastIndex = 0
    while ((m = numPattern.exec(line)) !== null) {
      const n = parseFloat(m[1])
      if (n > 0 && n < 2000) nums.push(n)
    }
    if (nums.length > 0) {
      records.push({
        record_time: tMatch ? tMatch[0] : String(records.length + 1),
        value: nums[0],
        voltage: nums.length > 1 ? String(nums[1]) : '',
        pf: '',
      })
    }
  }
  return records
}

// ── POST handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try { await initTables() } catch { /* tables may already exist */ }
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const meter = parseInt(String(formData.get('meter') || '1'))
    const phase = String(formData.get('phase') || 'L1') as 'L1' | 'L2' | 'L3'
    const batchId = String(formData.get('batchId') || `batch_${Date.now()}`)
    const customerName = String(formData.get('customerName') || '')
    const location = String(formData.get('location') || '')
    const cusIDRaw = formData.get('cusID')
    const cusID = cusIDRaw && String(cusIDRaw) !== '' ? parseInt(String(cusIDRaw)) : null
    const action = String(formData.get('action') || 'save') // 'preview' = parse only, 'save' = parse + save to DB

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = (file.name.split('.').pop() || '').toLowerCase()

    let records: ParsedRecord[] = []
    if (ext === 'csv') {
      records = parseCSV(buffer.toString('utf-8'), phase)
    } else if (ext === 'xlsx' || ext === 'xls') {
      records = parseExcel(buffer, phase)
    } else if (ext === 'pdf') {
      records = await parsePDF(buffer, phase)
    } else {
      // Try CSV anyway
      records = parseCSV(buffer.toString('utf-8'), phase)
    }

    if (records.length === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลในไฟล์ / No data found in file' }, { status: 422 })
    }

    // Save to DB only when action is not 'preview'
    if (action !== 'preview') {
      const conn = await pool.getConnection()
      try {
        await conn.execute(
          `INSERT INTO th_pre_install_batches (batchId, cusID, customerName, location, createdAt)
           VALUES (?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE
             cusID = COALESCE(VALUES(cusID), cusID),
             customerName = VALUES(customerName),
             location = VALUES(location)`,
          [batchId, cusID, customerName, location]
        )

        const [uploadResult]: any = await conn.execute(
          `INSERT INTO th_pre_install_phase_file_uploads
             (batchId, cusID, customerName, location, meter, phase, file_name, file_ext, file_size, mime_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            batchId,
            cusID,
            customerName,
            location,
            meter,
            phase,
            file.name,
            ext,
            Number(file.size || 0),
            file.type || '',
          ]
        )
        const uploadId = uploadResult?.insertId

        if (uploadId) {
          for (let i = 0; i < records.length; i++) {
            const r = records[i]
            await conn.execute(
              `INSERT INTO th_pre_install_phase_file_records (upload_id, row_no, record_time, current_value, voltage, pf)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [uploadId, i + 1, r.record_time, r.value, r.voltage, r.pf]
            )
          }
        }

        await conn.execute(
          `DELETE FROM th_pre_install_phase_records WHERE batchId = ? AND meter = ? AND phase = ?`,
          [batchId, meter, phase]
        )

        for (const r of records) {
          await conn.execute(
            `INSERT INTO th_pre_install_phase_records (batchId, meter, phase, record_time, value, voltage, pf)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [batchId, meter, phase, r.record_time, r.value, r.voltage, r.pf]
          )
        }
      } finally {
        conn.release()
      }
    }

    // Compute summary
    const values = records.map(r => r.value)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const peak = Math.max(...values)
    const min = Math.min(...values)

    return NextResponse.json({
      success: true,
      batchId,
      meter,
      phase,
      count: records.length,
      summary: {
        avg: parseFloat(avg.toFixed(2)),
        peak: parseFloat(peak.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
      },
      preview: records.slice(0, 5),
      records: records.slice(0, 2000),
    })
  } catch (err: any) {
    console.error('parse-file error:', err)
    return NextResponse.json({ error: err.message || 'Parse failed' }, { status: 500 })
  }
}

// ── GET - load parsed records ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const batchId = searchParams.get('batchId')
  const meter = searchParams.get('meter')
  if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 })

  const conn = await pool.getConnection()
  try {
    const where = meter
      ? `WHERE u.batchId = ? AND u.meter = ?`
      : `WHERE u.batchId = ?`
    const params = meter ? [batchId, meter] : [batchId]

    const [rows]: any = await conn.query(
      `SELECT
         u.id AS upload_id,
         u.batchId,
         u.cusID,
         u.customerName,
         u.location,
         u.meter,
         u.phase,
         u.file_name,
         u.file_ext,
         u.file_size,
         u.mime_type,
         u.uploaded_at,
         r.row_no,
         r.record_time,
         r.current_value AS value,
         r.voltage,
         r.pf
       FROM th_pre_install_phase_file_uploads u
       LEFT JOIN th_pre_install_phase_file_records r ON r.upload_id = u.id
       ${where}
       ORDER BY u.uploaded_at DESC, u.meter, u.phase, r.row_no`,
      params
    )

    const uploadsMap: Record<string, any> = {}
    for (const row of rows) {
      const key = String(row.upload_id)
      if (!uploadsMap[key]) {
        uploadsMap[key] = {
          uploadId: row.upload_id,
          batchId: row.batchId,
          cusID: row.cusID,
          customerName: row.customerName,
          location: row.location,
          meter: row.meter,
          phase: row.phase,
          fileName: row.file_name,
          fileExt: row.file_ext,
          fileSize: row.file_size,
          mimeType: row.mime_type,
          uploadedAt: row.uploaded_at,
          records: [],
        }
      }
      if (row.row_no != null) {
        uploadsMap[key].records.push({
          rowNo: row.row_no,
          record_time: row.record_time,
          value: row.value,
          voltage: row.voltage,
          pf: row.pf,
        })
      }
    }

    const uploads = Object.values(uploadsMap)
    return NextResponse.json({ success: true, uploads })
  } finally {
    conn.release()
  }
}
