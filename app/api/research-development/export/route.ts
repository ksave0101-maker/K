import { NextResponse, NextRequest } from 'next/server'
import { queryUser, getUserById } from '@/lib/mysql-user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function toCSV(rows: any[]): string {
  if (!rows || rows.length === 0) return ''
  const keys = Object.keys(rows[0])
  const lines = [keys.join(',')]
  for (const r of rows) {
    const vals = keys.map(k => {
      let v = r[k]
      if (v === null || v === undefined) return '""'
      if (typeof v === 'object') v = JSON.stringify(v)
      const s = String(v).replace(/"/g, '""')
      return `"${s}"`
    })
    lines.push(vals.join(','))
  }
  return lines.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { dataset, sql, format } = body || {}

    if (!dataset) {
      return NextResponse.json({ error: 'Missing dataset' }, { status: 400 })
    }

    const authToken = body.token || (req.headers.get('authorization') || '').replace(/^Bearer\s*/i, '')
    const authUserId = body.userId || null
    if (!authToken || !authUserId) {
      return NextResponse.json({ error: 'Unauthorized - login required' }, { status: 401 })
    }

    const verified = await getUserById(Number(authUserId)).catch(() => null)
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized - invalid user' }, { status: 401 })
    }

    let q = ''
    if (dataset === 'user_list') {
      q = 'SELECT userId, userName, name, email, site, typeID FROM user_list LIMIT 10000'
    } else if (dataset === 'power_records') {
      q = 'SELECT id, device_id, record_time, metrics_kWh, metrics_P, metrics_S FROM power_records ORDER BY record_time DESC LIMIT 20000'
    } else if (dataset === 'support_tickets') {
      q = 'SELECT id, title, status, created_at, updated_at, created_by FROM support_tickets LIMIT 10000'
    } else if (dataset === 'custom') {
      if (!sql || typeof sql !== 'string') return NextResponse.json({ error: 'Missing SQL for custom dataset' }, { status: 400 })
      const cleaned = sql.trim().toLowerCase()
      if (!cleaned.startsWith('select')) return NextResponse.json({ error: 'Only SELECT queries allowed' }, { status: 400 })
      q = sql
    } else {
      return NextResponse.json({ error: 'Unknown dataset' }, { status: 400 })
    }

    const rows = await queryUser(q)

    if (format === 'json') {
      return NextResponse.json(rows, { status: 200 })
    }

    const csv = toCSV(rows as any[])
    const filename = `export_${dataset}_${Date.now()}.csv`
    const headers = new Headers()
    headers.set('Content-Type', 'text/csv; charset=utf-8')
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)

    return new NextResponse(csv, { status: 200, headers })
  } catch (err: any) {
    console.error('Export error:', err.message || err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
