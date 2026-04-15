import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

type KoreaProductRow = Record<string, unknown> & {
  specs?: unknown
  features?: unknown
}

type KoreaProductPayload = {
  name?: string
  category?: string
  price?: number
  rating?: number
  reviews?: number
  inStock?: boolean
  description?: string
  specs?: unknown[]
  features?: unknown[]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const rows = await query('SELECT * FROM kr_products WHERE id = ?', [id]) as KoreaProductRow[]
      const row = rows[0]
      if (!row) return NextResponse.json(null)
      return NextResponse.json({
        ...row,
        specs: row.specs ? (typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs) : [],
        features: row.features ? (typeof row.features === 'string' ? JSON.parse(row.features) : row.features) : []
      })
    }

    const rows = await query('SELECT * FROM kr_products ORDER BY name ASC') as KoreaProductRow[]
    return NextResponse.json(rows.map((r) => ({
      ...r,
      specs: r.specs ? (typeof r.specs === 'string' ? JSON.parse(r.specs) : r.specs) : [],
      features: r.features ? (typeof r.features === 'string' ? JSON.parse(r.features) : r.features) : []
    })))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as KoreaProductPayload
    const { name, category, price, rating, reviews, inStock, description, specs, features } = body
    const result = await query(
      'INSERT INTO kr_products (name, category, price, rating, reviews, inStock, description, specs, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category, price || 0, rating || 0, reviews || 0, inStock !== false ? 1 : 0, description || null, JSON.stringify(specs || []), JSON.stringify(features || [])]
    )
    return NextResponse.json({ success: true, id: (result as any)[0]?.insertId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, category, price, rating, reviews, inStock, description, specs, features } = body
    await query(
      'UPDATE kr_products SET name=?, category=?, price=?, rating=?, reviews=?, inStock=?, description=?, specs=?, features=? WHERE id=?',
      [name, category, price || 0, rating || 0, reviews || 0, inStock !== false ? 1 : 0, description || null, JSON.stringify(specs || []), JSON.stringify(features || []), id]
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await query('DELETE FROM kr_products WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
