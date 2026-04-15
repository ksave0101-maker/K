import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET() {
  try {
    const rows: any[] = await query('SELECT * FROM kr_domestic_shipments ORDER BY created_at DESC') as any[]
    return NextResponse.json(rows.map(r => ({
      ...r,
      items: r.items ? JSON.parse(r.items) : [],
    })))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, shipmentNumber, orderNumber, destinationRegion, destinationRegionKey, destinationAddress, status, shipDate, estimatedDelivery, actualDelivery, carrier, trackingNumber, items } = body
    await query(
      `INSERT INTO kr_domestic_shipments (id,shipmentNumber,orderNumber,destinationRegion,destinationRegionKey,destinationAddress,status,shipDate,estimatedDelivery,actualDelivery,carrier,trackingNumber,items)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, shipmentNumber, orderNumber, destinationRegion, destinationRegionKey, destinationAddress ?? '', status ?? 'packed', shipDate ?? null, estimatedDelivery, actualDelivery ?? null, carrier, trackingNumber, JSON.stringify(items ?? [])]
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status, actualDelivery, trackingNumber } = body
    await query(
      `UPDATE kr_domestic_shipments SET status=?, actualDelivery=?, trackingNumber=? WHERE id=?`,
      [status, actualDelivery ?? null, trackingNumber ?? null, id]
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
