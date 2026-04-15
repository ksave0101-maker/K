import { NextRequest, NextResponse } from 'next/server'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { pool } from '@/lib/mysql'

type ProductRow = RowDataPacket & {
  id: number
  productID: number
  sku: string | null
  name: string | null
  description: string | null
  capacity: string | null
  mcb: string | null
  size: string | null
  weight: string | null
  price: number | null
  price_vat: number | null
  unit: string | null
  tfc_duty: string | null
  installation: string | null
  profit: string | null
  commission: string | null
  category: string | null
  image: string | null
  stock_qty: number | null
  is_active: number
  created_at: string | null
  updated_at: string | null
}

type CountRow = RowDataPacket & {
  total: number
}

type ProductPayload = {
  id?: number | string | null
  sku?: string | null
  name?: string | null
  description?: string | null
  capacity?: string | null
  mcb?: string | null
  size?: string | null
  weight?: string | null
  price?: number | string | null
  unit?: string | null
  category?: string | null
  stock_qty?: number | string | null
  is_active?: number | boolean | null
}

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Unknown error'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')
    const active = searchParams.get('active')
    const q = searchParams.get('q')

    let query = `
      SELECT
        productID as id,
        productID,
        sku,
        name,
        description,
        \`Capacity (kVA)\` as capacity,
        MCB as mcb,
        \`Size (WxLxH) cm.\` as size,
        Weight as weight,
        price,
        Pin_VAT as price_vat,
        unit,
        TFC_duty as tfc_duty,
        Installation as installation,
        Profit as profit,
        commission,
        category,
        Pro_Image as image,
        stock_qty,
        is_active,
        created_at,
        updated_at
      FROM product_list
      WHERE 1=1
    `

    const params: Array<string | number> = []

    if (id) {
      query += ` AND productID = ?`
      params.push(id)
    }

    if (q) {
      query += ` AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)`
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }

    if (category) {
      query += ` AND category = ?`
      params.push(category)
    }

    if (active !== null && active !== undefined) {
      query += ` AND is_active = ?`
      params.push(active === 'true' ? 1 : 0)
    }

    query += ` ORDER BY productID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query<ProductRow[]>(query, params)

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM product_list WHERE 1=1`
    const countParams: Array<string | number> = []

    if (category) {
      countQuery += ` AND category = ?`
      countParams.push(category)
    }

    if (active !== null && active !== undefined) {
      countQuery += ` AND is_active = ?`
      countParams.push(active === 'true' ? 1 : 0)
    }

    const [countResult] = await pool.query<CountRow[]>(countQuery, countParams)
    const total = countResult[0]?.total || 0

    return NextResponse.json({
      success: true,
      products: rows,
      rows,
      total,
      limit,
      offset
    })
  } catch (error: unknown) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ProductPayload
    const {
      sku,
      name,
      description,
      capacity,
      mcb,
      size,
      weight,
      price,
      unit,
      category,
      stock_qty,
      is_active
    } = body

    const query = `
      INSERT INTO product_list (
        sku, name, description, \`Capacity (kVA)\`, MCB, \`Size (WxLxH) cm.\`,
        Weight, price, unit, category, stock_qty, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const [result] = await pool.query(query, [
      sku || null,
      name,
      description || null,
      capacity || '',
      mcb || '',
      size || '',
      weight || '',
      price || 0,
      unit || 'unit',
      category || null,
      stock_qty || 0,
      is_active !== undefined ? is_active : 1
    ] as Array<string | number | null>)

    return NextResponse.json({
      success: true,
      productId: (result as ResultSetHeader).insertId
    })
  } catch (error: unknown) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as ProductPayload
    const { id, stock_qty } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const query = `UPDATE product_list SET stock_qty = ? WHERE productID = ?`
    await pool.query(query, [stock_qty ?? 0, id])

    return NextResponse.json({
      success: true,
      id
    })
  } catch (error: unknown) {
    console.error('Update product stock error:', error)
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
