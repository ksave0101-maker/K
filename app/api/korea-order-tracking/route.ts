import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')

    let query = 'SELECT * FROM korea_order_tracking'
    const params: any[] = []
    const conditions: string[] = []

    if (id) { conditions.push('trackID = ?'); params.push(id) }
    if (status) { conditions.push('status = ?'); params.push(status) }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ')
    query += ' ORDER BY created_at DESC'

    const [rows] = await pool.query(query, params)
    return NextResponse.json({ ok: true, success: true, data: rows, rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const year = new Date().getFullYear()
    const [countRows]: any = await pool.query(
      "SELECT COUNT(*) as cnt FROM korea_order_tracking WHERE trackNo LIKE ?",
      [`KOT-${year}-%`]
    )
    const nextNum = (countRows[0]?.cnt || 0) + 1
    const trackNo = `KOT-${year}-${String(nextNum).padStart(4, '0')}`

    const [result]: any = await pool.query(
      `INSERT INTO korea_order_tracking
       (trackNo, orderID, orderNo, orderDescription, supplierName, orderDate,
        shippingMethod, trackingNumber, containerNo, status,
        estimatedDeparture, actualDeparture, estimatedArrival, actualArrival,
        customsStatus, customsNotes, warehouseLocation, serial_number, lot_number,
        itemsSummary, totalValue, notes,
        thailand_tracking_no, thailand_carrier, thailand_delivery_status,
        thailand_est_delivery, thailand_actual_delivery, thailand_delivery_address, thailand_delivery_notes,
        pr_id, pdo_id,
        created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trackNo,
        body.orderID || null,
        body.orderNo || null,
        body.orderDescription || null,
        body.supplierName || 'Korea HQ',
        body.orderDate || null,
        body.shippingMethod || 'sea',
        body.trackingNumber || null,
        body.containerNo || null,
        body.status || 'ordered',
        body.estimatedDeparture || null,
        body.actualDeparture || null,
        body.estimatedArrival || null,
        body.actualArrival || null,
        body.customsStatus || 'none',
        body.customsNotes || null,
        body.warehouseLocation || null,
        body.serial_number || null,
        body.lot_number || null,
        body.itemsSummary || null,
        body.totalValue || 0,
        body.notes || null,
        body.thailand_tracking_no || null,
        body.thailand_carrier || null,
        body.thailand_delivery_status || 'pending',
        body.thailand_est_delivery || null,
        body.thailand_actual_delivery || null,
        body.thailand_delivery_address || null,
        body.thailand_delivery_notes || null,
        body.pr_id || null,
        body.pdo_id || null,
        body.created_by || 'administrator'
      ]
    )

    return NextResponse.json({ ok: true, success: true, trackID: result.insertId, trackNo })
  } catch (err: any) {
    return NextResponse.json({ ok: false, success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.trackID) {
      return NextResponse.json({ ok: false, error: 'trackID is required' }, { status: 400 })
    }

    const fields: string[] = []
    const params: any[] = []

    const allowedFields = [
      'orderID', 'orderNo', 'orderDescription', 'supplierName', 'orderDate',
      'shippingMethod', 'trackingNumber', 'containerNo', 'status',
      'estimatedDeparture', 'actualDeparture', 'estimatedArrival', 'actualArrival',
      'customsStatus', 'customsNotes', 'warehouseLocation', 'serial_number', 'lot_number',
      'itemsSummary', 'totalValue', 'notes',
      'thailand_tracking_no', 'thailand_carrier', 'thailand_delivery_status',
      'thailand_est_delivery', 'thailand_actual_delivery', 'thailand_delivery_address', 'thailand_delivery_notes',
      'pr_id', 'pdo_id'
    ]

    for (const f of allowedFields) {
      if (body[f] !== undefined) {
        fields.push(`${f} = ?`)
        params.push(body[f])
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ ok: false, error: 'No fields to update' }, { status: 400 })
    }

    params.push(body.trackID)
    await pool.query(`UPDATE korea_order_tracking SET ${fields.join(', ')} WHERE trackID = ?`, params)

    return NextResponse.json({ ok: true, success: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 })
    }
    await pool.query('DELETE FROM korea_order_tracking WHERE trackID = ?', [id])
    return NextResponse.json({ ok: true, success: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, success: false, error: err.message }, { status: 500 })
  }
}
