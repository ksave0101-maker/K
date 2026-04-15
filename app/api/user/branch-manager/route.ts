import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

type UserRow = {
  userId?: number
  name?: string
  userName?: string
  site?: string
  typeID?: number
}

function normalizeBranch(branch: string) {
  const value = String(branch || '').toLowerCase().trim()
  if (value.includes('thailand')) return 'thailand'
  if (value.includes('vietnam')) return 'vietnam'
  if (value.includes('brunei')) return 'brunei'
  if (value.includes('malaysia')) return 'malaysia'
  return value
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const branchRaw = searchParams.get('branch') || 'thailand'
    const branch = normalizeBranch(branchRaw)

    // Prefer users with Branch-Manager role/name and matching site.
    let rows = await query(
      `SELECT userId, name, userName, site, typeID
         FROM user_list
        WHERE (
          typeID IN (6, 19)
          OR LOWER(TRIM(COALESCE(userName, ''))) = 'branch-manager'
          OR LOWER(TRIM(COALESCE(name, ''))) LIKE '%branch manager%'
        )
          AND LOWER(COALESCE(site, '')) LIKE ?
        ORDER BY userId ASC
        LIMIT 1`,
      [`%${branch}%`]
    ) as UserRow[]

    // Fallback to any Branch-Manager if site-specific not found.
    if (!rows.length) {
      rows = await query(
        `SELECT userId, name, userName, site, typeID
           FROM user_list
          WHERE typeID IN (6, 19)
             OR LOWER(TRIM(COALESCE(userName, ''))) = 'branch-manager'
             OR LOWER(TRIM(COALESCE(name, ''))) LIKE '%branch manager%'
          ORDER BY userId ASC
          LIMIT 1`
      ) as UserRow[]
    }

    const user = rows[0] || null
    const managerName = user?.name || user?.userName || null

    return NextResponse.json({
      success: true,
      managerName,
      user,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message, managerName: null }, { status: 500 })
  }
}

