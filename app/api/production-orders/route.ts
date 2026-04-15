import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'

type DbExecutor = Pick<PoolConnection, 'query'>

type ColumnRow = RowDataPacket & {
  Field: string
  Extra: string
  Null: string
  Default: string | null
}

type ProductionOrderSchema = {
  productionColumns: Set<string>
  materialColumns: Set<string>
  stepColumns: Set<string>
  autoIncrementCols: Set<string>
  pkCol: string
  noCol: string
  dateCol: string
  materialFkCol: string
  stepFkCol: string
}

async function getTableColumnsMeta(executor: DbExecutor, tableName: string): Promise<ColumnRow[]> {
  const [rows] = await executor.query(`SHOW COLUMNS FROM \`${tableName}\``)
  return rows as ColumnRow[]
}

async function getTableColumns(executor: DbExecutor, tableName: string): Promise<Set<string>> {
  const meta = await getTableColumnsMeta(executor, tableName)
  return new Set(meta.map((row) => row.Field))
}

async function getProductionOrderSchema(executor: DbExecutor): Promise<ProductionOrderSchema> {
  const productionMeta = await getTableColumnsMeta(executor, 'production_orders')
  const materialMeta = await getTableColumnsMeta(executor, 'production_order_materials')
  const stepMeta = await getTableColumnsMeta(executor, 'production_order_steps')

  const productionColumns = new Set(productionMeta.map(r => r.Field))
  const materialColumns = new Set(materialMeta.map(r => r.Field))
  const stepColumns = new Set(stepMeta.map(r => r.Field))
  const allMeta = [...productionMeta, ...materialMeta, ...stepMeta]
  const autoIncrementCols = new Set(allMeta.filter(r => r.Extra?.includes('auto_increment')).map(r => r.Field))

  const pkCandidates = ['pdoID', 'poID', 'itemID', 'id']
  const pkCol = pkCandidates.find(c => productionColumns.has(c)) || 'id'

  return {
    productionColumns,
    materialColumns,
    stepColumns,
    autoIncrementCols,
    pkCol,
    noCol: productionColumns.has('pdoNo') ? 'pdoNo' : 'poNo',
    dateCol: productionColumns.has('pdoDate') ? 'pdoDate' : 'poDate',
    materialFkCol: materialColumns.has('pdoID') ? 'pdoID' : materialColumns.has('poID') ? 'poID' : 'production_order_id',
    stepFkCol: stepColumns.has('pdoID') ? 'pdoID' : stepColumns.has('poID') ? 'poID' : 'production_order_id',
  }
}

function addCompatAliases(row: Record<string, unknown>, schema: ProductionOrderSchema) {
  const isMissingDocNo = (value: unknown) => value === null || value === undefined || String(value).trim() === ''
  const isMissingDate = (value: unknown) => value === null || value === undefined || String(value).trim() === ''
  const rawDocNo = row[schema.noCol]
  let resolvedDocNo = rawDocNo

  if (isMissingDocNo(resolvedDocNo)) {
    const rawDate = row[schema.dateCol] || row.created_at
    const rawId = row[schema.pkCol]
    const date = rawDate ? new Date(String(rawDate)) : new Date()
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const sequence = String(Number(rawId) || 1).padStart(5, '0')
    resolvedDocNo = `PDOTH${yyyy}${mm}${dd}-${sequence}`
    row[schema.noCol] = resolvedDocNo
  }

  const rawDateValue = row[schema.dateCol]
  let resolvedDate = rawDateValue
  if (isMissingDate(resolvedDate)) {
    if (row.created_at) {
      resolvedDate = row.created_at
    } else if (!isMissingDocNo(resolvedDocNo)) {
      const m = String(resolvedDocNo).match(/^PDOTH(\d{4})(\d{2})(\d{2})-\d+$/)
      if (m) {
        resolvedDate = `${m[1]}-${m[2]}-${m[3]}`
      }
    }
    if (!isMissingDate(resolvedDate)) {
      row[schema.dateCol] = resolvedDate
    }
  }

  if (!('pdoID' in row)) row.pdoID = row[schema.pkCol]
  if (!('id' in row)) row.id = row[schema.pkCol]
  if (!('pdoNo' in row) || isMissingDocNo(row.pdoNo)) row.pdoNo = resolvedDocNo
  if (!('poNo' in row) || isMissingDocNo(row.poNo)) row.poNo = resolvedDocNo
  if (!('pdoDate' in row) || isMissingDate(row.pdoDate)) row.pdoDate = resolvedDate
  if (!('poDate' in row) || isMissingDate(row.poDate)) row.poDate = resolvedDate
  return row
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

function isDuplicateDocNoError(error: unknown, docNoColumn: string) {
  const code = (error as { code?: string })?.code
  const message = getErrorMessage(error)
  return code === 'ER_DUP_ENTRY' && message.includes('Duplicate entry') && message.includes(docNoColumn)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const pdoNo = searchParams.get('pdoNo')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const connection = await pool.getConnection()

    try {
      const schema = await getProductionOrderSchema(connection)
      const baseSelect = `SELECT * FROM production_orders`

      if (id) {
        const [rows] = await connection.query(`${baseSelect} WHERE ${schema.pkCol} = ?`, [id])
        const rowList = rows as RowDataPacket[]
        if (rowList.length > 0) {
          const po = addCompatAliases({ ...rowList[0] }, schema)
          const recordId = po[schema.pkCol]

          const [materials] = await connection.query(
            `SELECT * FROM production_order_materials WHERE ${schema.materialFkCol} = ?`, [recordId]
          )
          const [steps] = await connection.query(
            `SELECT * FROM production_order_steps WHERE ${schema.stepFkCol} = ? ORDER BY step_number`, [recordId]
          )

          po.materials = materials || []
          po.steps = steps || []

          return NextResponse.json({ success: true, productionOrder: po, rows: [po] })
        }
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
      }

      if (pdoNo) {
        const [rows] = await connection.query(`${baseSelect} WHERE ${schema.noCol} = ?`, [pdoNo])
        const rowList = rows as RowDataPacket[]
        if (rowList.length > 0) {
          const po = addCompatAliases({ ...rowList[0] }, schema)
          const recordId = po[schema.pkCol]
          const [materials] = await connection.query(
            `SELECT * FROM production_order_materials WHERE ${schema.materialFkCol} = ?`, [recordId]
          )
          const [steps] = await connection.query(
            `SELECT * FROM production_order_steps WHERE ${schema.stepFkCol} = ? ORDER BY step_number`, [recordId]
          )
          po.materials = materials || []
          po.steps = steps || []
          return NextResponse.json({ success: true, productionOrder: po, rows: [po] })
        }
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
      }

      let querySql = baseSelect + ` WHERE 1=1`
      const params: unknown[] = []

      if (status) {
        querySql += ` AND status = ?`
        params.push(status)
      }

      querySql += ` ORDER BY ${schema.pkCol} DESC LIMIT ? OFFSET ?`
      params.push(limit, offset)

      const [rows] = await connection.query(querySql, params)
      const [countResult] = await connection.query(`SELECT COUNT(*) as total FROM production_orders`)
      const normalizedRows = (rows as RowDataPacket[]).map((row) => addCompatAliases({ ...row }, schema))
      const countRows = countResult as Array<{ total?: number }>

      return NextResponse.json({ success: true, rows: normalizedRows, total: countRows[0]?.total || 0 })
    } finally {
      connection.release()
    }
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      pdoNo: incomingPdoNo,
      pdoDate, product_id, product_code, product_name, quantity_ordered, unit,
      start_date, due_date, priority, production_line, shift, supervisor,
      notes, materials, steps, created_by, sales_orderID
    } = body

    const connection = await pool.getConnection()

    try {
      const schema = await getProductionOrderSchema(connection)
      let pdoNo = incomingPdoNo || await generateDocumentNumber('PDO', 'production_orders', schema.noCol)

      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          await connection.beginTransaction()

          const insertColumns: string[] = []
          const insertValues: unknown[] = []
          const addInsertValue = (column: string, value: unknown) => {
            if (!schema.productionColumns.has(column)) return
            insertColumns.push(column)
            insertValues.push(value)
          }

          addInsertValue(schema.noCol, pdoNo)
          addInsertValue(schema.dateCol, pdoDate)
          addInsertValue('sales_orderID', sales_orderID || null)
          addInsertValue('product_id', product_id)
          addInsertValue('product_code', product_code)
          addInsertValue('product_name', product_name)
          addInsertValue('quantity_ordered', quantity_ordered || 0)
          addInsertValue('unit', unit || 'pcs')
          addInsertValue('start_date', start_date)
          addInsertValue('due_date', due_date)
          addInsertValue('priority', priority || 'normal')
          addInsertValue('production_line', production_line)
          addInsertValue('shift', shift)
          addInsertValue('supervisor', supervisor)
          addInsertValue('notes', notes)
          addInsertValue('created_by', created_by)
          addInsertValue('status', 'pending')

          const placeholders = insertColumns.map(() => '?').join(', ')
          const [result] = await connection.query(
            `INSERT INTO production_orders (${insertColumns.join(', ')}) VALUES (${placeholders})`,
            insertValues
          )
          const insertResult = result as ResultSetHeader

          const pdoID = insertResult.insertId

          // Insert materials
          if (materials && Array.isArray(materials) && materials.length > 0) {
            for (const material of materials) {
              const materialColumns: string[] = []
              const materialValues: unknown[] = []
              const addMaterialValue = (column: string, value: unknown) => {
                if (!schema.materialColumns.has(column)) return
                materialColumns.push(column)
                materialValues.push(value)
              }

              addMaterialValue(schema.materialFkCol, pdoID)
              addMaterialValue('material_id', material.material_id)
              addMaterialValue('material_code', material.material_code)
              addMaterialValue('material_name', material.material_name)
              addMaterialValue('quantity_required', material.quantity_required || 0)
              addMaterialValue('unit', material.unit || 'pcs')

              await connection.query(
                `INSERT INTO production_order_materials (${materialColumns.join(', ')})
                 VALUES (${materialColumns.map(() => '?').join(', ')})`,
                materialValues
              )
            }
          }

          // Insert steps
          if (steps && Array.isArray(steps) && steps.length > 0) {
            for (let i = 0; i < steps.length; i++) {
              const step = steps[i]
              const stepColumns: string[] = []
              const stepValues: unknown[] = []
              const addStepValue = (column: string, value: unknown) => {
                if (!schema.stepColumns.has(column)) return
                stepColumns.push(column)
                stepValues.push(value)
              }

              addStepValue(schema.stepFkCol, pdoID)
              addStepValue('step_number', i + 1)
              addStepValue('step_name', step.step_name)
              addStepValue('description', step.description)
              addStepValue('duration_minutes', step.duration_minutes || 0)
              addStepValue('assigned_to', step.assigned_to)

              await connection.query(
                `INSERT INTO production_order_steps (${stepColumns.join(', ')})
                 VALUES (${stepColumns.map(() => '?').join(', ')})`,
                stepValues
              )
            }
          }

          await connection.commit()
          return NextResponse.json({ success: true, pdoID, pdoNo })
        } catch (error) {
          await connection.rollback()
          if (isDuplicateDocNoError(error, schema.noCol) && attempt < 4) {
            pdoNo = await generateDocumentNumber('PDO', 'production_orders', schema.noCol)
            continue
          }
          throw error
        }
      }

      throw new Error('Failed to create production order after retry')
    } catch (error) {
      throw error
    } finally {
      connection.release()
    }
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { pdoID, status, quantity_produced, quality_check_status, defect_quantity, actual_start_date, actual_end_date } = body
    const recordId = pdoID

    if (!recordId) return NextResponse.json({ success: false, error: 'pdoID required' }, { status: 400 })

    const connection = await pool.getConnection()

    try {
      const schema = await getProductionOrderSchema(connection)
      const updates: string[] = []
      const params: unknown[] = []

      if (status && schema.productionColumns.has('status')) { updates.push('status = ?'); params.push(status) }
      if (quantity_produced !== undefined && schema.productionColumns.has('quantity_produced')) { updates.push('quantity_produced = ?'); params.push(quantity_produced) }
      if (quality_check_status && schema.productionColumns.has('quality_check_status')) { updates.push('quality_check_status = ?'); params.push(quality_check_status) }
      if (defect_quantity !== undefined && schema.productionColumns.has('defect_quantity')) { updates.push('defect_quantity = ?'); params.push(defect_quantity) }
      if (actual_start_date && schema.productionColumns.has('actual_start_date')) { updates.push('actual_start_date = ?'); params.push(actual_start_date) }
      if (actual_end_date && schema.productionColumns.has('actual_end_date')) { updates.push('actual_end_date = ?'); params.push(actual_end_date) }

      if (updates.length === 0) return NextResponse.json({ success: false, error: 'No updates' }, { status: 400 })

      const querySql = `UPDATE production_orders SET ${updates.join(', ')} WHERE ${schema.pkCol} = ?`
      params.push(recordId)

      await connection.query(querySql, params)
      return NextResponse.json({ success: true })
    } finally {
      connection.release()
    }
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('pdoID')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const connection = await pool.getConnection()
    try {
      const schema = await getProductionOrderSchema(connection)
      await connection.query(`DELETE FROM production_orders WHERE ${schema.pkCol} = ?`, [id])
    } finally {
      connection.release()
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}
