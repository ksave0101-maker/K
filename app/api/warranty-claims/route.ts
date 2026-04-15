import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

// GET - ดึงรายการ Warranty Claims
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wtID = searchParams.get('wtID')
    const claimID = searchParams.get('claimID')
    const status = searchParams.get('status')

    let query = `SELECT * FROM warranty_claims WHERE 1=1`
    const params: any[] = []

    if (claimID) {
      query += ` AND claimID = ?`
      params.push(claimID)
    } else if (wtID) {
      query += ` AND wtID = ?`
      params.push(wtID)
    }

    if (status) {
      query += ` AND status = ?`
      params.push(status)
    }

    query += ` ORDER BY claim_date DESC`

    const [rows] = await pool.query(query, params)

    return NextResponse.json({ success: true, claims: rows })
  } catch (error: any) {
    console.error('Warranty Claims API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - สร้าง Warranty Claim ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      wtID,
      claim_date,
      issue_description,
      resolution,
      technician,
      notes
    } = body

    if (!wtID) {
      return NextResponse.json(
        { success: false, error: 'Warranty ID is required' },
        { status: 400 }
      )
    }

    const [result]: any = await pool.query(
      `INSERT INTO warranty_claims
      (wtID, claim_date, issue_description, resolution, technician, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [wtID, claim_date, issue_description, resolution, technician, notes]
    )

    return NextResponse.json({
      success: true,
      claimID: result.insertId,
      message: 'Warranty claim created successfully'
    })
  } catch (error: any) {
    console.error('Create warranty claim error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH - อัปเดต Warranty Claim
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { claimID, status, resolution, resolved_date, technician } = body

    if (!claimID) {
      return NextResponse.json(
        { success: false, error: 'Claim ID is required' },
        { status: 400 }
      )
    }

    let updateQuery = 'UPDATE warranty_claims SET '
    const params: any[] = []
    const updates: string[] = []

    if (status) {
      updates.push('status = ?')
      params.push(status)
    }

    if (resolution) {
      updates.push('resolution = ?')
      params.push(resolution)
    }

    if (resolved_date) {
      updates.push('resolved_date = ?')
      params.push(resolved_date)
    }

    if (technician) {
      updates.push('technician = ?')
      params.push(technician)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      )
    }

    updateQuery += updates.join(', ') + ' WHERE claimID = ?'
    params.push(claimID)

    const [result]: any = await pool.query(updateQuery, params)

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Claim not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Warranty claim updated successfully'
    })
  } catch (error: any) {
    console.error('Update warranty claim error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - ลบ Warranty Claim
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimID = searchParams.get('claimID')

    if (!claimID) {
      return NextResponse.json(
        { success: false, error: 'Claim ID is required' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM warranty_claims WHERE claimID = ?', [claimID])

    return NextResponse.json({
      success: true,
      message: 'Warranty claim deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete warranty claim error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
