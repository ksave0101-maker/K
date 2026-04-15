import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

// GET all field work logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fwlID = searchParams.get('fwlID')
    const limit = searchParams.get('limit')

    let query = 'SELECT * FROM field_work_logs'
    const params: any[] = []

    if (fwlID) {
      query += ' WHERE fwlID = ?'
      params.push(fwlID)
    } else {
      query += ' ORDER BY work_date DESC, fwlID DESC'
      if (limit) {
        query += ' LIMIT ?'
        params.push(parseInt(limit))
      } else {
        query += ' LIMIT 100'
      }
    }

    const [rows]: any = await pool.query(query, params)

    // If single record, also fetch tasks
    if (fwlID && rows.length > 0) {
      const [tasks]: any = await pool.query(
        'SELECT * FROM field_work_log_tasks WHERE fwlID = ? ORDER BY task_number',
        [fwlID]
      )

      // Get total count
      const [countResult]: any = await pool.query(
        'SELECT COUNT(*) as total FROM field_work_logs'
      )

      return NextResponse.json({
        success: true,
        fieldWorkLog: rows[0],
        tasks,
        total: countResult[0].total
      })
    }

    // Get total count
    const [countResult]: any = await pool.query(
      'SELECT COUNT(*) as total FROM field_work_logs'
    )

    return NextResponse.json({
      success: true,
      data: rows,
      total: countResult[0].total
    })
  } catch (error: any) {
    console.error('GET /api/field-work-logs error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - create new field work log
export async function POST(request: NextRequest) {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const body = await request.json()
    const {
      fwlDate,
      work_date,
      employee_name,
      department,
      customer_name,
      site_location,
      site_contact_person,
      site_contact_phone,
      work_type,
      work_description,
      start_time,
      end_time,
      total_hours,
      equipment_used,
      materials_used,
      work_status,
      completion_percentage,
      issues_encountered,
      customer_signature,
      customer_satisfaction,
      photos,
      next_visit_required,
      next_visit_date,
      notes,
      tasks,
      created_by
    } = body

    // Generate document number
    const fwlNo = await generateDocumentNumber('FWL', 'field_work_logs', 'fwlNo')

    // Insert field work log record
    const [result]: any = await connection.query(
      `INSERT INTO field_work_logs (
        fwlNo, fwlDate, work_date, employee_name, department,
        customer_name, site_location, site_contact_person, site_contact_phone,
        work_type, work_description, start_time, end_time, total_hours,
        equipment_used, materials_used, work_status, completion_percentage,
        issues_encountered, customer_signature, customer_satisfaction,
        photos, next_visit_required, next_visit_date, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fwlNo, fwlDate, work_date, employee_name, department || null,
        customer_name || null, site_location, site_contact_person || null, site_contact_phone || null,
        work_type || 'installation', work_description, start_time || null, end_time || null, total_hours || 0,
        equipment_used || null, materials_used || null, work_status || 'in_progress', completion_percentage || 0,
        issues_encountered || null, customer_signature || null, customer_satisfaction || null,
        photos ? JSON.stringify(photos) : null, next_visit_required || 0, next_visit_date || null, notes || null, created_by
      ]
    )

    const fwlID = result.insertId

    // Insert tasks if provided
    if (tasks && tasks.length > 0) {
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]
        await connection.query(
          `INSERT INTO field_work_log_tasks (
            fwlID, task_number, task_description, task_status, time_spent_minutes, notes
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            fwlID,
            i + 1,
            task.task_description,
            task.task_status || 'pending',
            task.time_spent_minutes || 0,
            task.notes || null
          ]
        )
      }
    }

    await connection.commit()

    return NextResponse.json({
      success: true,
      fwlID,
      fwlNo,
      message: 'Field work log created successfully'
    })
  } catch (error: any) {
    await connection.rollback()
    console.error('POST /api/field-work-logs error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    connection.release()
  }
}

// PATCH - update field work log
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { fwlID, work_status, completion_percentage, customer_signature, customer_satisfaction } = body

    if (!fwlID) {
      return NextResponse.json({ success: false, error: 'fwlID required' }, { status: 400 })
    }

    const updates: string[] = []
    const params: any[] = []

    if (work_status) {
      updates.push('work_status = ?')
      params.push(work_status)
    }

    if (completion_percentage !== undefined) {
      updates.push('completion_percentage = ?')
      params.push(completion_percentage)
    }

    if (customer_signature !== undefined) {
      updates.push('customer_signature = ?')
      params.push(customer_signature)
    }

    if (customer_satisfaction !== undefined) {
      updates.push('customer_satisfaction = ?')
      params.push(customer_satisfaction)
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 })
    }

    params.push(fwlID)

    await pool.query(
      `UPDATE field_work_logs SET ${updates.join(', ')} WHERE fwlID = ?`,
      params
    )

    return NextResponse.json({ success: true, message: 'Field work log updated' })
  } catch (error: any) {
    console.error('PATCH /api/field-work-logs error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fwlID = searchParams.get('fwlID')

    if (!fwlID) {
      return NextResponse.json({ success: false, error: 'fwlID required' }, { status: 400 })
    }

    await pool.query('DELETE FROM field_work_logs WHERE fwlID = ?', [fwlID])

    return NextResponse.json({ success: true, message: 'Field work log deleted' })
  } catch (error: any) {
    console.error('DELETE /api/field-work-logs error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
