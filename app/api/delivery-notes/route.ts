import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

type DeliveryNotesJson = {
  customer?: {
    name?: string
    address?: string
    phone?: string
    contactPerson?: string
  }
  shipping?: {
    address?: string
    receiverName?: string
    receiverPhone?: string
  }
  deliveryPerson?: string
  vehicleNo?: string
  refOrderNo?: string
  notes?: string
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (!value) return fallback
  if (typeof value !== 'string') return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function normalizeDeliveryRow(row: Record<string, any>, items: any[] = []) {
  const noteData = parseJson<DeliveryNotesJson>(row.notes, {})
  const customer = noteData.customer || {}
  const shipping = noteData.shipping || {}

  return {
    ...row,
    noteNo: row.deliveryNo,
    date: row.deliveryDate,
    delivery_date: row.deliveryDate,
    customer_name: customer.name || '',
    customer_address: customer.address || '',
    customer_phone: customer.phone || '',
    contact_person: customer.contactPerson || '',
    receiver_name: shipping.receiverName || '',
    receiver_phone: shipping.receiverPhone || '',
    delivery_address: shipping.address || customer.address || '',
    delivery_person: noteData.deliveryPerson || '',
    vehicle_no: noteData.vehicleNo || '',
    refOrderNo: noteData.refOrderNo || '',
    note_text: noteData.notes || '',
    items,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const deliveryID = searchParams.get('deliveryID')
    const deliveryNo = searchParams.get('deliveryNo')
    const q = searchParams.get('q') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 300)

    if (deliveryID || deliveryNo) {
      const where = deliveryID ? 'dn.deliveryID = ?' : 'dn.deliveryNo = ?'
      const value = deliveryID || deliveryNo
      const [rows]: any = await pool.query(
        `SELECT dn.*
         FROM delivery_notes dn
         WHERE ${where}
         LIMIT 1`,
        [value]
      )

      const row = rows?.[0]
      if (!row) {
        return NextResponse.json({ success: false, error: 'Delivery note not found' }, { status: 404 })
      }

      const [itemRows]: any = await pool.query(
        `SELECT itemID, deliveryID, productID, sku, product_name, quantity
         FROM delivery_note_items
         WHERE deliveryID = ?
         ORDER BY itemID ASC`,
        [row.deliveryID]
      )

      const delivery = normalizeDeliveryRow(row, itemRows || [])
      return NextResponse.json({
        success: true,
        delivery,
        delivery_note: delivery,
        delivery_notes: [delivery],
      })
    }

    const params: any[] = []
    let where = ''
    if (q.trim()) {
      where = 'WHERE dn.deliveryNo LIKE ? OR dn.notes LIKE ? OR dn.status LIKE ?'
      const like = `%${q.trim()}%`
      params.push(like, like, like)
    }

    const [rows]: any = await pool.query(
      `SELECT
         dn.*,
         (SELECT COUNT(*) FROM delivery_note_items di WHERE di.deliveryID = dn.deliveryID) AS itemCount
       FROM delivery_notes dn
       ${where}
       ORDER BY dn.created_at DESC, dn.deliveryID DESC
       LIMIT ?`,
      [...params, limit]
    )

    const deliveryNotes = (rows || []).map((row: Record<string, any>) => normalizeDeliveryRow(row))

    return NextResponse.json({
      success: true,
      deliveryNotes,
      rows: deliveryNotes,
    })
  } catch (error: any) {
    console.error('GET /api/delivery-notes error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const connection = await pool.getConnection()

  try {
    const body = await req.json()
    const {
      deliveryNo,
      deliveryDate,
      customer,
      shipping,
      items,
      deliveryPerson,
      vehicleNo,
      notes,
      refOrderNo,
      created_by,
      invID,
      cusID,
      status,
      contractID,
    } = body

    if (!deliveryNo) {
      return NextResponse.json({ success: false, error: 'Delivery number is required' }, { status: 400 })
    }

    await connection.beginTransaction()

    const notesJson = JSON.stringify({
      customer: customer || {},
      shipping: shipping || {},
      deliveryPerson: deliveryPerson || null,
      vehicleNo: vehicleNo || null,
      refOrderNo: refOrderNo || null,
      notes: notes || null,
    })

    const [result]: any = await connection.query(
      `INSERT INTO delivery_notes
       (deliveryNo, deliveryDate, invID, cusID, notes, status, created_by, created_at, contractID)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        deliveryNo,
        deliveryDate || new Date().toISOString().slice(0, 10),
        invID || null,
        cusID || null,
        notesJson,
        status || 'confirmed',
        created_by || null,
        contractID || null,
      ]
    )

    const deliveryID = result.insertId

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await connection.query(
          `INSERT INTO delivery_note_items
           (deliveryID, productID, sku, product_name, quantity)
           VALUES (?, ?, ?, ?, ?)`,
          [
            deliveryID,
            item.productID || item.product_id || null,
            item.sku || null,
            item.product_name || item.productName || item.desc || '',
            Number(item.quantity || item.qty || 0) || 0,
          ]
        )
      }
    }

    await connection.commit()

    return NextResponse.json({
      success: true,
      deliveryID,
      deliveryNo,
      message: 'Delivery note created successfully',
    })
  } catch (error: any) {
    try {
      await connection.rollback()
    } catch {}
    console.error('POST /api/delivery-notes error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    connection.release()
  }
}
