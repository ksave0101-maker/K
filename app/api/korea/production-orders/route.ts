import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

const BRANCH_TABLE_MAP: Record<string, string> = {
  vietnam: 'production_orders_vietnam',
  thailand: 'production_orders',
  brunei: 'production_orders_brunei',
  malaysia: 'production_orders_malaysia',
}

const BRANCH_NAME_MAP: Record<string, string> = {
  vietnam: 'Vietnam',
  thailand: 'Thailand',
  brunei: 'Brunei',
  malaysia: 'Malaysia',
}

async function tableExists(tableName: string) {
  const rows = await query(
    `SELECT COUNT(*) AS total
       FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?`,
    [tableName]
  ) as Array<{ total?: number }>

  return Number(rows?.[0]?.total || 0) > 0
}

function getBranchTable(branchKey?: string | null) {
  if (!branchKey) return null
  return BRANCH_TABLE_MAP[String(branchKey).toLowerCase()] || null
}

async function getTableColumns(tableName: string) {
  const rows = await query(`SHOW COLUMNS FROM \`${tableName}\``) as Array<{ Field?: string }>
  return new Set((rows || []).map((r) => String(r.Field || '')))
}

async function getTableColumnsMeta(tableName: string) {
  return await query(`SHOW COLUMNS FROM \`${tableName}\``) as Array<{ Field?: string; Type?: string }>
}

function pickColumn(columns: Set<string>, candidates: string[]) {
  return candidates.find((column) => columns.has(column)) || null
}

function pickStatusValue(
  requestedStatus: string,
  statusType: string | undefined
) {
  const normalizedRequested = String(requestedStatus || '').toLowerCase().trim()
  if (!statusType || !statusType.toLowerCase().startsWith('enum(')) {
    return requestedStatus
  }

  const matches = Array.from(statusType.matchAll(/'([^']+)'/g)).map((m) => m[1])
  if (matches.length === 0) return requestedStatus
  if (matches.includes(normalizedRequested)) return normalizedRequested

  if (normalizedRequested === 'approved') {
    const fallbacks = ['completed', 'done', 'in_progress', 'processing', 'confirmed', 'pending']
    const found = fallbacks.find((item) => matches.includes(item))
    if (found) return found
  }

  return matches[0]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const branch = searchParams.get('branch')
    const branchKey = searchParams.get('branchKey')
    const search = searchParams.get('search')
    const branchTable = getBranchTable(branchKey)
    const hasBranchTable = branchTable ? await tableExists(branchTable) : false

    if (id && hasBranchTable && branchTable) {
      const columns = await getTableColumns(branchTable)
      const idCol = pickColumn(columns, ['pdoID', 'poID', 'id']) || 'id'
      const rows = await query(`SELECT * FROM \`${branchTable}\` WHERE \`${idCol}\` = ?`, [id])
      if (!rows[0]) return NextResponse.json(null)
      const materialsFkCol = columns.has('pdoID') ? 'pdoID' : 'poID'
      const items = await query(`SELECT * FROM production_order_materials WHERE \`${materialsFkCol}\` = ?`, [id])
      return NextResponse.json({ ...rows[0], items })
    }

    if (id) {
      const rows = await query('SELECT * FROM kr_production_orders WHERE id = ?', [id])
      if (!rows[0]) return NextResponse.json(null)
      const items = await query('SELECT * FROM kr_production_order_items WHERE orderId = ?', [id])
      return NextResponse.json({ ...rows[0], items })
    }

    if (hasBranchTable && branchTable) {
      const columns = await getTableColumns(branchTable)
      const idCol = pickColumn(columns, ['pdoID', 'poID', 'id']) || 'id'
      const orderNoCol = pickColumn(columns, ['orderNumber', 'pdoNo', 'poNo'])
      const productCol = pickColumn(columns, ['product', 'product_name'])
      const quantityCol = pickColumn(columns, ['quantity', 'quantity_ordered', 'target_qty', 'targetQty'])
      const customerCol = pickColumn(columns, ['customerName', 'customer_name'])
      const dueCol = pickColumn(columns, ['dueDate', 'due_date'])
      const orderDateCol = pickColumn(columns, ['orderDate', 'pdoDate', 'poDate', 'created_at'])
      const notesCol = pickColumn(columns, ['productionNote', 'notes'])
      const priorityCol = pickColumn(columns, ['priority'])
      const statusCol = pickColumn(columns, ['status'])

      let sql = `SELECT `
      sql += `\`${idCol}\` AS id`
      if (orderNoCol) sql += `, \`${orderNoCol}\` AS orderNumber`
      if (productCol) sql += `, \`${productCol}\` AS product`
      if (quantityCol) sql += `, \`${quantityCol}\` AS quantity`
      if (customerCol) sql += `, \`${customerCol}\` AS customerName`
      if (dueCol) sql += `, \`${dueCol}\` AS dueDate`
      if (orderDateCol) sql += `, \`${orderDateCol}\` AS orderDate`
      if (priorityCol) sql += `, \`${priorityCol}\` AS priority`
      if (statusCol) sql += `, \`${statusCol}\` AS status`
      if (notesCol) sql += `, \`${notesCol}\` AS notes`
      sql += ` FROM \`${branchTable}\` WHERE 1=1`

      const params: unknown[] = []
      if (status && statusCol) {
        sql += ` AND \`${statusCol}\` = ?`
        params.push(status)
      }
      if (search) {
        const searchCols = [orderNoCol, productCol, customerCol, notesCol].filter(Boolean) as string[]
        if (searchCols.length > 0) {
          sql += ` AND (${searchCols.map((col) => `\`${col}\` LIKE ?`).join(' OR ')})`
          const searchPattern = `%${search}%`
          for (let i = 0; i < searchCols.length; i++) params.push(searchPattern)
        }
      }
      if (dueCol) {
        sql += ` ORDER BY \`${dueCol}\` DESC, \`${idCol}\` DESC LIMIT 50`
      } else {
        sql += ` ORDER BY \`${idCol}\` DESC LIMIT 50`
      }
      const rows = await query(sql, params)
      return NextResponse.json(rows)
    }

    let sql = 'SELECT * FROM kr_production_orders WHERE 1=1'
    const params: unknown[] = []
    if (status) { sql += ' AND status = ?'; params.push(status) }
    if (branchKey && BRANCH_NAME_MAP[branchKey]) {
      sql += ' AND branch = ?'
      params.push(BRANCH_NAME_MAP[branchKey])
    } else if (branch) {
      sql += ' AND branch = ?'
      params.push(branch)
    }
    if (search) {
      sql += ' AND (orderNumber LIKE ? OR product LIKE ? OR customerName LIKE ?)'
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }
    sql += ' ORDER BY dueDate DESC LIMIT 50'

    const rows = await query(sql, params)
    return NextResponse.json(rows)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, orderNumber, branch, branchCode, product, quantity, status, dueDate, priority, customerName, orderDate, productionNote, items } = body

    await query(
      `INSERT INTO kr_production_orders (id, orderNumber, branch, branchCode, product, quantity, status, dueDate, priority, customerName, orderDate, productionNote)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, orderNumber, branch, branchCode, product, quantity || 0, status || 'pending', dueDate || null, priority || 'medium', customerName, orderDate || null, productionNote || null]
    )

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(
          'INSERT INTO kr_production_order_items (orderId, name, code, quantity, unit, description) VALUES (?, ?, ?, ?, ?, ?)',
          [id, item.name, item.code || null, item.quantity || 0, item.unit || 'pcs', item.description || null]
        )
      }
    }

    return NextResponse.json({ success: true, id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status, branchKey, approvedBy } = body
    const branchTable = getBranchTable(branchKey)

    if (branchTable && await tableExists(branchTable)) {
      const columnsMeta = await getTableColumnsMeta(branchTable)
      const columns = new Set(columnsMeta.map((row) => String(row.Field || '')))
      const idCol = pickColumn(columns, ['pdoID', 'poID', 'id']) || 'id'
      const statusCol = pickColumn(columns, ['status'])
      if (!statusCol) return NextResponse.json({ error: 'Status column not found' }, { status: 400 })
      const statusType = columnsMeta.find((row) => row.Field === statusCol)?.Type
      const finalStatus = pickStatusValue(status, statusType)
      const setClauses: string[] = [`\`${statusCol}\` = ?`]
      const params: unknown[] = [finalStatus]

      const approvedByCol = pickColumn(columns, ['approved_by', 'approvedBy'])
      if (approvedBy && approvedByCol) {
        setClauses.push(`\`${approvedByCol}\` = ?`)
        params.push(approvedBy)
      }

      const approvedAtCol = pickColumn(columns, ['approved_at', 'approvedAt'])
      if (status === 'approved' && approvedAtCol) {
        setClauses.push(`\`${approvedAtCol}\` = NOW()`)
      }

      if (approvedBy && !approvedByCol) {
        const notesCol = pickColumn(columns, ['notes', 'productionNote'])
        if (notesCol) {
          setClauses.push(`\`${notesCol}\` = CONCAT(COALESCE(\`${notesCol}\`, ''), ?)`)
          params.push(`\n[APPROVED_BY:${approvedBy}]`)
        }
      }

      params.push(id)
      await query(`UPDATE \`${branchTable}\` SET ${setClauses.join(', ')} WHERE \`${idCol}\` = ?`, params)
      return NextResponse.json({ success: true, status: finalStatus })
    }

    await query('UPDATE kr_production_orders SET status = ? WHERE id = ?', [status, id])
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
