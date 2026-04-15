import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import path from 'path'
import fs from 'fs/promises'

const BILLS_DIR = path.join(process.cwd(), 'data', 'bills')

async function ensureDir() {
  try { await fs.mkdir(BILLS_DIR, { recursive: true }) } catch (_) {}
}

async function nextDocNo(): Promise<string> {
  const year = new Date().getFullYear()
  const [rows]: any = await pool.query(
    "SELECT doc_no FROM acc_scanned_bills WHERE doc_no LIKE ? ORDER BY id DESC LIMIT 1",
    [`SCAN-${year}-%`]
  )
  let seq = 1
  if (rows.length > 0) {
    const last = rows[0].doc_no as string
    const parts = last.split('-')
    seq = parseInt(parts[2] || '0', 10) + 1
  }
  return `SCAN-${year}-${String(seq).padStart(4, '0')}`
}

function parseOcrText(text: string) {
  const result: { bill_date?: string; vendor_name?: string; tax_id?: string; subtotal?: number; vat?: number; total?: number } = {}

  // Try to find date patterns (DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD)
  const dateMatch = text.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/)
  if (dateMatch) {
    let [, d, m, y] = dateMatch
    if (y.length === 2) y = '20' + y
    // If year > 2500, it's Buddhist Era
    const numY = parseInt(y)
    const realY = numY > 2500 ? numY - 543 : numY
    if (parseInt(d) > 12) {
      // DD/MM/YYYY format
      result.bill_date = `${realY}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    } else if (parseInt(m) > 12) {
      // MM/DD/YYYY or ambiguous, treat first as day
      result.bill_date = `${realY}-${d.padStart(2, '0')}-${m.padStart(2, '0')}`
    } else {
      result.bill_date = `${realY}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
  }

  // Tax ID: 13 digits
  const taxMatch = text.match(/(\d[\s-]?\d[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d)/)
  if (taxMatch) {
    result.tax_id = taxMatch[1].replace(/[\s-]/g, '')
  }

  // Total amount: look for total/รวม/ยอดรวม followed by number
  const totalPatterns = [
    /(?:รวม(?:ทั้งสิ้น|เงิน|สุทธิ)?|ยอด(?:รวม|สุทธิ)|total|grand\s*total|net\s*(?:total|amount))\s*[:\s]*([0-9,]+\.?\d{0,2})/i,
    /([0-9,]+\.\d{2})\s*(?:บาท|baht)/i,
  ]
  for (const pat of totalPatterns) {
    const m = text.match(pat)
    if (m) {
      result.total = parseFloat(m[1].replace(/,/g, ''))
      break
    }
  }

  // VAT
  const vatMatch = text.match(/(?:vat|ภาษีมูลค่าเพิ่ม|ภาษี)\s*(?:7%?)?\s*[:\s]*([0-9,]+\.?\d{0,2})/i)
  if (vatMatch) {
    result.vat = parseFloat(vatMatch[1].replace(/,/g, ''))
  }

  // Subtotal
  const subMatch = text.match(/(?:ราคาสินค้า|ก่อน\s*(?:vat|ภาษี)|subtotal|sub\s*total|amount)\s*[:\s]*([0-9,]+\.?\d{0,2})/i)
  if (subMatch) {
    result.subtotal = parseFloat(subMatch[1].replace(/,/g, ''))
  }

  // If we have total but not subtotal/vat, calculate
  if (result.total && !result.subtotal && !result.vat) {
    result.vat = Math.round(result.total * 7 / 107 * 100) / 100
    result.subtotal = Math.round((result.total - result.vat) * 100) / 100
  } else if (result.total && result.vat && !result.subtotal) {
    result.subtotal = Math.round((result.total - result.vat) * 100) / 100
  } else if (result.subtotal && !result.total) {
    result.vat = result.vat || Math.round(result.subtotal * 0.07 * 100) / 100
    result.total = Math.round((result.subtotal + result.vat) * 100) / 100
  }

  // Find company/vendor name - look for "บริษัท" or "ห้าง" or "ร้าน"
  const vendorMatch = text.match(/((?:บริษัท|ห้าง(?:หุ้นส่วน)?|ร้าน)\s*[^\n\r]{3,60})/i)
  if (vendorMatch) {
    result.vendor_name = vendorMatch[1].trim()
  }

  return result
}

export async function POST(req: NextRequest) {
  try {
    await ensureDir()
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer: Buffer = Buffer.from(bytes) as Buffer

    // Generate doc_no and filename
    const docNo = await nextDocNo()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${docNo}.${ext}`
    const filePath = path.join(BILLS_DIR, filename)

    // Save original image
    await fs.writeFile(filePath, buffer)

    // Preprocess with sharp for better OCR
    let ocrBuffer = buffer
    try {
      const sharp = (await import('sharp')).default
      ocrBuffer = await sharp(buffer)
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer()
    } catch (e) {
      console.log('Sharp preprocessing skipped:', e)
    }

    // Run OCR with Thai + English
    let ocrText = ''
    try {
      const Tesseract = await import('tesseract.js')
      const worker = await Tesseract.createWorker('tha+eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      })
      const { data: { text } } = await worker.recognize(ocrBuffer)
      await worker.terminate()
      ocrText = text || ''
    } catch (e: any) {
      console.log('OCR error:', e.message)
      // Try English only as fallback
      try {
        const Tesseract = await import('tesseract.js')
        const worker = await Tesseract.createWorker('eng', 1)
        const { data: { text } } = await worker.recognize(ocrBuffer)
        await worker.terminate()
        ocrText = text || ''
      } catch (_) {}
    }

    // Parse OCR text
    const extracted = parseOcrText(ocrText)

    // Save to database
    const scanDate = new Date().toISOString().slice(0, 10)
    const [r]: any = await pool.query(
      `INSERT INTO acc_scanned_bills (doc_no, scan_date, bill_date, vendor_name, tax_id, subtotal, vat, total, category, ocr_text, image_path, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [docNo, scanDate, extracted.bill_date || null, extracted.vendor_name || null, extracted.tax_id || null,
       extracted.subtotal || 0, extracted.vat || 0, extracted.total || 0, 'expense', ocrText, filename, 'draft']
    )

    return NextResponse.json({
      ok: true,
      data: {
        id: r.insertId,
        doc_no: docNo,
        scan_date: scanDate,
        bill_date: extracted.bill_date,
        vendor_name: extracted.vendor_name,
        tax_id: extracted.tax_id,
        subtotal: extracted.subtotal || 0,
        vat: extracted.vat || 0,
        total: extracted.total || 0,
        ocr_text: ocrText,
        image_path: filename,
      }
    })
  } catch (err: any) {
    console.error('Scan bill error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const q = searchParams.get('q')
    const status = searchParams.get('status')

    if (id) {
      const [rows]: any = await pool.query('SELECT * FROM acc_scanned_bills WHERE id = ?', [id])
      return NextResponse.json({ ok: true, data: rows[0] || null })
    }

    let sql = 'SELECT * FROM acc_scanned_bills WHERE 1=1'
    const params: any[] = []

    if (q) {
      sql += ' AND (vendor_name LIKE ? OR doc_no LIKE ? OR tax_id LIKE ?)'
      const like = `%${q}%`
      params.push(like, like, like)
    }
    if (status) {
      sql += ' AND status = ?'
      params.push(status)
    }

    sql += ' ORDER BY id DESC'
    const [rows]: any = await pool.query(sql, params)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query(
      `UPDATE acc_scanned_bills SET bill_date=?, vendor_name=?, tax_id=?, subtotal=?, vat=?, total=?, category=?, status=?, note=?, linked_doc_type=?, linked_doc_id=? WHERE id=?`,
      [b.bill_date || null, b.vendor_name || null, b.tax_id || null, b.subtotal || 0, b.vat || 0, b.total || 0,
       b.category || 'expense', b.status || 'draft', b.note || null, b.linked_doc_type || null, b.linked_doc_id || null, b.id]
    )
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    // Get image path before delete
    const [rows]: any = await pool.query('SELECT image_path FROM acc_scanned_bills WHERE id = ?', [id])
    if (rows[0]?.image_path) {
      try { await fs.unlink(path.join(BILLS_DIR, rows[0].image_path)) } catch (_) {}
    }
    await pool.query('DELETE FROM acc_scanned_bills WHERE id = ?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
