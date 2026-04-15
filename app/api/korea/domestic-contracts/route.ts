import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET() {
  try {
    const rows = await query('SELECT * FROM kr_domestic_contracts ORDER BY created_at DESC')
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { contractNumber, region, regionKey, buyer, seller, productName, quantity, contractValue, contractDate, deliveryDate, status, remarks } = body
    const result: any = await query(
      `INSERT INTO kr_domestic_contracts (contractNumber,region,regionKey,buyer,seller,productName,quantity,contractValue,contractDate,deliveryDate,status,remarks)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [contractNumber, region, regionKey, buyer, seller, productName, quantity ?? 0, contractValue ?? 0, contractDate, deliveryDate, status ?? 'pending', remarks ?? '']
    )
    return NextResponse.json({ id: result.insertId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, contractNumber, region, regionKey, buyer, seller, productName, quantity, contractValue, contractDate, deliveryDate, status, remarks } = body
    await query(
      `UPDATE kr_domestic_contracts SET contractNumber=?,region=?,regionKey=?,buyer=?,seller=?,productName=?,quantity=?,contractValue=?,contractDate=?,deliveryDate=?,status=?,remarks=? WHERE id=?`,
      [contractNumber, region, regionKey, buyer, seller, productName, quantity ?? 0, contractValue ?? 0, contractDate, deliveryDate, status, remarks ?? '', id]
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
    await query('DELETE FROM kr_domestic_contracts WHERE id=?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
