import type { RowDataPacket } from 'mysql2'
import { pool } from '@/lib/mysql'

type ActivitySource = {
  type: string
  table: string
  idColumn: string
  sourceLimit?: number
  timeColumns?: string[]
  buildTitle: (columns: Set<string>) => string
}

type ActivityRow = RowDataPacket & {
  type: string
  title: string | null
  ts: string | null
  ref_id: number | string | null
}

export type ActivityFeedItem = {
  type: string
  title: string
  ts: string | null
  ref_id: number | string | null
}

const DEFAULT_SOURCE_LIMIT = 8
const LEGACY_ACTIVITY_SQL = `
  (SELECT 'order' AS type, orderNo AS title, created_at AS ts, orderID AS ref_id FROM purchase_orders ORDER BY created_at DESC LIMIT 5)
  UNION ALL
  (SELECT 'customer' AS type, fullname AS title, created_at AS ts, cusID AS ref_id FROM cus_detail ORDER BY created_at DESC LIMIT 5)
  UNION ALL
  (SELECT 'invoice' AS type, invNo AS title, created_at AS ts, invID AS ref_id FROM invoices ORDER BY created_at DESC LIMIT 5)
  UNION ALL
  (SELECT 'quotation' AS type, quoteNo AS title, created_at AS ts, quoteID AS ref_id FROM quotations ORDER BY created_at DESC LIMIT 5)
  UNION ALL
  (SELECT 'receipt' AS type, receiptNo AS title, created_at AS ts, receiptID AS ref_id FROM receipts ORDER BY created_at DESC LIMIT 5)
  UNION ALL
  (SELECT 'contract' AS type, contractNo AS title, created_at AS ts, contractID AS ref_id FROM contracts ORDER BY created_at DESC LIMIT 5)
  UNION ALL
  (SELECT 'sales' AS type, orderNo AS title, created_at AS ts, orderID AS ref_id FROM sales_orders ORDER BY created_at DESC LIMIT 5)
  UNION ALL
  (SELECT 'followup' AS type, CONCAT('Follow-up #', followUpID) AS title, created_at AS ts, followUpID AS ref_id FROM follow_ups ORDER BY created_at DESC LIMIT 5)
  ORDER BY ts DESC
  LIMIT ?
`

const wrapId = (identifier: string) => `\`${identifier.replace(/`/g, '``')}\``
const sqlText = (value: string) => `'${value.replace(/'/g, "''")}'`

function firstExisting(columns: Set<string>, candidates: string[]) {
  return candidates.find((column) => columns.has(column)) || null
}

function concatColumns(columns: Set<string>, candidates: string[], separator: string) {
  const existing = candidates.filter((column) => columns.has(column))
  if (existing.length === 0) return null
  if (existing.length === 1) return `COALESCE(${wrapId(existing[0])}, '')`
  return `CONCAT_WS(${sqlText(separator)}, ${existing.map((column) => wrapId(column)).join(', ')})`
}

function buildTimestampExpression(columns: Set<string>, timeColumns: string[]) {
  const updatedColumn = timeColumns.find((column) => column === 'updated_at' && columns.has(column))
  const createdColumn = timeColumns.find((column) => column === 'created_at' && columns.has(column))

  if (updatedColumn && createdColumn) {
    return `GREATEST(COALESCE(${wrapId(updatedColumn)}, ${wrapId(createdColumn)}), ${wrapId(createdColumn)})`
  }

  const firstColumn = firstExisting(columns, timeColumns)
  return firstColumn ? wrapId(firstColumn) : null
}

const ACTIVITY_SOURCES: ActivitySource[] = [
  {
    type: 'order',
    table: 'purchase_orders',
    idColumn: 'orderID',
    buildTitle: (columns) => {
      const titleColumn = firstExisting(columns, ['orderNo'])
      return titleColumn ? `COALESCE(${wrapId(titleColumn)}, CONCAT('PO #', ${wrapId('orderID')}))` : `CONCAT('PO #', ${wrapId('orderID')})`
    },
  },
  {
    type: 'customer',
    table: 'cus_detail',
    idColumn: 'cusID',
    buildTitle: (columns) => {
      const titleColumn = firstExisting(columns, ['fullname', 'company', 'email'])
      return titleColumn ? `COALESCE(${wrapId(titleColumn)}, CONCAT('Customer #', ${wrapId('cusID')}))` : `CONCAT('Customer #', ${wrapId('cusID')})`
    },
  },
  {
    type: 'supplier',
    table: 'suppliers',
    idColumn: 'supplier_id',
    buildTitle: (columns) => {
      const combined = concatColumns(columns, ['company', 'name'], ' / ')
      return combined || `CONCAT('Supplier #', ${wrapId('supplier_id')})`
    },
  },
  {
    type: 'product',
    table: 'product_list',
    idColumn: 'productID',
    buildTitle: (columns) => {
      const combined = concatColumns(columns, ['name', 'sku'], ' / ')
      return combined || `CONCAT('Product #', ${wrapId('productID')})`
    },
  },
  {
    type: 'invoice',
    table: 'invoices',
    idColumn: 'invID',
    buildTitle: (columns) => {
      const titleColumn = firstExisting(columns, ['invNo'])
      return titleColumn ? `COALESCE(${wrapId(titleColumn)}, CONCAT('Invoice #', ${wrapId('invID')}))` : `CONCAT('Invoice #', ${wrapId('invID')})`
    },
  },
  {
    type: 'quotation',
    table: 'quotations',
    idColumn: 'quoteID',
    buildTitle: (columns) => {
      const titleColumn = firstExisting(columns, ['quoteNo'])
      return titleColumn ? `COALESCE(${wrapId(titleColumn)}, CONCAT('Quote #', ${wrapId('quoteID')}))` : `CONCAT('Quote #', ${wrapId('quoteID')})`
    },
  },
  {
    type: 'receipt',
    table: 'receipts',
    idColumn: 'receiptID',
    buildTitle: (columns) => {
      const titleColumn = firstExisting(columns, ['receiptNo'])
      return titleColumn ? `COALESCE(${wrapId(titleColumn)}, CONCAT('Receipt #', ${wrapId('receiptID')}))` : `CONCAT('Receipt #', ${wrapId('receiptID')})`
    },
  },
  {
    type: 'contract',
    table: 'contracts',
    idColumn: 'contractID',
    buildTitle: (columns) => {
      const titleColumn = firstExisting(columns, ['contractNo'])
      return titleColumn ? `COALESCE(${wrapId(titleColumn)}, CONCAT('Contract #', ${wrapId('contractID')}))` : `CONCAT('Contract #', ${wrapId('contractID')})`
    },
  },
  {
    type: 'sales',
    table: 'sales_orders',
    idColumn: 'orderID',
    buildTitle: (columns) => {
      const titleColumn = firstExisting(columns, ['orderNo'])
      return titleColumn ? `COALESCE(${wrapId(titleColumn)}, CONCAT('SO #', ${wrapId('orderID')}))` : `CONCAT('SO #', ${wrapId('orderID')})`
    },
  },
  {
    type: 'followup',
    table: 'follow_ups',
    idColumn: 'followUpID',
    buildTitle: (columns) => {
      const combined = concatColumns(columns, ['customerName', 'status'], ' / ')
      return combined || `CONCAT('Follow-up #', ${wrapId('followUpID')})`
    },
  },
  {
    type: 'tracking',
    table: 'korea_order_tracking',
    idColumn: 'trackID',
    buildTitle: (columns) => {
      const combined = concatColumns(columns, ['trackNo', 'orderNo', 'supplierName'], ' / ')
      return combined || `CONCAT('Tracking #', ${wrapId('trackID')})`
    },
  },
  {
    type: 'tax_invoice',
    table: 'tax_invoices',
    idColumn: 'taxID',
    buildTitle: (columns) => {
      const titleColumn = firstExisting(columns, ['taxNo'])
      return titleColumn ? `COALESCE(${wrapId(titleColumn)}, CONCAT('Tax #', ${wrapId('taxID')}))` : `CONCAT('Tax #', ${wrapId('taxID')})`
    },
  },
  {
    type: 'testing',
    table: 'customer_testing',
    idColumn: 'testID',
    buildTitle: (columns) => {
      const combined = concatColumns(columns, ['testNo', 'customerName'], ' / ')
      return combined || `CONCAT('Testing #', ${wrapId('testID')})`
    },
  },
  {
    type: 'customer',
    table: 'customer_status_tracking',
    idColumn: 'trackingID',
    buildTitle: (columns) => {
      const combined = concatColumns(columns, ['customerName', 'currentStatus'], ' / ')
      return combined || `CONCAT('Status #', ${wrapId('trackingID')})`
    },
    timeColumns: ['updated_at', 'created_at', 'statusDate'],
  },
  {
    type: 'followup',
    table: 'customer_activities',
    idColumn: 'activityID',
    buildTitle: (columns) => {
      const combined = concatColumns(columns, ['customerName', 'activityType'], ' / ')
      return combined || `CONCAT('Activity #', ${wrapId('activityID')})`
    },
    timeColumns: ['updated_at', 'created_at', 'activityDate'],
  },
]

async function getTableColumns() {
  const tableNames = ACTIVITY_SOURCES.map((source) => source.table)
  const placeholders = tableNames.map(() => '?').join(', ')
  const [rows] = await pool.query<RowDataPacket[]>(
    `
      SELECT TABLE_NAME, COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN (${placeholders})
    `,
    tableNames
  )

  const tableColumns = new Map<string, Set<string>>()
  for (const row of rows) {
    const tableName = String(row.TABLE_NAME || '')
    const columnName = String(row.COLUMN_NAME || '')
    if (!tableName || !columnName) continue
    if (!tableColumns.has(tableName)) tableColumns.set(tableName, new Set<string>())
    tableColumns.get(tableName)?.add(columnName)
  }
  return tableColumns
}

function buildActivityUnion(tableColumns: Map<string, Set<string>>, totalLimit: number) {
  const parts = ACTIVITY_SOURCES.flatMap((source) => {
    const columns = tableColumns.get(source.table)
    if (!columns || !columns.has(source.idColumn)) return []

    const timestampExpr = buildTimestampExpression(columns, source.timeColumns || ['updated_at', 'created_at'])
    if (!timestampExpr) return []

    const titleExpr = source.buildTitle(columns)
    const sourceLimit = source.sourceLimit || DEFAULT_SOURCE_LIMIT

    return [
      `(
        SELECT
          ${sqlText(source.type)} AS type,
          NULLIF(TRIM(${titleExpr}), '') AS title,
          ${timestampExpr} AS ts,
          ${wrapId(source.idColumn)} AS ref_id
        FROM ${wrapId(source.table)}
        WHERE ${timestampExpr} IS NOT NULL
        ORDER BY ${timestampExpr} DESC
        LIMIT ${sourceLimit}
      )`
    ]
  })

  if (parts.length === 0) {
    return `SELECT '' AS type, '' AS title, NULL AS ts, NULL AS ref_id LIMIT 0`
  }

  return `
    ${parts.join('\nUNION ALL\n')}
    ORDER BY ts DESC
    LIMIT ${Number.isFinite(totalLimit) ? Math.max(1, totalLimit) : 24}
  `
}

export async function fetchActivityFeed(limit = 24): Promise<ActivityFeedItem[]> {
  try {
    const tableColumns = await getTableColumns()
    const sql = buildActivityUnion(tableColumns, limit)
    const [rows] = await pool.query<ActivityRow[]>(sql)

    return rows.map((row) => ({
      type: row.type || 'other',
      title: row.title || '-',
      ts: row.ts,
      ref_id: row.ref_id ?? null,
    }))
  } catch (error) {
    console.error('Dynamic activity feed failed, falling back to legacy query:', error)
    const [rows] = await pool.query<ActivityRow[]>(LEGACY_ACTIVITY_SQL, [Math.max(1, limit)])
    return rows.map((row) => ({
      type: row.type || 'other',
      title: row.title || '-',
      ts: row.ts,
      ref_id: row.ref_id ?? null,
    }))
  }
}
