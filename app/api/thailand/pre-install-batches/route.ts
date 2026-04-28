import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'

async function initTables() {
  const conn = await pool.getConnection()
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS th_pre_install_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batchId VARCHAR(100) NOT NULL UNIQUE,
        customerName VARCHAR(255) DEFAULT '',
        location VARCHAR(500) DEFAULT '',
        createdAt DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_batchId (batchId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS th_pre_install_batch_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batchId VARCHAR(100) NOT NULL,
        record_order INT DEFAULT 0,
        date VARCHAR(50) DEFAULT '',
        time VARCHAR(20) DEFAULT '',
        L1 VARCHAR(50) DEFAULT '',
        L2 VARCHAR(50) DEFAULT '',
        L3 VARCHAR(50) DEFAULT '',
        N VARCHAR(50) DEFAULT '',
        voltage VARCHAR(50) DEFAULT '380',
        pf VARCHAR(50) DEFAULT '0.85',
        sourceFileL1 VARCHAR(255) DEFAULT '',
        sourceFileL2 VARCHAR(255) DEFAULT '',
        sourceFileL3 VARCHAR(255) DEFAULT '',
        note TEXT,
        KEY idx_batchId (batchId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    await conn.execute(`ALTER TABLE th_pre_install_batch_records ADD COLUMN sourceFileL1 VARCHAR(255) DEFAULT ''`).catch(() => {})
    await conn.execute(`ALTER TABLE th_pre_install_batch_records ADD COLUMN sourceFileL2 VARCHAR(255) DEFAULT ''`).catch(() => {})
    await conn.execute(`ALTER TABLE th_pre_install_batch_records ADD COLUMN sourceFileL3 VARCHAR(255) DEFAULT ''`).catch(() => {})
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS th_pre_install_phase_file_uploads (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        batchId VARCHAR(100) NOT NULL,
        cusID INT DEFAULT NULL,
        customerName VARCHAR(255) DEFAULT '',
        location VARCHAR(500) DEFAULT '',
        meter INT DEFAULT 1,
        phase VARCHAR(10) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_ext VARCHAR(20) DEFAULT '',
        file_size BIGINT DEFAULT 0,
        mime_type VARCHAR(120) DEFAULT '',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_batch_meter_phase_time (batchId, meter, phase, uploaded_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS th_pre_install_phase_file_records (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        upload_id BIGINT NOT NULL,
        row_no INT NOT NULL,
        record_time VARCHAR(100) DEFAULT '',
        current_value FLOAT DEFAULT 0,
        voltage VARCHAR(50) DEFAULT '',
        pf VARCHAR(50) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_upload_row (upload_id, row_no),
        CONSTRAINT fk_th_pre_install_phase_file_records_upload
          FOREIGN KEY (upload_id)
          REFERENCES th_pre_install_phase_file_uploads(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    await conn.execute(`ALTER TABLE th_pre_install_batches ADD COLUMN cusID INT DEFAULT NULL`).catch(() => {})
    await conn.execute(`ALTER TABLE th_pre_install_batches DROP FOREIGN KEY fk_th_pre_install_batches_customer`).catch(() => {})
    await conn.execute(`ALTER TABLE th_pre_install_phase_file_uploads DROP FOREIGN KEY fk_th_pre_install_phase_uploads_customer`).catch(() => {})
    await conn.execute(`
      UPDATE th_pre_install_batches b
      LEFT JOIN customers_detailed c ON c.customerID = b.cusID
      SET b.cusID = NULL
      WHERE b.cusID IS NOT NULL AND c.customerID IS NULL
    `).catch(() => {})
    await conn.execute(`
      UPDATE th_pre_install_phase_file_uploads u
      LEFT JOIN customers_detailed c ON c.customerID = u.cusID
      SET u.cusID = NULL
      WHERE u.cusID IS NOT NULL AND c.customerID IS NULL
    `).catch(() => {})
    // FK: cusID → customers_detailed.customerID (matches /api/customers)
    await conn.execute(`ALTER TABLE th_pre_install_batches ADD CONSTRAINT fk_th_pre_install_batches_customer FOREIGN KEY (cusID) REFERENCES customers_detailed(customerID) ON DELETE SET NULL ON UPDATE CASCADE`).catch(() => {})
    await conn.execute(`ALTER TABLE th_pre_install_phase_file_uploads ADD CONSTRAINT fk_th_pre_install_phase_uploads_customer FOREIGN KEY (cusID) REFERENCES customers_detailed(customerID) ON DELETE SET NULL ON UPDATE CASCADE`).catch(() => {})
  } finally {
    conn.release()
  }
}

// GET all batches with their records
export async function GET() {
  try { await initTables() } catch { /* tables may already exist */ }
  const conn = await pool.getConnection()
  try {
    const [batches]: any = await conn.query(
      `SELECT * FROM th_pre_install_batches ORDER BY created_at DESC`
    )
    const [records]: any = await conn.query(
      `SELECT * FROM th_pre_install_batch_records ORDER BY batchId, record_order`
    )

    // Also fetch phase records for batches that have no batch_records (saved via parse-file route)
    const batchIdsWithNoRecords: string[] = batches
      .filter((b: any) => !records.some((r: any) => r.batchId === b.batchId))
      .map((b: any) => b.batchId)

    let phaseRecordsByBatch: Record<string, any[]> = {}
    if (batchIdsWithNoRecords.length > 0) {
      const placeholders = batchIdsWithNoRecords.map(() => '?').join(',')
      const [phaseUploadRows]: any = await conn.query(
        `SELECT
           u.batchId,
           u.meter,
           u.phase,
           u.file_name,
           u.id AS upload_id,
           u.uploaded_at,
           r.row_no,
           r.record_time,
           r.current_value AS value,
           r.voltage,
           r.pf
         FROM th_pre_install_phase_file_uploads u
         JOIN th_pre_install_phase_file_records r ON r.upload_id = u.id
         WHERE u.batchId IN (${placeholders})
         ORDER BY u.batchId, u.meter, u.phase, u.uploaded_at DESC, r.row_no ASC`,
        batchIdsWithNoRecords
      )

      const latestUploadByBatchMeterPhase: Record<string, number> = {}
      for (const row of phaseUploadRows) {
        const key = `${row.batchId}|${row.meter}|${row.phase}`
        if (!latestUploadByBatchMeterPhase[key]) {
          latestUploadByBatchMeterPhase[key] = row.upload_id
        }
      }

      for (const row of phaseUploadRows) {
        const key = `${row.batchId}|${row.meter}|${row.phase}`
        if (latestUploadByBatchMeterPhase[key] !== row.upload_id) continue
        if (!phaseRecordsByBatch[row.batchId]) phaseRecordsByBatch[row.batchId] = []
        phaseRecordsByBatch[row.batchId].push({
          batchId: row.batchId,
          meter: row.meter,
          phase: row.phase,
          file_name: row.file_name,
          record_time: row.record_time,
          value: row.value,
          voltage: row.voltage,
          pf: row.pf,
        })
      }

      if (Object.keys(phaseRecordsByBatch).length === 0) {
        const [legacyPhaseRows]: any = await conn.query(
          `SELECT * FROM th_pre_install_phase_records WHERE batchId IN (${placeholders}) ORDER BY batchId, phase, id`,
          batchIdsWithNoRecords
        )
        for (const row of legacyPhaseRows) {
          if (!phaseRecordsByBatch[row.batchId]) phaseRecordsByBatch[row.batchId] = []
          phaseRecordsByBatch[row.batchId].push(row)
        }
      }
    }

    const parseDateTime = (rt: string) => {
      const s = String(rt || '').trim()
      const ymd = s.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})[T\s]+(\d{1,2}:\d{2})/)
      if (ymd) return { date: ymd[1].replace(/\//g, '-').split('-').map((p, i) => i === 0 ? p : p.padStart(2, '0')).join('-'), time: ymd[2].padStart(5, '0') }
      const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}:\d{2}))?/)
      if (dmy) return { date: `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`, time: dmy[4] ? dmy[4].padStart(5,'0') : '' }
      const hm = s.match(/(\d{1,2}:\d{2})/)
      return { date: '', time: hm ? hm[1].padStart(5,'0') : '' }
    }

    const mergePhaseRecords = (rows: any[]) => {
      const byPhase: Record<string, any[]> = { L1: [], L2: [], L3: [] }
      for (const r of rows) {
        if (byPhase[r.phase]) byPhase[r.phase].push(r)
      }
      const maxLen = Math.max(byPhase.L1.length, byPhase.L2.length, byPhase.L3.length)
      return Array.from({ length: Math.min(maxLen, 2000) }, (_, i) => {
        const src = byPhase.L1[i] || byPhase.L2[i] || byPhase.L3[i]
        const { date, time } = parseDateTime(src.record_time)
        return {
          id: i + 1, date, time,
          L1: byPhase.L1[i] ? String(byPhase.L1[i].value) : '',
          L2: byPhase.L2[i] ? String(byPhase.L2[i].value) : '',
          L3: byPhase.L3[i] ? String(byPhase.L3[i].value) : '',
          N: '',
          voltage: src.voltage || '380',
          pf: src.pf || '0.85',
          sourceFileL1: byPhase.L1[i]?.file_name || '',
          sourceFileL2: byPhase.L2[i]?.file_name || '',
          sourceFileL3: byPhase.L3[i]?.file_name || '',
          note: '',
        }
      })
    }

    const result = batches.map((b: any) => {
      const batchRecords = records
        .filter((r: any) => r.batchId === b.batchId)
        .map((r: any) => ({
          id: r.record_order, date: r.date, time: r.time,
          L1: r.L1, L2: r.L2, L3: r.L3, N: r.N,
          voltage: r.voltage, pf: r.pf,
          sourceFileL1: r.sourceFileL1 || '',
          sourceFileL2: r.sourceFileL2 || '',
          sourceFileL3: r.sourceFileL3 || '',
          note: r.note,
        }))

      const finalRecords = batchRecords.length > 0
        ? batchRecords
        : phaseRecordsByBatch[b.batchId]
          ? mergePhaseRecords(phaseRecordsByBatch[b.batchId])
          : []

      return {
        batchId: b.batchId,
        cusID: b.cusID ?? null,
        customerName: b.customerName,
        location: b.location,
        createdAt: b.createdAt,
        records: finalRecords,
      }
    })

    return NextResponse.json({ success: true, batches: result })
  } finally {
    conn.release()
  }
}

// POST - save all batches (full replace per batchId)
export async function POST(req: NextRequest) {
  try { await initTables() } catch { /* tables may already exist */ }
  const body = await req.json()
  const batches: any[] = body.batches || []
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    for (const b of batches) {
      const batchColumns = ['batchId', 'cusID', 'customerName', 'location', 'createdAt']
      const batchValues = [b.batchId, b.cusID ?? null, b.customerName || '', b.location || '', b.createdAt || null]
      await conn.execute(
        `INSERT INTO th_pre_install_batches (${batchColumns.join(', ')})
         VALUES (${batchColumns.map(() => '?').join(', ')})
         ON DUPLICATE KEY UPDATE cusID=COALESCE(VALUES(cusID), cusID), customerName=VALUES(customerName), location=VALUES(location), createdAt=VALUES(createdAt)`,
        batchValues
      )
      // Replace records for this batch
      await conn.execute(`DELETE FROM th_pre_install_batch_records WHERE batchId = ?`, [b.batchId])
      for (let i = 0; i < (b.records || []).length; i++) {
        const r = b.records[i]
        const recordColumns = ['batchId', 'record_order', 'date', 'time', 'L1', 'L2', 'L3', 'N', 'voltage', 'pf', 'sourceFileL1', 'sourceFileL2', 'sourceFileL3', 'note']
        const recordValues = [
          b.batchId,
          r.id ?? i,
          r.date || '',
          r.time || '',
          r.L1 || '',
          r.L2 || '',
          r.L3 || '',
          r.N || '',
          r.voltage || '380',
          r.pf || '0.85',
          r.sourceFileL1 || '',
          r.sourceFileL2 || '',
          r.sourceFileL3 || '',
          r.note || '',
        ]
        await conn.execute(
          `INSERT INTO th_pre_install_batch_records (${recordColumns.join(', ')})
           VALUES (${recordColumns.map(() => '?').join(', ')})`,
          recordValues
        )
      }
    }
    await conn.commit()
    return NextResponse.json({ success: true })
  } catch (e: any) {
    await conn.rollback()
    console.error('pre-install-batches save error:', e)
    return NextResponse.json(
      { success: false, error: e?.message || 'Failed to save pre-install batches' },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}

// DELETE - delete a batch by batchId
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const batchId = searchParams.get('batchId')
  if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 })
  try { await initTables() } catch { /* ignore init errors */ }
  const conn = await pool.getConnection()
  try {
    await conn.execute(
      `DELETE pr
       FROM th_pre_install_phase_file_records pr
       INNER JOIN th_pre_install_phase_file_uploads pu ON pu.id = pr.upload_id
       WHERE pu.batchId = ?`,
      [batchId]
    )
    await conn.execute(`DELETE FROM th_pre_install_phase_file_uploads WHERE batchId = ?`, [batchId])
    await conn.execute(`DELETE FROM th_pre_install_phase_records WHERE batchId = ?`, [batchId]).catch(() => {})
    await conn.execute(`DELETE FROM th_pre_install_batch_records WHERE batchId = ?`, [batchId])
    await conn.execute(`DELETE FROM th_pre_install_batches WHERE batchId = ?`, [batchId])
    return NextResponse.json({ success: true })
  } finally {
    conn.release()
  }
}
