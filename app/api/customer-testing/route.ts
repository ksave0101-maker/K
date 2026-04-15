import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const cusID = searchParams.get('cusID')
    const status = searchParams.get('status')

    let query = 'SELECT * FROM customer_testing'
    const params: any[] = []
    const conditions: string[] = []

    if (id) {
      conditions.push('testID = ?')
      params.push(id)
    }
    if (cusID) {
      conditions.push('cusID = ?')
      params.push(cusID)
    }
    if (status) {
      conditions.push('status = ?')
      params.push(status)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    query += ' ORDER BY created_at DESC'

    const [rows] = await pool.query(query, params)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Auto-generate testNo: TST-YYYY-NNNN
    const year = new Date().getFullYear()
    const [countRows]: any = await pool.query(
      "SELECT COUNT(*) as cnt FROM customer_testing WHERE testNo LIKE ?",
      [`TST-${year}-%`]
    )
    const nextNum = (countRows[0]?.cnt || 0) + 1
    const testNo = `TST-${year}-${String(nextNum).padStart(4, '0')}`

    // Calculate endDate = startDate + 1 month if startDate provided
    let endDate = body.endDate || null
    if (body.startDate && !endDate) {
      const sd = new Date(body.startDate)
      sd.setMonth(sd.getMonth() + 1)
      endDate = sd.toISOString().split('T')[0]
    }

    const [result]: any = await pool.query(
      `INSERT INTO customer_testing
       (testNo, cusID, quoteNo, customerName, phone, email, address, productName, productDetail,
        installDate, startDate, endDate, status, testResult, powerBefore, powerAfter,
        savingPercent, customerFeedback, rating, notes, assignedTo, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testNo,
        body.cusID || null,
        body.quoteNo || null,
        body.customerName || null,
        body.phone || null,
        body.email || null,
        body.address || null,
        body.productName || null,
        body.productDetail || null,
        body.installDate || null,
        body.startDate || null,
        endDate,
        body.status || 'pending',
        body.testResult || null,
        body.powerBefore || null,
        body.powerAfter || null,
        body.savingPercent || null,
        body.customerFeedback || null,
        body.rating || null,
        body.notes || null,
        body.assignedTo || null,
        body.created_by || 'administrator'
      ]
    )

    return NextResponse.json({ ok: true, testID: result.insertId, testNo })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.testID) {
      return NextResponse.json({ ok: false, error: 'testID is required' }, { status: 400 })
    }

    const fields: string[] = []
    const params: any[] = []

    const allowedFields = [
      'cusID', 'quoteNo', 'customerName', 'phone', 'email', 'address',
      'productName', 'productDetail', 'installDate', 'startDate', 'endDate',
      'status', 'testResult', 'powerBefore', 'powerAfter', 'savingPercent',
      'customerFeedback', 'rating', 'notes', 'assignedTo', 'convertedToInstall'
    ]

    for (const f of allowedFields) {
      if (body[f] !== undefined) {
        fields.push(`${f} = ?`)
        params.push(body[f])
      }
    }

    // Auto-calc endDate if startDate changed
    if (body.startDate && !body.endDate) {
      const sd = new Date(body.startDate)
      sd.setMonth(sd.getMonth() + 1)
      fields.push('endDate = ?')
      params.push(sd.toISOString().split('T')[0])
    }

    // Auto-calc savingPercent
    if (body.powerBefore && body.powerAfter) {
      const saving = ((body.powerBefore - body.powerAfter) / body.powerBefore * 100).toFixed(2)
      fields.push('savingPercent = ?')
      params.push(saving)
    }

    if (fields.length === 0) {
      return NextResponse.json({ ok: false, error: 'No fields to update' }, { status: 400 })
    }

    params.push(body.testID)
    await pool.query(`UPDATE customer_testing SET ${fields.join(', ')} WHERE testID = ?`, params)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 })
    }
    await pool.query('DELETE FROM customer_testing WHERE testID = ?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
