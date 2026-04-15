import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invNo = searchParams.get('invNo')
    const id = searchParams.get('id')
    const branchCode = searchParams.get('branch_code') || searchParams.get('branchCode')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `
      SELECT
        i.invID as id,
        i.invNo,
        i.branch_code,
        i.invDate,
        i.cusID,
        i.customer_name,
        i.subtotal,
        i.discount,
        i.vat,
        i.total_amount,
        i.status,
        i.notes,
        i.created_by,
        i.created_at
      FROM invoices i
    `

    // Get single invoice by invNo
    if (invNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE i.invNo = ?`, [invNo])
      
      if (rows && rows.length > 0) {
        const invoice = rows[0]
        
        // Get invoice items
        const [items]: any = await pool.query(
          `SELECT * FROM invoice_items WHERE invID = ? ORDER BY itemID`,
          [invoice.id]
        )
        
        // Get payment terms
        const [paymentTerms]: any = await pool.query(
          `SELECT term_type FROM invoice_payment_terms WHERE invID = ?`,
          [invoice.id]
        )
        
        invoice.items = items || []
        invoice.paymentTerms = paymentTerms?.map((pt: any) => pt.term_type) || []
        
        return NextResponse.json({ 
          success: true, 
          invoice,
          rows: [invoice]
        })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Invoice not found',
        rows: []
      }, { status: 404 })
    }

    // Get single invoice by ID
    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE i.invID = ?`, [id])
      
      if (rows && rows.length > 0) {
        const invoice = rows[0]
        
        // Get invoice items
        const [items]: any = await pool.query(
          `SELECT * FROM invoice_items WHERE invID = ? ORDER BY itemID`,
          [invoice.id]
        )
        
        // Get payment terms
        const [paymentTerms]: any = await pool.query(
          `SELECT term_type FROM invoice_payment_terms WHERE invID = ?`,
          [invoice.id]
        )
        
        invoice.items = items || []
        invoice.paymentTerms = paymentTerms?.map((pt: any) => pt.term_type) || []
        
        return NextResponse.json({ 
          success: true, 
          invoice,
          rows: [invoice]
        })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Invoice not found',
        rows: []
      }, { status: 404 })
    }

    // Get list of invoices
    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    // Filter by branch code if provided
    if (branchCode) {
      query += ` AND i.branch_code = ?`
      params.push(branchCode)
    }

    query += ` ORDER BY i.invID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)

    return NextResponse.json({ success: true, rows })
  } catch (error: any) {
    console.error('Invoices API error:', error)
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
      invNo,
      invDate,
      cusID,
      customer_name,
      subtotal,
      discount,
      vat,
      total_amount,
      notes,
      items,
      paymentTerms,
      created_by
    } = body

    if (!invNo) {
      return NextResponse.json(
        { success: false, error: 'Invoice number is required' },
        { status: 400 }
      )
    }

    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()

      // Insert invoice
      const [result]: any = await connection.query(
        `INSERT INTO invoices 
        (invNo, invDate, cusID, customer_name, subtotal, discount, vat, total_amount, notes, created_by, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [invNo, invDate, cusID, customer_name, subtotal || 0, discount || 0, vat || 0, total_amount || 0, notes, created_by]
      )

      const invID = result.insertId

      // Insert invoice items
      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await connection.query(
            `INSERT INTO invoice_items 
            (invID, description, quantity, unit_price, total_price) 
            VALUES (?, ?, ?, ?, ?)`,
            [
              invID,
              item.desc || item.description || '',
              item.qty || item.quantity || 1,
              item.price || item.unit_price || 0,
              item.total || ((item.qty || 1) * (item.price || 0))
            ]
          )
        }
      }

      // Insert payment terms
      if (paymentTerms && Array.isArray(paymentTerms) && paymentTerms.length > 0) {
        for (const term of paymentTerms) {
          await connection.query(
            `INSERT INTO invoice_payment_terms (invID, term_type) VALUES (?, ?)`,
            [invID, term]
          )
        }
      }

      await connection.commit()

      return NextResponse.json({
        success: true,
        invID,
        invNo,
        message: 'Invoice created successfully'
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error('Create invoice error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, invID, status } = body

    const recordId = id || invID

    if (!recordId) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    // Update invoice status
    const [result]: any = await pool.query(
      `UPDATE invoices SET status = ? WHERE invID = ?`,
      [status, recordId]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice status updated successfully'
    })
  } catch (error: any) {
    console.error('Update invoice error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
