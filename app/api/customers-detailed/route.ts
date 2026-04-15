import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

type CustomerDetailed = {
  customerID?: number
  customerCompanyName: string
  industryType: string
  locationProvince: string
  contactPersonName: string
  contactPosition: string
  phone: string
  email: string
  estimatedLoadKW: number
  estimatedSavingMonth: number
  estimatedMonthlySavingTHB: number
  salesOwner: string
  firstContactDate: string
  currentStage: string
  licensingProbability: number
  expectedContractMonth: string
  strategicImportance: string
  notes: string
}

// GET - Fetch all customers
export async function GET(req: NextRequest) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM customers_detailed ORDER BY customerID DESC`
    )
    return NextResponse.json({ ok: true, data: rows })
  } catch (error: any) {
    console.error('GET /api/customers-detailed error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST - Create new customer
export async function POST(req: NextRequest) {
  try {
    const body: CustomerDetailed = await req.json()

    const {
      customerCompanyName,
      industryType,
      locationProvince,
      contactPersonName,
      contactPosition,
      phone,
      email,
      estimatedLoadKW,
      estimatedSavingMonth,
      estimatedMonthlySavingTHB,
      salesOwner,
      firstContactDate,
      currentStage,
      licensingProbability,
      expectedContractMonth,
      strategicImportance,
      notes
    } = body

    if (!customerCompanyName) {
      return NextResponse.json(
        { ok: false, error: 'Missing required field: customerCompanyName' },
        { status: 400 }
      )
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO customers_detailed
       (customerCompanyName, industryType, locationProvince, contactPersonName, contactPosition,
        phone, email, estimatedLoadKW, estimatedSavingMonth, estimatedMonthlySavingTHB,
        salesOwner, firstContactDate, currentStage, licensingProbability, expectedContractMonth,
        strategicImportance, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        customerCompanyName,
        industryType || '',
        locationProvince || '',
        contactPersonName || '',
        contactPosition || '',
        phone || '',
        email || '',
        estimatedLoadKW || 0,
        estimatedSavingMonth || 0,
        estimatedMonthlySavingTHB || 0,
        salesOwner || '',
        firstContactDate || null,
        currentStage || 'Lead',
        licensingProbability || 0,
        expectedContractMonth || '',
        strategicImportance || 'Low',
        notes || ''
      ]
    )

    return NextResponse.json({
      ok: true,
      customerID: result.insertId,
      message: 'Customer created successfully'
    })
  } catch (error: any) {
    console.error('POST /api/customers-detailed error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to create customer' },
      { status: 500 }
    )
  }
}

// PUT - Update existing customer
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Missing customerID parameter' },
        { status: 400 }
      )
    }

    const body: CustomerDetailed = await req.json()

    const {
      customerCompanyName,
      industryType,
      locationProvince,
      contactPersonName,
      contactPosition,
      phone,
      email,
      estimatedLoadKW,
      estimatedSavingMonth,
      estimatedMonthlySavingTHB,
      salesOwner,
      firstContactDate,
      currentStage,
      licensingProbability,
      expectedContractMonth,
      strategicImportance,
      notes
    } = body

    if (!customerCompanyName) {
      return NextResponse.json(
        { ok: false, error: 'Missing required field: customerCompanyName' },
        { status: 400 }
      )
    }

    await pool.query(
      `UPDATE customers_detailed
       SET customerCompanyName = ?, industryType = ?, locationProvince = ?,
           contactPersonName = ?, contactPosition = ?, phone = ?, email = ?,
           estimatedLoadKW = ?, estimatedSavingMonth = ?, estimatedMonthlySavingTHB = ?,
           salesOwner = ?, firstContactDate = ?, currentStage = ?, licensingProbability = ?,
           expectedContractMonth = ?, strategicImportance = ?, notes = ?, updated_at = NOW()
       WHERE customerID = ?`,
      [
        customerCompanyName,
        industryType || '',
        locationProvince || '',
        contactPersonName || '',
        contactPosition || '',
        phone || '',
        email || '',
        estimatedLoadKW || 0,
        estimatedSavingMonth || 0,
        estimatedMonthlySavingTHB || 0,
        salesOwner || '',
        firstContactDate || null,
        currentStage || 'Lead',
        licensingProbability || 0,
        expectedContractMonth || '',
        strategicImportance || 'Low',
        notes || '',
        id
      ]
    )

    return NextResponse.json({
      ok: true,
      message: 'Customer updated successfully'
    })
  } catch (error: any) {
    console.error('PUT /api/customers-detailed error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to update customer' },
      { status: 500 }
    )
  }
}

// DELETE - Delete customer
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'Missing customerID parameter' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM customers_detailed WHERE customerID = ?', [id])

    return NextResponse.json({
      ok: true,
      message: 'Customer deleted successfully'
    })
  } catch (error: any) {
    console.error('DELETE /api/customers-detailed error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
