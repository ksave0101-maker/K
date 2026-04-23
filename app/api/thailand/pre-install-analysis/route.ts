import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'

async function initTable() {
  const conn = await pool.getConnection()
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS th_pre_install_analysis (
        id VARCHAR(50) NOT NULL PRIMARY KEY,
        branch VARCHAR(100) DEFAULT '',
        location VARCHAR(500) DEFAULT '',
        equipment VARCHAR(255) DEFAULT '',
        datetime DATETIME DEFAULT NULL,
        measurementPeriod VARCHAR(100) DEFAULT '',
        technician VARCHAR(255) DEFAULT '',
        voltage VARCHAR(50) DEFAULT '380',
        frequency FLOAT DEFAULT 50,
        powerFactor FLOAT DEFAULT 0.85,
        thd FLOAT DEFAULT 0,
        current_L1 FLOAT DEFAULT 0,
        current_L2 FLOAT DEFAULT 0,
        current_L3 FLOAT DEFAULT 0,
        current_N FLOAT DEFAULT 0,
        balance VARCHAR(20) DEFAULT 'Good',
        result VARCHAR(50) DEFAULT 'Recommended',
        recommendation TEXT,
        notes TEXT,
        recommendedProduct VARCHAR(255) DEFAULT NULL,
        engineerName VARCHAR(255) DEFAULT '',
        engineerLicense VARCHAR(100) DEFAULT '',
        approvalStatus VARCHAR(20) DEFAULT 'Pending',
        approvalDate DATETIME DEFAULT NULL,
        approverName VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
  } finally {
    conn.release()
  }
}

export async function GET() {
  try { await initTable() } catch { /* table may already exist */ }
  const conn = await pool.getConnection()
  try {
    const [rows]: any = await conn.query(
      `SELECT * FROM th_pre_install_analysis ORDER BY created_at DESC`
    )
    return NextResponse.json({ success: true, analyses: rows })
  } finally {
    conn.release()
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const d = body as any
  const conn = await pool.getConnection()
  try {
    await conn.execute(
      `INSERT INTO th_pre_install_analysis
        (id, branch, location, equipment, datetime, measurementPeriod, technician,
         voltage, frequency, powerFactor, thd,
         current_L1, current_L2, current_L3, current_N,
         balance, result, recommendation, notes, recommendedProduct,
         engineerName, engineerLicense, approvalStatus, approvalDate, approverName)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         branch=VALUES(branch), location=VALUES(location), equipment=VALUES(equipment),
         datetime=VALUES(datetime), measurementPeriod=VALUES(measurementPeriod),
         technician=VALUES(technician), voltage=VALUES(voltage), frequency=VALUES(frequency),
         powerFactor=VALUES(powerFactor), thd=VALUES(thd),
         current_L1=VALUES(current_L1), current_L2=VALUES(current_L2),
         current_L3=VALUES(current_L3), current_N=VALUES(current_N),
         balance=VALUES(balance), result=VALUES(result),
         recommendation=VALUES(recommendation), notes=VALUES(notes),
         recommendedProduct=VALUES(recommendedProduct), engineerName=VALUES(engineerName),
         engineerLicense=VALUES(engineerLicense), approvalStatus=VALUES(approvalStatus),
         approvalDate=VALUES(approvalDate), approverName=VALUES(approverName)`,
      [
        d.id, d.branch, d.location, d.equipment,
        d.datetime || null, d.measurementPeriod, d.technician,
        d.voltage, d.frequency, d.powerFactor, d.thd,
        d.current?.L1 ?? 0, d.current?.L2 ?? 0, d.current?.L3 ?? 0, d.current?.N ?? 0,
        d.balance, d.result, d.recommendation, d.notes, d.recommendedProduct || null,
        d.engineerName, d.engineerLicense, d.approvalStatus || 'Pending',
        d.approvalDate || null, d.approverName,
      ]
    )
    return NextResponse.json({ success: true })
  } finally {
    conn.release()
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const conn = await pool.getConnection()
  try {
    await conn.execute(`DELETE FROM th_pre_install_analysis WHERE id = ?`, [id])
    return NextResponse.json({ success: true })
  } finally {
    conn.release()
  }
}
