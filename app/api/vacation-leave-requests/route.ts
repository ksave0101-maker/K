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

async function ensureVacationLeaveTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vacation_leave_requests (
      vlrID int NOT NULL AUTO_INCREMENT,
      vlrNo varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
      requestDate date DEFAULT NULL,
      employeeName varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
      employeeId varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
      department varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
      leaveType enum('annual_leave','personal_leave','sick_leave','other') COLLATE utf8mb4_unicode_ci DEFAULT 'annual_leave',
      startDate date NOT NULL,
      endDate date NOT NULL,
      totalDays int DEFAULT 0,
      reason text COLLATE utf8mb4_unicode_ci,
      contactPhone varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      backupPerson varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      approver varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      status enum('pending','approved','rejected','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
      approved_by varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      approved_at timestamp NULL DEFAULT NULL,
      notes text COLLATE utf8mb4_unicode_ci,
      created_by varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (vlrID),
      UNIQUE KEY vlrNo (vlrNo),
      KEY idx_employee_id (employeeId),
      KEY idx_department (department),
      KEY idx_status (status),
      KEY idx_start_end (startDate, endDate)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `)

  // Wrap each ALTER in try-catch: MySQL 5.7 does not support ADD COLUMN IF NOT EXISTS
  try { await pool.query(`ALTER TABLE vacation_leave_requests ADD COLUMN branch varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL`) } catch (_) {}
  try { await pool.query(`ALTER TABLE vacation_leave_requests ADD COLUMN userId INT NULL DEFAULT NULL`) } catch (_) {}
  try {
    await pool.query(`ALTER TABLE vacation_leave_requests ADD CONSTRAINT fk_vlr_user FOREIGN KEY (userId) REFERENCES user_list(userId) ON DELETE SET NULL ON UPDATE CASCADE`)
  } catch (_) { /* constraint already exists */ }
}

export async function GET(request: NextRequest) {
  try {
    await ensureVacationLeaveTable()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('vlrID')
    const vlrNo = searchParams.get('vlrNo')
    const status = searchParams.get('status')
    const employeeId = searchParams.get('employeeId')
    const createdBy = searchParams.get('createdBy')
    const userIdParam = searchParams.get('userId')
    const branch = (searchParams.get('branch') || '').toLowerCase()
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = 'SELECT * FROM vacation_leave_requests'

    if (id) {
      const [rows]: any = await pool.query(`${baseSelect} WHERE vlrID = ?`, [id])
      if (rows && rows.length > 0) {
        return NextResponse.json({ success: true, leaveRequest: rows[0], rows: [rows[0]] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    if (vlrNo) {
      const [rows]: any = await pool.query(`${baseSelect} WHERE vlrNo = ?`, [vlrNo])
      if (rows && rows.length > 0) {
        return NextResponse.json({ success: true, leaveRequest: rows[0], rows: [rows[0]] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    let query = `${baseSelect} WHERE 1=1`
    const params: any[] = []

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    if (employeeId) {
      query += ' AND employeeId = ?'
      params.push(employeeId)
    }

    if (createdBy) {
      query += ' AND created_by = ?'
      params.push(createdBy)
    }

    if (userIdParam) {
      query += ' AND userId = ?'
      params.push(parseInt(userIdParam))
    }

    if (branch && BRANCH_KEYWORDS[branch]) {
      const tokens = BRANCH_KEYWORDS[branch]
      const branchLikeConditions = tokens.map(() => '(department LIKE ? OR reason LIKE ? OR notes LIKE ? OR approver LIKE ? OR employeeId LIKE ?)').join(' OR ')

      query += ` AND (LOWER(COALESCE(branch, '')) = ? OR (${branchLikeConditions}))`
      params.push(branch)

      tokens.forEach((token) => {
        const like = `%${token}%`
        params.push(like, like, like, like, like)
      })
    }

    query += ' ORDER BY vlrID DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)
    const [countResult]: any = await pool.query('SELECT COUNT(*) as total FROM vacation_leave_requests')

    return NextResponse.json({ success: true, rows, total: countResult[0]?.total || 0, limit, offset })
  } catch (error: any) {
    console.error('Vacation leave GET error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureVacationLeaveTable()

    const body = await request.json()

    const {
      requestDate,
      employeeName,
      employeeId,
      userId,
      department,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      contactPhone,
      backupPerson,
      requester,
      approver,
      notes,
      createdBy,
      branch
    } = body

    const requesterName = requester || approver

    if (!employeeName || !employeeId || !department || !startDate || !endDate || !reason || !requesterName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate employeeId uniqueness: it must not belong to a different user
    const [existingRows]: any = await pool.query(
      'SELECT created_by FROM vacation_leave_requests WHERE employeeId = ? LIMIT 1',
      [employeeId]
    )
    if (existingRows && existingRows.length > 0) {
      const existingOwner = existingRows[0].created_by
      if (existingOwner && createdBy && existingOwner !== createdBy) {
        return NextResponse.json(
          { success: false, error: `Employee ID "${employeeId}" is already registered to another user` },
          { status: 409 }
        )
      }
    }

    const vlrNo = await generateDocumentNumber('VLR', 'vacation_leave_requests', 'vlrNo')

    const [result]: any = await pool.query(
      `INSERT INTO vacation_leave_requests
      (vlrNo, requestDate, employeeName, employeeId, userId, department, leaveType, startDate, endDate, totalDays, reason, contactPhone, backupPerson, approver, branch, status, notes, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW())`,
      [
        vlrNo,
        requestDate || new Date().toISOString().split('T')[0],
        employeeName,
        employeeId,
        userId ? parseInt(userId) : null,
        department,
        leaveType || 'annual_leave',
        startDate,
        endDate,
        Number(totalDays || 0),
        reason,
        contactPhone || null,
        backupPerson || null,
        requesterName,
        branch || null,
        notes || null,
        createdBy || 'system'
      ]
    )

    return NextResponse.json({
      success: true,
      vlrID: result.insertId,
      vlrNo,
      message: 'Vacation leave request created successfully'
    })
  } catch (error: any) {
    console.error('Vacation leave POST error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureVacationLeaveTable()

    const body = await request.json()
    const { id, vlrID, status, approved_by, notes } = body
    const branch = String(body?.branch || '').toLowerCase()
    const recordId = id || vlrID

    if (!recordId) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }

    const updates: string[] = []
    const params: any[] = []

    if (status) {
      updates.push('status = ?')
      params.push(status)
    }

    if (approved_by) {
      updates.push('approved_by = ?')
      params.push(approved_by)
      updates.push('approved_at = NOW()')
    }

    if (notes !== undefined) {
      updates.push('notes = ?')
      params.push(notes)
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 })
    }

    let updateQuery = `UPDATE vacation_leave_requests SET ${updates.join(', ')} WHERE vlrID = ?`
    params.push(recordId)

    if (branch && BRANCH_KEYWORDS[branch]) {
      const tokens = BRANCH_KEYWORDS[branch]
      const branchLikeConditions = tokens.map(() => '(department LIKE ? OR reason LIKE ? OR notes LIKE ? OR approver LIKE ? OR employeeId LIKE ?)').join(' OR ')
      updateQuery += ` AND (LOWER(COALESCE(branch, '')) = ? OR (${branchLikeConditions}))`
      params.push(branch)
      tokens.forEach((token) => {
        const like = `%${token}%`
        params.push(like, like, like, like, like)
      })
    }

    const [result]: any = await pool.query(updateQuery, params)
    if (result?.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Not found or branch mismatch' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Vacation leave PATCH error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
