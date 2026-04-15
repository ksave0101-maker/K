import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const analysisId = searchParams.get('analysisId')

    if (id) {
      const rows = await query('SELECT * FROM kr_pre_install_bills WHERE id = ?', [id])
      return NextResponse.json(rows[0] || null)
    }
    if (analysisId) {
      const rows = await query('SELECT * FROM kr_pre_install_bills WHERE analysisId = ?', [analysisId])
      return NextResponse.json(rows)
    }
    const rows = await query('SELECT * FROM kr_pre_install_bills ORDER BY createdDate DESC LIMIT 200')
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, billNumber, analysisId, customerName, customerCountry, contactPerson, email, analysisType, serviceFee, equipmentCost, installationCost, totalAmount, currency, dueDate, status, createdDate, notes } = body
    await query(
      `INSERT INTO kr_pre_install_bills (id, billNumber, analysisId, customerName, customerCountry, contactPerson, email, analysisType, serviceFee, equipmentCost, installationCost, totalAmount, currency, dueDate, status, createdDate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, billNumber, analysisId || null, customerName, customerCountry, contactPerson, email || null, analysisType, serviceFee || 0, equipmentCost || 0, installationCost || 0, totalAmount || 0, currency || 'KRW', dueDate || null, status || 'pending', createdDate || new Date().toISOString().split('T')[0], notes || null]
    )
    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, billNumber, analysisId, customerName, customerCountry, contactPerson, email, analysisType, serviceFee, equipmentCost, installationCost, totalAmount, currency, dueDate, status, notes } = body
    await query(
      `UPDATE kr_pre_install_bills SET billNumber=?, analysisId=?, customerName=?, customerCountry=?, contactPerson=?, email=?, analysisType=?, serviceFee=?, equipmentCost=?, installationCost=?, totalAmount=?, currency=?, dueDate=?, status=?, notes=? WHERE id=?`,
      [billNumber, analysisId || null, customerName, customerCountry, contactPerson, email || null, analysisType, serviceFee || 0, equipmentCost || 0, installationCost || 0, totalAmount || 0, currency || 'KRW', dueDate || null, status, notes || null, id]
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await query('DELETE FROM kr_pre_install_bills WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
