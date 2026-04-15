import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET() {
  try {
    const rows = await query('SELECT * FROM kr_test_results ORDER BY created_at DESC')
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, testNumber, productName, orderNumber, serialNumber, testType, result, testDate, tester, testDuration, notes, retestRequired } = body
    await query(
      `INSERT INTO kr_test_results (id,testNumber,productName,orderNumber,serialNumber,testType,result,testDate,tester,testDuration,notes,retestRequired)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, testNumber, productName, orderNumber, serialNumber, testType ?? 'functional', result ?? 'pass', testDate, tester, testDuration ?? '', notes ?? null, retestRequired ? 1 : 0]
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
    await query('DELETE FROM kr_test_results WHERE id=?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
