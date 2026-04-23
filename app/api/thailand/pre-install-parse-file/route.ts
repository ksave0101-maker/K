import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'

async function initTables() {
  const conn = await (await import('@/lib/mysql')).pool.getConnection()
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS th_pre_install_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batchId VARCHAR(100) NOT NULL UNIQUE,
        customerName VARCHAR(255) DEFAULT '',
        location VARCHAR(500) DEFAULT '',
        createdAt DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_batchId (batchId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
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

// ── CSV parser ─────────────────────────────────────────────────────────────
function parseCSV(text: string, phase: string): ParsedRecord[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
  const find = (...pats: string[]) => {
    for (const p of pats) {
      const i = headers.findIndex(h => h.includes(p))
      if (i >= 0) return i
    }
    return -1
  }

  const tIdx = find('timestamp', 'datetime', 'date', 'time')
  const vIdx = find(
    phase.toLowerCase(), 'phase ' + phase[1].toLowerCase(),
    'current', 'amp', 'amps', 'i_', 'ia', 'ib', 'ic', 'value', 'val'
  )
  const voltIdx = find('volt', 'v_', 'vl', 'kv')
  const pfIdx = find('pf', 'power_factor', 'powerfactor', 'cos')

  const records: ParsedRecord[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/['"]/g, ''))
    const rawVal = vIdx >= 0 ? parseFloat(cols[vIdx]) : NaN
    if (isNaN(rawVal) || rawVal < 0) continue
    records.push({
      record_time: tIdx >= 0 ? cols[tIdx] : String(i),
      value: rawVal,
      voltage: voltIdx >= 0 ? cols[voltIdx] : '',
      pf: pfIdx >= 0 ? cols[pfIdx] : '',
    })
  }
  return records
}

// ── Excel parser ───────────────────────────────────────────────────────────
function parseExcel(buffer: Buffer, phase: string): ParsedRecord[] {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
  if (rows.length < 2) return []

  const headers = (rows[0] as any[]).map(h => String(h || '').toLowerCase())
  const find = (...pats: string[]) => {
    for (const p of pats) {
      const i = headers.findIndex(h => h.includes(p))
      if (i >= 0) return i
    }
    return -1
  }

  const tIdx = find('timestamp', 'datetime', 'date', 'time')
  const vIdx = find(
    phase.toLowerCase(), 'current', 'amp', 'i_', 'value', 'val'
  )
  const voltIdx = find('volt', 'v_')
  const pfIdx = find('pf', 'power_factor', 'cos')

  const records: ParsedRecord[] = []
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as any[]
    const rawVal = vIdx >= 0 ? parseFloat(String(row[vIdx] ?? '')) : NaN
    if (isNaN(rawVal) || rawVal < 0) continue
    const t = tIdx >= 0 ? String(row[tIdx] ?? i) : String(i)
    records.push({
      record_time: t,
      value: rawVal,
      voltage: voltIdx >= 0 ? String(row[voltIdx] ?? '') : '',
      pf: pfIdx >= 0 ? String(row[pfIdx] ?? '') : '',
    })
  }
  return records
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
  await initTables()
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const meter = parseInt(String(formData.get('meter') || '1'))
    const phase = String(formData.get('phase') || 'L1') as 'L1' | 'L2' | 'L3'
    const batchId = String(formData.get('batchId') || `batch_${Date.now()}`)
    const customerName = String(formData.get('customerName') || '')
    const location = String(formData.get('location') || '')
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
          `INSERT IGNORE INTO th_pre_install_batches (batchId, customerName, location, createdAt)
           VALUES (?, ?, ?, NOW())`,
          [batchId, customerName, location]
        )

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
      ? `WHERE batchId = ? AND meter = ?`
      : `WHERE batchId = ?`
    const params = meter ? [batchId, meter] : [batchId]
    const [rows]: any = await conn.query(
      `SELECT * FROM th_pre_install_phase_records ${where} ORDER BY meter, phase, id`,
      params
    )
    return NextResponse.json({ success: true, records: rows })
  } finally {
    conn.release()
  }
}
