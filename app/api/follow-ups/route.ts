import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('followUpID') || searchParams.get('id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '200')
    const offset = parseInt(searchParams.get('offset') || '0')

    const base = `
      SELECT followUpID, target_type, target_id, notes, status,
             assigned_to, follow_up_date, created_by, created_at
      FROM follow_ups
    `

    if (id) {
      const [rows]: any = await pool.query(base + ` WHERE followUpID = ?`, [id])
      if (rows && rows.length > 0) {
        return NextResponse.json({ success: true, followUp: rows[0], rows })
      }
      return NextResponse.json({ success: false, error: 'Follow-up not found', rows: [] }, { status: 404 })
    }

    let query = base + ` WHERE 1=1`
    const params: any[] = []

    if (status) {
      query += ` AND status = ?`
      params.push(status)
    }

    query += ` ORDER BY followUpID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows]: any = await pool.query(query, params)
    const [countResult]: any = await pool.query(`SELECT COUNT(*) as total FROM follow_ups`)
    const total = countResult[0]?.total || 0

    return NextResponse.json({ success: true, followUps: rows, rows, total, limit, offset })
  } catch (error: any) {
    console.error('Follow-ups GET error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { target_type, target_id, notes, status, assigned_to, follow_up_date, created_by } = body

    const [result]: any = await pool.query(
      `INSERT INTO follow_ups (target_type, target_id, notes, status, assigned_to, follow_up_date, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        target_type || null,
        target_id || null,
        notes || null,
        status || 'open',
        assigned_to || null,
        follow_up_date || null,
        created_by || null
      ]
    )

    return NextResponse.json({ success: true, followUpID: result.insertId, message: 'Follow-up created successfully' })
  } catch (error: any) {
    console.error('Follow-ups POST error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { followUpID, id, status, notes, assigned_to, follow_up_date } = body
    const recordId = followUpID || id

    if (!recordId) {
      return NextResponse.json({ success: false, error: 'followUpID is required' }, { status: 400 })
    }

    const fields: string[] = []
    const params: any[] = []

    if (status !== undefined) { fields.push('status = ?'); params.push(status) }
    if (notes !== undefined) { fields.push('notes = ?'); params.push(notes) }
    if (assigned_to !== undefined) { fields.push('assigned_to = ?'); params.push(assigned_to) }
    if (follow_up_date !== undefined) { fields.push('follow_up_date = ?'); params.push(follow_up_date) }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    params.push(recordId)
    const [result]: any = await pool.query(
      `UPDATE follow_ups SET ${fields.join(', ')} WHERE followUpID = ?`,
      params
    )

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Follow-up not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Follow-up updated successfully' })
  } catch (error: any) {
    console.error('Follow-ups PATCH error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('followUpID') || searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'followUpID is required' }, { status: 400 })
    }

    await pool.query('DELETE FROM follow_ups WHERE followUpID = ?', [id])
    return NextResponse.json({ success: true, message: 'Follow-up deleted successfully' })
  } catch (error: any) {
    console.error('Follow-ups DELETE error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
