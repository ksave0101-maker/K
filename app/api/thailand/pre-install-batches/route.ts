import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'

// GET all batches with their records
export async function GET() {
  const conn = await pool.getConnection()
  try {
    const [batches]: any = await conn.query(
      `SELECT * FROM th_pre_install_batches ORDER BY created_at DESC`
    )
    const [records]: any = await conn.query(
      `SELECT * FROM th_pre_install_batch_records ORDER BY batchId, record_order`
    )
    const result = batches.map((b: any) => ({
      batchId: b.batchId,
      customerName: b.customerName,
      location: b.location,
      createdAt: b.createdAt,
      records: records
        .filter((r: any) => r.batchId === b.batchId)
        .map((r: any) => ({
          id: r.record_order,
          date: r.date,
          time: r.time,
          L1: r.L1,
          L2: r.L2,
          L3: r.L3,
          N: r.N,
          voltage: r.voltage,
          pf: r.pf,
          note: r.note,
        })),
    }))
    return NextResponse.json({ success: true, batches: result })
  } finally {
    conn.release()
  }
}

// POST - save all batches (full replace per batchId)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const batches: any[] = body.batches || []
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    for (const b of batches) {
      await conn.execute(
        `INSERT INTO th_pre_install_batches (batchId, customerName, location, createdAt)
         VALUES (?,?,?,?)
         ON DUPLICATE KEY UPDATE customerName=VALUES(customerName), location=VALUES(location), createdAt=VALUES(createdAt)`,
        [b.batchId, b.customerName, b.location, b.createdAt]
      )
      // Replace records for this batch
      await conn.execute(`DELETE FROM th_pre_install_batch_records WHERE batchId = ?`, [b.batchId])
      for (let i = 0; i < (b.records || []).length; i++) {
        const r = b.records[i]
        await conn.execute(
          `INSERT INTO th_pre_install_batch_records
            (batchId, record_order, date, time, L1, L2, L3, N, voltage, pf, note)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [b.batchId, r.id ?? i, r.date, r.time, r.L1, r.L2, r.L3, r.N, r.voltage, r.pf, r.note]
        )
      }
    }
    await conn.commit()
    return NextResponse.json({ success: true })
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

// DELETE - delete a batch by batchId
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const batchId = searchParams.get('batchId')
  if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 })
  const conn = await pool.getConnection()
  try {
    await conn.execute(`DELETE FROM th_pre_install_batch_records WHERE batchId = ?`, [batchId])
    await conn.execute(`DELETE FROM th_pre_install_batches WHERE batchId = ?`, [batchId])
    return NextResponse.json({ success: true })
  } finally {
    conn.release()
  }
}
