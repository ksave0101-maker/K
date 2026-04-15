import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-pool'

// GET - ดึงรายชื่อลูกค้าทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const contacts = await query<any[]>(
      `SELECT
        mc.id,
        mc.company_name,
        mc.country,
        mc.customer_type,
        mc.contact_status,
        mc.work_type,
        mc.contact_person,
        mc.phone,
        mc.email,
        mc.notes,
        mc.created_at,
        mc.updated_at,
        mc.assigned_to,
        u.name as assigned_to_name,
        u.userName as assigned_to_username
      FROM marketing_contacts mc
      LEFT JOIN user_list u ON mc.assigned_to = u.userId
      ORDER BY
        mc.country,
        FIELD(mc.contact_status, 'pending', 'contacted', 'follow_up', 'negotiating', 'success', 'in_service', 'feedback', 'closed'),
        mc.customer_type,
        mc.created_at DESC`
    )

    return NextResponse.json({ success: true, contacts })
  } catch (error: any) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: error.message },
      { status: 500 }
    )
  }
}

// POST - เพิ่มลูกค้าใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      company_name,
      country = 'Thailand',
      customer_type = 'new',
      contact_status = 'pending',
      work_type,
      contact_person,
      phone,
      email,
      notes,
      created_by,
      assigned_to
    } = body

    if (!company_name) {
      return NextResponse.json(
        { success: false, error: 'missing_company_name' },
        { status: 400 }
      )
    }

    const result = await query<any>(
      `INSERT INTO marketing_contacts
        (company_name, country, customer_type, contact_status, work_type, contact_person, phone, email, notes, created_by, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, country, customer_type, contact_status, work_type, contact_person, phone, email, notes, created_by, assigned_to]
    )

    return NextResponse.json({
      success: true,
      contact: {
        id: result.insertId,
        company_name,
        customer_type,
        contact_status,
        work_type,
        contact_person,
        phone,
        email,
        notes
      }
    })
  } catch (error: any) {
    console.error('Create contact error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: error.message },
      { status: 500 }
    )
  }
}

// PUT - อัปเดตข้อมูลลูกค้า
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      company_name,
      country,
      customer_type,
      contact_status,
      work_type,
      contact_person,
      phone,
      email,
      notes,
      assigned_to
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'missing_id' },
        { status: 400 }
      )
    }

    await query(
      `UPDATE marketing_contacts
      SET company_name = ?,
          country = ?,
          customer_type = ?,
          contact_status = ?,
          work_type = ?,
          contact_person = ?,
          phone = ?,
          email = ?,
          notes = ?,
          assigned_to = ?
      WHERE id = ?`,
      [company_name, country, customer_type, contact_status, work_type, contact_person, phone, email, notes, assigned_to, id]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update contact error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: error.message },
      { status: 500 }
    )
  }
}

// DELETE - ลบลูกค้า
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'missing_id' },
        { status: 400 }
      )
    }

    await query('DELETE FROM marketing_contacts WHERE id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete contact error:', error)
    return NextResponse.json(
      { success: false, error: 'server_error', message: error.message },
      { status: 500 }
    )
  }
}
