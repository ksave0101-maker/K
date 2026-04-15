import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

const BRANCH_KEYWORDS: Record<string, string[]> = {
  korea: ['korea', 'korean', '한국', '대한민국', '코리아', 'kr'],
  thailand: ['thailand', 'thai', 'ไทย', 'ประเทศไทย', 'th'],
  vietnam: ['vietnam', 'vietnamese', 'เวียดนาม', 'vn'],
  malaysia: ['malaysia', 'malay', 'มาเล', 'มาเลเซีย', 'my'],
  brunei: ['brunei', 'บรูไน', 'bn']
}

async function ensurePurchaseRequestTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchase_requests (
      prID int NOT NULL AUTO_INCREMENT,
      prNo varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
      prDate date DEFAULT NULL,
      department varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      requested_by varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      purpose text COLLATE utf8mb4_unicode_ci,
      priority varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
      required_date date DEFAULT NULL,
      total_amount decimal(12,2) DEFAULT 0.00,
      status varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
      approved_by varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      approved_at timestamp NULL DEFAULT NULL,
      notes text COLLATE utf8mb4_unicode_ci,
      created_by varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (prID),
      UNIQUE KEY prNo (prNo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchase_request_items (
      itemID int NOT NULL AUTO_INCREMENT,
      prID int NOT NULL,
      product_code varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      product_name varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      description text COLLATE utf8mb4_unicode_ci,
      quantity decimal(10,2) DEFAULT 1.00,
      unit varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pcs',
      estimated_price decimal(12,2) DEFAULT 0.00,
      total_price decimal(12,2) DEFAULT 0.00,
      notes text COLLATE utf8mb4_unicode_ci,
      PRIMARY KEY (itemID),
      KEY idx_prID (prID),
      CONSTRAINT fk_pr_items_prID FOREIGN KEY (prID) REFERENCES purchase_requests (prID) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `)

  // Wrap each ALTER in try-catch: MySQL 5.7 does not support ADD COLUMN IF NOT EXISTS
  try { await pool.query(`ALTER TABLE purchase_requests ADD COLUMN branch varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL`) } catch (_) {}
  try { await pool.query(`ALTER TABLE purchase_requests ADD COLUMN requester_name varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL`) } catch (_) {}
  try { await pool.query(`ALTER TABLE purchase_requests ADD COLUMN supplier_id int DEFAULT NULL`) } catch (_) {}
  try { await pool.query(`ALTER TABLE purchase_requests ADD COLUMN supplier_name varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL`) } catch (_) {}
  try { await pool.query(`ALTER TABLE purchase_request_items ADD COLUMN product_name varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL`) } catch (_) {}
  try { await pool.query(`ALTER TABLE purchase_request_items ADD COLUMN description text COLLATE utf8mb4_unicode_ci`) } catch (_) {}
}

function toNumber(value: any): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,\s฿]/g, '').trim()
    if (!cleaned) return 0
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : 0
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function calculateItemTotal(item: any): number {
  const qty = toNumber(item?.quantity ?? 1)
  const unitPrice = toNumber(item?.estimated_price ?? item?.unit_price ?? item?.price ?? 0)
  const lineTotal = toNumber(item?.total_price ?? item?.amount ?? item?.total ?? 0)
  return lineTotal > 0 ? lineTotal : qty * unitPrice
}

function normalizePurchaseRequest(pr: any, items?: any[]) {
  const safeItems = Array.isArray(items) ? items : Array.isArray(pr?.items) ? pr.items : []
  const calculatedTotal = safeItems.reduce((sum: number, item: any) => sum + calculateItemTotal(item), 0)
  const storedTotal = toNumber(pr?.total_amount)
  return {
    ...pr,
    items: safeItems,
    total_amount: storedTotal > 0 ? storedTotal : calculatedTotal
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensurePurchaseRequestTable()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('prID')
    const prNo = searchParams.get('prNo')
    const status = searchParams.get('status')
    const branch = (searchParams.get('branch') || '').toLowerCase()
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `
      SELECT pr.*,
             (SELECT COUNT(*) FROM purchase_request_items WHERE prID = pr.prID) as item_count
      FROM purchase_requests pr
    `

    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE pr.prID = ?`, [id])
      if (rows && rows.length > 0) {
        const pr = rows[0]
        const [items]: any = await pool.query(
          `SELECT * FROM purchase_request_items WHERE prID = ? ORDER BY itemID`,
          [pr.prID]
        )
        const normalized = normalizePurchaseRequest(pr, items || [])
        return NextResponse.json({ success: true, purchaseRequest: normalized, rows: [normalized] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    if (prNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE pr.prNo = ?`, [prNo])
      if (rows && rows.length > 0) {
        const pr = rows[0]
        const [items]: any = await pool.query(
          `SELECT * FROM purchase_request_items WHERE prID = ? ORDER BY itemID`,
          [pr.prID]
        )
        const normalized = normalizePurchaseRequest(pr, items || [])
        return NextResponse.json({ success: true, purchaseRequest: normalized, rows: [normalized] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    if (status) {
      query += ` AND pr.status = ?`
      params.push(status)
    }

    if (branch && BRANCH_KEYWORDS[branch]) {
      const tokens = BRANCH_KEYWORDS[branch]
      const branchLikeConditions = tokens.map(() => '(pr.department LIKE ? OR pr.purpose LIKE ? OR pr.notes LIKE ? OR pr.requested_by LIKE ? OR pr.requester_name LIKE ? OR pr.prNo LIKE ?)').join(' OR ')

      query += ` AND (LOWER(COALESCE(pr.branch, '')) = ? OR (${branchLikeConditions}))`
      params.push(branch)

      tokens.forEach((token) => {
        const like = `%${token}%`
        params.push(like, like, like, like, like, like)
      })
    }

    query += ` ORDER BY pr.prID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows]: any = await pool.query(query, params)
    const [countResult]: any = await pool.query(`SELECT COUNT(*) as total FROM purchase_requests`)

    const normalizedRows = await Promise.all(
      (rows || []).map(async (row: any) => {
        const [items]: any = await pool.query(
          `SELECT * FROM purchase_request_items WHERE prID = ? ORDER BY itemID`,
          [row.prID]
        )
        return normalizePurchaseRequest(row, items || [])
      })
    )

    return NextResponse.json({ success: true, rows: normalizedRows, total: countResult[0]?.total || 0, limit, offset })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensurePurchaseRequestTable()

    const body = await request.json()
    const { prDate, department, requested_by, requester_name, purpose, priority, required_date, total_amount, notes, items, created_by, branch, supplier_id, supplier_name } = body

    const requesterName = requester_name || requested_by || null
    const calculatedTotalAmount = Array.isArray(items)
      ? items.reduce((sum: number, item: any) => sum + calculateItemTotal(item), 0)
      : 0
    const finalTotalAmount = toNumber(total_amount) > 0 ? toNumber(total_amount) : calculatedTotalAmount

    const prNo = await generateDocumentNumber('PR', 'purchase_requests', 'prNo')
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [result]: any = await connection.query(
        `INSERT INTO purchase_requests (prNo, prDate, department, requested_by, requester_name, purpose, priority, required_date, total_amount, notes, branch, supplier_id, supplier_name, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [prNo, prDate, department, requesterName, requesterName, purpose, priority || 'normal', required_date, finalTotalAmount, notes, branch || null, supplier_id || null, supplier_name || null, created_by]
      )

      const prID = result.insertId

      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await connection.query(
            `INSERT INTO purchase_request_items (prID, product_code, product_name, description, quantity, unit, estimated_price, total_price, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              prID,
              item.product_code || '',
              item.product_name || item.description || '',
              item.description || item.product_name || '',
              item.quantity || 1,
              item.unit || 'pcs',
              toNumber(item.estimated_price),
              calculateItemTotal(item),
              item.notes || ''
            ]
          )
        }
      }

      await connection.commit()
      return NextResponse.json({ success: true, prID, prNo, message: 'Created successfully' })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error('Create error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensurePurchaseRequestTable()

    const body = await request.json()
    const { id, prID, status, approved_by } = body
    const branch = String(body?.branch || '').toLowerCase()
    const recordId = id || prID

    if (!recordId) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }

    let updateQuery = 'UPDATE purchase_requests SET '
    const params: any[] = []

    if (status) {
      updateQuery += 'status = ?'
      params.push(status)
    }

    if (approved_by) {
      if (params.length > 0) updateQuery += ', '
      updateQuery += 'approved_by = ?, approved_at = NOW()'
      params.push(approved_by)
    }

    if (params.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    updateQuery += ' WHERE prID = ?'
    params.push(recordId)

    if (branch && BRANCH_KEYWORDS[branch]) {
      const tokens = BRANCH_KEYWORDS[branch]
      const branchLikeConditions = tokens.map(() => '(department LIKE ? OR purpose LIKE ? OR notes LIKE ? OR requested_by LIKE ? OR requester_name LIKE ? OR prNo LIKE ?)').join(' OR ')
      updateQuery += ` AND (LOWER(COALESCE(branch, '')) = ? OR (${branchLikeConditions}))`
      params.push(branch)
      tokens.forEach((token) => {
        const like = `%${token}%`
        params.push(like, like, like, like, like, like)
      })
    }

    const [result]: any = await pool.query(updateQuery, params)

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Not found or branch mismatch' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Updated successfully' })
  } catch (error: any) {
    console.error('Update error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('prID')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }

    await pool.query('DELETE FROM purchase_requests WHERE prID = ?', [id])
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
