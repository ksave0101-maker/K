import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

type CustomerActivity = {
  activityID?: number
  activityDate: string
  salesStaffName: string
  customerName: string
  customerID?: number | null
  activityType: string
  keyDiscussionSummary: string
  customerReaction: string
  technicalQuestionsRaised: string
  nextAction: string
  nextActionDate: string
  hqSupportNeeded: string
}

// GET - Fetch all customer activities
export async function GET(req: NextRequest) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM customer_activities ORDER BY activityDate DESC, created_at DESC`
    )
    return NextResponse.json({ ok: true, data: rows })
  } catch (error: any) {
    console.error('GET /api/customer-activities error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

// POST - Create new activity
export async function POST(req: NextRequest) {
  try {
    const body: CustomerActivity = await req.json()

    const {
      activityDate,
      salesStaffName,
      customerName,
      activityType,
      keyDiscussionSummary,
      customerReaction,
      technicalQuestionsRaised,
      nextAction,
      nextActionDate,
      hqSupportNeeded
    } = body

    if (!activityDate || !salesStaffName || !customerName || !activityType) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: activityDate, salesStaffName, customerName, activityType' },
        { status: 400 }
      )
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO customer_activities
       (activityDate, salesStaffName, customerName, activityType, keyDiscussionSummary,
        customerReaction, technicalQuestionsRaised, nextAction, nextActionDate, hqSupportNeeded, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        activityDate,
        salesStaffName,
        customerName,
        activityType,
        keyDiscussionSummary || '',
        customerReaction || 'Neutral',
        technicalQuestionsRaised || '',
        nextAction || '',
        nextActionDate || null,
        hqSupportNeeded || 'No'
      ]
    )

    return NextResponse.json({
      ok: true,
      activityID: result.insertId,
      message: 'Activity created successfully'
    })
  } catch (error: any) {
    console.error('POST /api/customer-activities error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to create activity' },
      { status: 500 }
    )
  }
}

// PUT - Update existing activity
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Missing activityID parameter' },
        { status: 400 }
      )
    }

    const body: CustomerActivity = await req.json()

    const {
      activityDate,
      salesStaffName,
      customerName,
      activityType,
      keyDiscussionSummary,
      customerReaction,
      technicalQuestionsRaised,
      nextAction,
      nextActionDate,
      hqSupportNeeded
    } = body

    if (!activityDate || !salesStaffName || !customerName || !activityType) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: activityDate, salesStaffName, customerName, activityType' },
        { status: 400 }
      )
    }

    await pool.query(
      `UPDATE customer_activities
       SET activityDate = ?, salesStaffName = ?, customerName = ?, activityType = ?,
           keyDiscussionSummary = ?, customerReaction = ?, technicalQuestionsRaised = ?,
           nextAction = ?, nextActionDate = ?, hqSupportNeeded = ?, updated_at = NOW()
       WHERE activityID = ?`,
      [
        activityDate,
        salesStaffName,
        customerName,
        activityType,
        keyDiscussionSummary || '',
        customerReaction || 'Neutral',
        technicalQuestionsRaised || '',
        nextAction || '',
        nextActionDate || null,
        hqSupportNeeded || 'No',
        id
      ]
    )

    return NextResponse.json({
      ok: true,
      message: 'Activity updated successfully'
    })
  } catch (error: any) {
    console.error('PUT /api/customer-activities error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to update activity' },
      { status: 500 }
    )
  }
}

// DELETE - Delete activity
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Missing activityID parameter' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM customer_activities WHERE activityID = ?', [id])

    return NextResponse.json({
      ok: true,
      message: 'Activity deleted successfully'
    })
  } catch (error: any) {
    console.error('DELETE /api/customer-activities error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to delete activity' },
      { status: 500 }
    )
  }
}
