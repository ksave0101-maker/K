import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

type CountRow = { total?: number }
const PENDING_STATUS_SQL = `LOWER(TRIM(COALESCE(status, ''))) IN ('pending', 'pending_approval', 'pending-approval', 'waiting_approval', 'waiting approval')`

const BRANCH_TABLES = [
  { key: 'vietnam', tableName: 'production_orders_vietnam', branchName: 'Vietnam' },
  { key: 'thailand', tableName: 'production_orders', branchName: 'Thailand' },
  { key: 'brunei', tableName: 'production_orders_brunei', branchName: 'Brunei' },
  { key: 'malaysia', tableName: 'production_orders_malaysia', branchName: 'Malaysia' },
] as const

async function tableExists(tableName: string) {
  const rows = await query(
    `SELECT COUNT(*) AS total
       FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?`,
    [tableName]
  ) as CountRow[]

  return Number(rows?.[0]?.total || 0) > 0
}

async function countPendingFromBranchTable(tableName: string) {
  const rows = await query(
    `SELECT COUNT(*) AS total
       FROM \`${tableName}\`
      WHERE ${PENDING_STATUS_SQL}`
  ) as CountRow[]

  return Number(rows?.[0]?.total || 0)
}

async function countAllFromBranchTable(tableName: string) {
  const rows = await query(
    `SELECT COUNT(*) AS total
       FROM \`${tableName}\``
  ) as CountRow[]

  return Number(rows?.[0]?.total || 0)
}

async function countPendingFromLegacyTable(branchName: string) {
  const branchLike = `%${String(branchName).toLowerCase()}%`
  const rows = await query(
    `SELECT COUNT(*) AS total
       FROM kr_production_orders
      WHERE LOWER(TRIM(COALESCE(branch, ''))) LIKE ?
        AND ${PENDING_STATUS_SQL}`,
    [branchLike]
  ) as CountRow[]

  return Number(rows?.[0]?.total || 0)
}

export async function GET() {
  try {
    const branches: Record<string, number> = {}

    const hasLegacyTable = await tableExists('kr_production_orders')

    for (const item of BRANCH_TABLES) {
      const hasBranchTable = await tableExists(item.tableName)

      if (hasBranchTable) {
        const branchTableRows = await countAllFromBranchTable(item.tableName)
        if (branchTableRows > 0) {
          branches[item.key] = await countPendingFromBranchTable(item.tableName)
        } else if (hasLegacyTable) {
          // Fallback to legacy table if branch table exists but is still empty
          branches[item.key] = await countPendingFromLegacyTable(item.branchName)
        } else {
          branches[item.key] = 0
        }
      } else if (hasLegacyTable) {
        branches[item.key] = await countPendingFromLegacyTable(item.branchName)
      } else {
        branches[item.key] = 0
      }
    }

    const totalPending = Object.values(branches).reduce((sum, value) => sum + value, 0)

    return NextResponse.json({
      success: true,
      branches,
      totalPending,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load production order alerts'
    return NextResponse.json({
      success: false,
      error: message,
      branches: {
        vietnam: 0,
        thailand: 0,
        brunei: 0,
        malaysia: 0,
      },
      totalPending: 0,
    }, { status: 500 })
  }
}
