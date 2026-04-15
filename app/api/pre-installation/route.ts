import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const formID = searchParams.get('formID') || searchParams.get('id')

    let query = `
      SELECT
        p.formID,
        p.orderID,
        p.cusID,
        p.site_address,
        p.\`Pre-installNo\` as pre_install_no,
        p.checklist,
        p.photos,
        p.notes,
        p.status,
        p.created_by,
        p.created_at,
        c.fullname as customer_name,
        c.phone as customer_phone
      FROM pre_installation_forms p
      LEFT JOIN cus_detail c ON p.cusID = c.cusID
      WHERE 1=1
    `

    const params: any[] = []

    if (formID) {
      query += ` AND formID = ?`
      params.push(formID)
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM pre_installation_forms WHERE 1=1`
    const countParams: any[] = []

    if (formID) {
      countQuery += ` AND formID = ?`
      countParams.push(formID)
    }

    const [countResult] = await pool.query(countQuery, countParams)
    const total = (countResult as any)[0].total

    // If requesting single form by ID, return it as 'form' object
    if (formID) {
      return NextResponse.json({
        success: true,
        form: (rows as any[])[0] || null,
        rows,
        total,
        limit,
        offset
      })
    }

    return NextResponse.json({
      success: true,
      forms: rows,
      preInstallations: rows,
      rows,
      total,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Pre-installation API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderID,
      cusID,
      site_address,
      customer_name,
      site_address: siteAddr,
      contact_phone,
      inspection_date,
      checklist,
      photos,
      notes,
      status,
      created_by
    } = body

    // Generate Pre-installNo
    const [maxResult] = await pool.query(
      'SELECT MAX(formID) as maxID FROM pre_installation_forms'
    )
    const nextID = ((maxResult as any)[0].maxID || 0) + 1
    const preInstallNo = `PRE-${String(nextID).padStart(6, '0')}`

    const query = `
      INSERT INTO pre_installation_forms (
        orderID, cusID, site_address, \`Pre-installNo\`, checklist, photos, notes, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const [result] = await pool.query(query, [
      orderID || null,
      cusID || null,
      site_address || siteAddr || '',
      preInstallNo,
      JSON.stringify(checklist || {}),
      JSON.stringify(photos || []),
      notes || '',
      status || 'pending',
      created_by || 'system'
    ])

    return NextResponse.json({
      success: true,
      formID: (result as any).insertId,
      preInstallNo
    })
  } catch (error: any) {
    console.error('Create pre-installation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      formID,
      orderID,
      cusID,
      site_address,
      checklist,
      photos,
      notes,
      status
    } = body

    if (!formID) {
      return NextResponse.json(
        { success: false, error: 'formID is required' },
        { status: 400 }
      )
    }

    const query = `
      UPDATE pre_installation_forms
      SET
        orderID = ?,
        cusID = ?,
        site_address = ?,
        checklist = ?,
        photos = ?,
        notes = ?,
        status = ?
      WHERE formID = ?
    `

    await pool.query(query, [
      orderID || null,
      cusID || null,
      site_address || '',
      JSON.stringify(checklist || {}),
      JSON.stringify(photos || []),
      notes || '',
      status || 'pending',
      formID
    ])

    return NextResponse.json({
      success: true,
      formID
    })
  } catch (error: any) {
    console.error('Update pre-installation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
