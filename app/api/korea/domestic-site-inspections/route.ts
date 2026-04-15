import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET() {
  try {
    const rows = await query('SELECT * FROM kr_domestic_site_inspections ORDER BY created_at DESC')
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { inspectionNumber, region, siteLocation, inspector, inspectionDate, structuralCondition, electricalSystem, safetyCompliance, siteReadiness, overallResult, remarks } = body
    const result: any = await query(
      `INSERT INTO kr_domestic_site_inspections (inspectionNumber,region,siteLocation,inspector,inspectionDate,structuralCondition,electricalSystem,safetyCompliance,siteReadiness,overallResult,remarks)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [inspectionNumber, region, siteLocation, inspector, inspectionDate, structuralCondition ?? 'pass', electricalSystem ?? 'pass', safetyCompliance ?? 'pass', siteReadiness ?? 'pass', overallResult ?? 'pass', remarks ?? '']
    )
    return NextResponse.json({ id: result.insertId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await query('DELETE FROM kr_domestic_site_inspections WHERE id=?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
