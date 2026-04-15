import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // kpis | issues | goals | bills
    const branch = searchParams.get('branch')
    const period = searchParams.get('period')

    if (type === 'kpis' || !type) {
      let sql = 'SELECT * FROM exec_branch_kpis WHERE 1=1'
      const params: any[] = []
      if (branch) { sql += ' AND branch = ?'; params.push(branch) }
      if (period) { sql += ' AND period = ?'; params.push(period) }
      sql += ' ORDER BY period DESC, branch ASC LIMIT 100'
      const kpis = await query(sql, params)

      if (type === 'kpis') return NextResponse.json(kpis)

      const issues = await query('SELECT * FROM exec_issues ORDER BY severity = "high" DESC, created_at DESC LIMIT 50')
      const goals = await query('SELECT * FROM exec_goals ORDER BY deadline ASC LIMIT 50')
      const bills = await query('SELECT * FROM exec_pending_bills WHERE approvalStatus = "pending" ORDER BY priority = "urgent" DESC LIMIT 50')

      return NextResponse.json({ kpis, issues, goals, bills })
    }

    if (type === 'issues') {
      const rows = await query('SELECT * FROM exec_issues ORDER BY created_at DESC LIMIT 100')
      return NextResponse.json(rows)
    }
    if (type === 'goals') {
      const rows = await query('SELECT * FROM exec_goals ORDER BY deadline ASC LIMIT 100')
      return NextResponse.json(rows)
    }
    if (type === 'bills') {
      const rows = await query('SELECT * FROM exec_pending_bills ORDER BY submittedDate DESC LIMIT 100')
      return NextResponse.json(rows)
    }

    return NextResponse.json({ error: 'invalid type' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, ...data } = body

    if (type === 'kpi') {
      await query(
        `INSERT INTO exec_branch_kpis (branch, period, revenue, profit, expenses, employees, performance)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE revenue=VALUES(revenue), profit=VALUES(profit), expenses=VALUES(expenses), employees=VALUES(employees), performance=VALUES(performance)`,
        [data.branch, data.period, data.revenue || 0, data.profit || 0, data.expenses || 0, data.employees || 0, data.performance || 0]
      )
      return NextResponse.json({ success: true })
    }
    if (type === 'issue') {
      const result = await query(
        'INSERT INTO exec_issues (branch, department, severity, title) VALUES (?, ?, ?, ?)',
        [data.branch, data.department, data.severity || 'medium', data.title]
      )
      return NextResponse.json({ success: true, id: (result as any)[0]?.insertId })
    }
    if (type === 'goal') {
      const result = await query(
        'INSERT INTO exec_goals (branch, department, title, progress, deadline, status) VALUES (?, ?, ?, ?, ?, ?)',
        [data.branch, data.department, data.title, data.progress || 0, data.deadline || null, data.status || 'on-track']
      )
      return NextResponse.json({ success: true, id: (result as any)[0]?.insertId })
    }
    if (type === 'bill') {
      const result = await query(
        'INSERT INTO exec_pending_bills (branch, department, description, amount, submittedDate, priority, category, requestedBy, reason, approvalStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.branch, data.department, data.description, data.amount || 0, data.submittedDate || new Date().toISOString().split('T')[0], data.priority || 'normal', data.category, data.requestedBy, data.reason || null, 'pending']
      )
      return NextResponse.json({ success: true, id: (result as any)[0]?.insertId })
    }

    return NextResponse.json({ error: 'invalid type' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, id, ...data } = body

    if (type === 'goal') {
      await query(
        'UPDATE exec_goals SET progress=?, status=? WHERE id=?',
        [data.progress, data.status, id]
      )
      return NextResponse.json({ success: true })
    }
    if (type === 'bill') {
      await query(
        'UPDATE exec_pending_bills SET approvalStatus=? WHERE id=?',
        [data.approvalStatus, id]
      )
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'invalid type' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')
    if (!id || !type) return NextResponse.json({ error: 'type and id required' }, { status: 400 })

    const tableMap: Record<string, string> = { kpi: 'exec_branch_kpis', issue: 'exec_issues', goal: 'exec_goals', bill: 'exec_pending_bills' }
    const table = tableMap[type]
    if (!table) return NextResponse.json({ error: 'invalid type' }, { status: 400 })

    await query(`DELETE FROM ${table} WHERE id = ?`, [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
