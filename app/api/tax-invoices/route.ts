import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taxNo = searchParams.get('taxNo')
    const id = searchParams.get('id')
    const source_receiptNo = searchParams.get('source_receiptNo')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `
      SELECT
        t.taxID as id,
        t.invID,
        t.taxNo,
        t.taxDate,
        t.cusID,
        t.customer_name,
        t.items,
        t.subtotal,
        t.vat,
        t.total_amount,
        t.status,
        t.notes,
        t.created_by,
        t.created_at
      FROM tax_invoices t
    `

    // Get single tax invoice by taxNo
    if (taxNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE t.taxNo = ?`, [taxNo])
      
      if (rows && rows.length > 0) {
        const taxInvoice = rows[0]
        
        // Parse items if stored as JSON string
        if (taxInvoice.items && typeof taxInvoice.items === 'string') {
          try {
            taxInvoice.items = JSON.parse(taxInvoice.items)
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          taxInvoice,
          rows: [taxInvoice]
        })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Tax invoice not found',
        rows: []
      }, { status: 404 })
    }

    // Check if tax invoice exists for a receipt
    if (source_receiptNo) {
      // Check if there's a tax invoice linked to this receipt
      const [rows]: any = await pool.query(
        `SELECT t.* FROM tax_invoices t 
         LEFT JOIN receipts r ON t.invID = r.invID 
         WHERE r.receiptNo = ?`,
        [source_receiptNo]
      )
      
      return NextResponse.json({ 
        success: true, 
        exists: rows && rows.length > 0,
        rows: rows || []
      })
    }

    // Get single tax invoice by ID
    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE t.taxID = ?`, [id])
      
      if (rows && rows.length > 0) {
        const taxInvoice = rows[0]
        
        // Parse items if stored as JSON string
        if (taxInvoice.items && typeof taxInvoice.items === 'string') {
          try {
            taxInvoice.items = JSON.parse(taxInvoice.items)
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          taxInvoice,
          rows: [taxInvoice]
        })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Tax invoice not found',
        rows: []
      }, { status: 404 })
    }

    // Get list of tax invoices
    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    query += ` ORDER BY t.taxID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows]: any = await pool.query(query, params)
    
    // Parse items for each row
    const processedRows = rows.map((row: any) => {
      if (row.items && typeof row.items === 'string') {
        try {
          row.items = JSON.parse(row.items)
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
      return row
    })

    return NextResponse.json({ success: true, rows: processedRows })
  } catch (error: any) {
    console.error('Tax invoices API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      invID,
      taxNo,
      taxDate,
      cusID,
      customer_name,
      items,
      subtotal,
      vat,
      total_amount,
      status,
      notes,
      created_by
    } = body

    if (!taxNo) {
      return NextResponse.json(
        { success: false, error: 'Tax invoice number is required' },
        { status: 400 }
      )
    }

    // Convert items to JSON string if it's an array or object
    let itemsStr = items
    if (typeof items === 'object') {
      itemsStr = JSON.stringify(items)
    }

    // Insert tax invoice
    const [result]: any = await pool.query(
      `INSERT INTO tax_invoices 
      (invID, taxNo, taxDate, cusID, customer_name, items, subtotal, vat, total_amount, status, notes, created_by, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        invID || null,
        taxNo,
        taxDate || new Date(),
        cusID || null,
        customer_name || null,
        itemsStr || null,
        subtotal || 0,
        vat || 0,
        total_amount || 0,
        status || 'issued',
        notes || null,
        created_by || null
      ]
    )

    const taxID = result.insertId

    return NextResponse.json({
      success: true,
      taxID,
      taxNo,
      message: 'Tax invoice created successfully'
    })
  } catch (error: any) {
    console.error('Create tax invoice error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, taxID, status } = body

    const recordId = id || taxID

    if (!recordId) {
      return NextResponse.json(
        { success: false, error: 'Tax invoice ID is required' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    // Update tax invoice status
    const [result]: any = await pool.query(
      `UPDATE tax_invoices SET status = ? WHERE taxID = ?`,
      [status, recordId]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Tax invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tax invoice status updated successfully'
    })
  } catch (error: any) {
    console.error('Update tax invoice error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
