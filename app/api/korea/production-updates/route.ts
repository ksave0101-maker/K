import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS kr_production_updates (
      id VARCHAR(64) NOT NULL,
      orderNumber VARCHAR(64) NOT NULL,
      productName VARCHAR(255) NULL,
      branch VARCHAR(64) NOT NULL,
      branchCode VARCHAR(8) NOT NULL,
      totalQuantity DECIMAL(18,2) NOT NULL DEFAULT 0,
      completedQuantity DECIMAL(18,2) NOT NULL DEFAULT 0,
      progressPercent DECIMAL(6,2) NOT NULL DEFAULT 0,
      currentStage VARCHAR(32) NOT NULL DEFAULT 'assembly',
      assignedTeam VARCHAR(255) NULL,
      startDate DATE NULL,
      estimatedCompletion DATE NULL,
      lastUpdate DATE NULL,
      notes TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
}

export async function GET() {
  try {
    await ensureTable()
    const rows = await query('SELECT * FROM kr_production_updates ORDER BY created_at DESC')
    return NextResponse.json(rows)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const { id, orderNumber, productName, branch, branchCode, totalQuantity, completedQuantity, progressPercent, currentStage, assignedTeam, startDate, estimatedCompletion, lastUpdate, notes } = body
    if (!id || !orderNumber) {
      return NextResponse.json({ error: 'id and orderNumber are required' }, { status: 400 })
    }
    await query(
      `INSERT INTO kr_production_updates (id,orderNumber,productName,branch,branchCode,totalQuantity,completedQuantity,progressPercent,currentStage,assignedTeam,startDate,estimatedCompletion,lastUpdate,notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         orderNumber = VALUES(orderNumber),
         productName = VALUES(productName),
         branch = VALUES(branch),
         branchCode = VALUES(branchCode),
         totalQuantity = VALUES(totalQuantity),
         completedQuantity = VALUES(completedQuantity),
         progressPercent = VALUES(progressPercent),
         currentStage = VALUES(currentStage),
         assignedTeam = VALUES(assignedTeam),
         startDate = VALUES(startDate),
         estimatedCompletion = VALUES(estimatedCompletion),
         lastUpdate = VALUES(lastUpdate),
         notes = VALUES(notes)`,
      [id, orderNumber, productName, branch ?? 'Korea', branchCode ?? 'KR', totalQuantity ?? 0, completedQuantity ?? 0, progressPercent ?? 0, currentStage ?? 'assembly', assignedTeam, startDate || null, estimatedCompletion || null, lastUpdate || null, notes ?? null]
    )
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureTable()
    const body = await req.json()
    const { id, orderNumber, productName, branch, branchCode, totalQuantity, completedQuantity, progressPercent, currentStage, assignedTeam, startDate, estimatedCompletion, lastUpdate, notes } = body
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const existingRows = await query('SELECT * FROM kr_production_updates WHERE id = ? LIMIT 1', [id]) as Array<Record<string, unknown>>
    const existing = existingRows[0] || {}

    await query(
      `INSERT INTO kr_production_updates (id,orderNumber,productName,branch,branchCode,totalQuantity,completedQuantity,progressPercent,currentStage,assignedTeam,startDate,estimatedCompletion,lastUpdate,notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         orderNumber = VALUES(orderNumber),
         productName = VALUES(productName),
         branch = VALUES(branch),
         branchCode = VALUES(branchCode),
         totalQuantity = VALUES(totalQuantity),
         completedQuantity = VALUES(completedQuantity),
         progressPercent = VALUES(progressPercent),
         currentStage = VALUES(currentStage),
         assignedTeam = VALUES(assignedTeam),
         startDate = VALUES(startDate),
         estimatedCompletion = VALUES(estimatedCompletion),
         lastUpdate = VALUES(lastUpdate),
         notes = VALUES(notes)`,
      [
        id,
        orderNumber || existing.orderNumber || id,
        productName || existing.productName || null,
        branch || existing.branch || 'Korea',
        branchCode || existing.branchCode || 'KR',
        totalQuantity ?? existing.totalQuantity ?? 0,
        completedQuantity ?? existing.completedQuantity ?? 0,
        progressPercent ?? existing.progressPercent ?? 0,
        currentStage || existing.currentStage || 'assembly',
        assignedTeam || existing.assignedTeam || null,
        startDate || existing.startDate || null,
        estimatedCompletion || existing.estimatedCompletion || null,
        lastUpdate || existing.lastUpdate || null,
        notes ?? existing.notes ?? null
      ]
    )
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
