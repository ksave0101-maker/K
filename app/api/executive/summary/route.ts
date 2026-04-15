import { NextResponse } from 'next/server'
import { pool, query } from '@/lib/mysql'

type BranchKey = 'korea' | 'thailand' | 'vietnam' | 'malaysia' | 'brunei'

const BRANCHES: BranchKey[] = ['korea', 'thailand', 'vietnam', 'malaysia', 'brunei']

// Keywords used to detect branch from text fields (legacy records without branch column)
const BRANCH_KEYWORDS: Record<BranchKey, string[]> = {
  korea:    ['korea', 'korean', '한국', '대한민국', '코리아', 'kr'],
  thailand: ['thailand', 'thai', 'ไทย', 'ประเทศไทย', 'th'],
  vietnam:  ['vietnam', 'vietnamese', 'เวียดนาม', 'vn'],
  malaysia: ['malaysia', 'malay', 'มาเล', 'มาเลเซีย', 'my'],
  brunei:   ['brunei', 'บรูไน', 'bn'],
}

// PDO: Korea uses kr_production_orders; others use branch-specific tables
const PDO_BRANCH_TABLE: Record<BranchKey, string | null> = {
  korea:    null, // queries kr_production_orders
  thailand: 'production_orders',
  vietnam:  'production_orders_vietnam',
  malaysia: 'production_orders_malaysia',
  brunei:   'production_orders_brunei',
}
const PDO_KOREA_BRANCH_NAME = 'Korea'

async function countLeaveByBranch(branch: BranchKey): Promise<number> {
  try {
    const keywords = BRANCH_KEYWORDS[branch]
    // 1) Try direct branch column first
    const [directRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM vacation_leave_requests WHERE status = 'pending' AND LOWER(COALESCE(branch,'')) = ?`,
      [branch]
    ) as any[]
    const direct = Number((directRows as any[])[0]?.cnt ?? 0)
    if (direct > 0) return direct

    // 2) Fallback: text-field keyword search (legacy records with NULL branch)
    const likeClauses = keywords
      .map(() => `(department LIKE ? OR reason LIKE ? OR notes LIKE ? OR approver LIKE ? OR employeeId LIKE ?)`)
      .join(' OR ')
    const likeParams: string[] = []
    keywords.forEach(k => { const v = `%${k}%`; likeParams.push(v, v, v, v, v) })

    const [fallbackRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM vacation_leave_requests WHERE status = 'pending' AND LOWER(COALESCE(branch,'')) != ? AND (${likeClauses})`,
      [branch, ...likeParams]
    ) as any[]
    return Number((fallbackRows as any[])[0]?.cnt ?? 0)
  } catch { return 0 }
}

async function countPurchaseByBranch(branch: BranchKey): Promise<number> {
  try {
    const keywords = BRANCH_KEYWORDS[branch]
    // 1) Direct branch column
    const [directRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM purchase_requests WHERE status IN ('pending','submitted','draft') AND LOWER(COALESCE(branch,'')) = ?`,
      [branch]
    ) as any[]
    const direct = Number((directRows as any[])[0]?.cnt ?? 0)
    if (direct > 0) return direct

    // 2) Text-field fallback
    const likeClauses = keywords
      .map(() => `(department LIKE ? OR purpose LIKE ? OR notes LIKE ? OR requested_by LIKE ? OR requester_name LIKE ? OR prNo LIKE ?)`)
      .join(' OR ')
    const likeParams: string[] = []
    keywords.forEach(k => { const v = `%${k}%`; likeParams.push(v, v, v, v, v, v) })

    const [fallbackRows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM purchase_requests WHERE status IN ('pending','submitted','draft') AND LOWER(COALESCE(branch,'')) != ? AND (${likeClauses})`,
      [branch, ...likeParams]
    ) as any[]
    return Number((fallbackRows as any[])[0]?.cnt ?? 0)
  } catch { return 0 }
}

async function tableExists(tableName: string): Promise<boolean> {
  try {
    const rows = await query(
      `SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName]
    ) as Array<{ total?: number }>
    return Number(rows?.[0]?.total ?? 0) > 0
  } catch { return false }
}

async function countPdoByBranch(branch: BranchKey): Promise<number> {
  try {
    if (branch === 'korea') {
      const rows = await query(
        `SELECT COUNT(*) AS cnt FROM kr_production_orders WHERE branch = ?`,
        [PDO_KOREA_BRANCH_NAME]
      ) as Array<{ cnt: number }>
      return Number(rows?.[0]?.cnt ?? 0)
    }
    const tableName = PDO_BRANCH_TABLE[branch]
    if (!tableName) return 0
    const exists = await tableExists(tableName)
    if (!exists) return 0
    const rows = await query(`SELECT COUNT(*) AS cnt FROM \`${tableName}\``) as Array<{ cnt: number }>
    return Number(rows?.[0]?.cnt ?? 0)
  } catch { return 0 }
}

export async function GET() {
  try {
    const [leaveResults, purchaseResults, pdoResults] = await Promise.all([
      Promise.allSettled(BRANCHES.map(b => countLeaveByBranch(b).then(count => ({ branch: b, count })))),
      Promise.allSettled(BRANCHES.map(b => countPurchaseByBranch(b).then(count => ({ branch: b, count })))),
      Promise.allSettled(BRANCHES.map(b => countPdoByBranch(b).then(count => ({ branch: b, count })))),
    ])

    const init = (): Record<BranchKey, number> => ({ korea: 0, thailand: 0, vietnam: 0, malaysia: 0, brunei: 0 })
    const toRecord = (results: PromiseSettledResult<{ branch: BranchKey; count: number }>[]) => {
      const out = init()
      results.forEach(r => { if (r.status === 'fulfilled') out[r.value.branch] = r.value.count })
      return out
    }

    return NextResponse.json({
      success: true,
      leave:    toRecord(leaveResults),
      purchase: toRecord(purchaseResults),
      pdo:      toRecord(pdoResults),
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
