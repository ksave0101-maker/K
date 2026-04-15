import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

// Returns only userName + displayName — never passwords or sensitive fields
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const site = searchParams.get('site')

    // Check if hr_employees table exists — fallback to simple query if not
    let hasHrTable = false
    try {
      const [check]: any = await pool.query(
        `SELECT COUNT(*) AS n FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name = 'hr_employees'`
      )
      hasHrTable = Number(check?.[0]?.n) > 0
    } catch { hasHrTable = false }

    let query: string
    if (hasHrTable) {
      query = `
        SELECT
          u.userName,
          TRIM(u.name)  AS name,
          u.typeID,
          TRIM(u.site)  AS site,
          e.firstNameTh,
          e.lastNameTh,
          TRIM(u.name)  AS displayName,
          COALESCE(
            NULLIF(TRIM(CONCAT(COALESCE(e.firstNameTh,''), ' ', COALESCE(e.lastNameTh,''))), ''),
            TRIM(u.name)
          ) AS displayNameTh
        FROM user_list u
        LEFT JOIN hr_employees e
          ON e.username COLLATE utf8mb4_general_ci = TRIM(u.userName)
        WHERE TRIM(u.userName) != ''`
    } else {
      query = `
        SELECT
          u.userName,
          TRIM(u.name)  AS name,
          u.typeID,
          TRIM(u.site)  AS site,
          NULL AS firstNameTh,
          NULL AS lastNameTh,
          TRIM(u.name)  AS displayName,
          TRIM(u.name)  AS displayNameTh
        FROM user_list u
        WHERE TRIM(u.userName) != ''`
    }

    const params: any[] = []

    if (site) {
      query += ' AND (TRIM(u.site) = ? OR u.typeID IN (1,2,7))'
      params.push(site)
    }

    // Exclude system/admin accounts from picker
    query += " AND TRIM(u.userName) NOT IN ('pavinee', 'executive', 'K_user')"
    query += ' ORDER BY displayName ASC'

    const [rows]: any = await pool.query(query, params)
    return NextResponse.json({ success: true, users: rows })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
