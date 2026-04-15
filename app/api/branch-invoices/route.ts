import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

function yyyymmdd() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

function normalizeBranchCode(input: unknown) {
  const code = String(input || '').trim().toUpperCase()
  if (!code) return 'KR'
  return code.slice(0, 2)
}

async function generateNextInvoiceNo(connection: any, branchCode: string) {
  const day = yyyymmdd()
  const code = normalizeBranchCode(branchCode)
  const prefix = `INV-${day}-${code}`
  const [rows]: any = await connection.query(
    `SELECT invoiceNumber FROM kr_hr_invoices WHERE invoiceNumber LIKE ? ORDER BY invoiceNumber DESC LIMIT 1`,
    [`${prefix}%`]
  )
  const last = String(rows?.[0]?.invoiceNumber || '')
  const seqMatch = last.match(new RegExp(`^INV-${day}-${code}(\\d+)$`))
  const lastSeq = seqMatch ? Number(seqMatch[1]) || 0 : 0
  const nextSeq = String(lastSeq + 1).padStart(5, '0')
  return `${prefix}${nextSeq}`
}

function toDateOnly(input: unknown) {
  const raw = String(input || '').trim()
  if (!raw) return new Date().toISOString().slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10)
  return d.toISOString().slice(0, 10)
}

function extractPdoNo(...values: unknown[]) {
  for (const value of values) {
    const text = String(value || '').trim().toUpperCase()
    if (!text) continue
    const hit = text.match(/\bPDO[A-Z]{2}\d{8}-\d{5}\b/i)
    if (hit?.[0]) return hit[0].toUpperCase()
    if (text.startsWith('PDO')) return text
  }
  return ''
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branchCode = normalizeBranchCode(searchParams.get('branchCode'))
    const connection = await pool.getConnection()
    try {
      const nextInvoiceNo = await generateNextInvoiceNo(connection, branchCode)

      const [usedRows]: any = await connection.query(
        `SELECT shipment_no, pdo_number, notes
           FROM kr_hr_invoices
          WHERE (branch_code = ? OR notes LIKE ?)
            AND (shipment_no IS NOT NULL OR pdo_number IS NOT NULL OR notes LIKE '%Shipment: SH-%' OR notes LIKE '%PDO:%')`,
        [branchCode, `%Branch: ${branchCode}%`]
      )
      const usedShipmentNos: string[] = []
      const usedPdoNos: string[] = []
      for (const row of (usedRows || [])) {
        if (row?.shipment_no) {
          usedShipmentNos.push(String(row.shipment_no).trim().toUpperCase())
        } else {
          const m = String(row?.notes || '').match(/Shipment:\s*(SH-[\w-]+)/i)
          if (m?.[1]) usedShipmentNos.push(m[1].trim().toUpperCase())
        }
        if (row?.pdo_number) {
          usedPdoNos.push(String(row.pdo_number).trim().toUpperCase())
        } else {
          const m = String(row?.notes || '').match(/PDO:\s*(PDO[A-Z]{2}\d{8}-\d{5})/i)
          if (m?.[1]) usedPdoNos.push(m[1].trim().toUpperCase())
        }
      }

      return NextResponse.json({ success: true, invoiceNo: nextInvoiceNo, usedShipmentNos, usedPdoNos })
    } finally {
      connection.release()
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let connection: any
  try {
    const body = await request.json()
    const {
      invNo,
      invDate,
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      note,
      pdo_no,
      shipment_no,
      repdo_no,
      qaqc_no,
      subtotal,
      vat,
      vat_amount,
      total_amount,
      items,
      branch_code,
      delivery_reference,
      supplier_name,
      supplier_address,
      supplier_phone,
      supplier_email,
      supplier_tax_id,
    } = body

    if (!String(customer_name || '').trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      )
    }

    connection = await pool.getConnection()
    await connection.beginTransaction()

    const normalizedBranchCode = normalizeBranchCode(branch_code)
    const normalizedCustomerPhone = String(customer_phone || (normalizedBranchCode === 'TH' ? '02-080-8916' : '')).trim()
    let finalInvNo = String(invNo || '').trim()
    if (!finalInvNo) {
      finalInvNo = await generateNextInvoiceNo(connection, normalizedBranchCode)
    }

    const [dupRows]: any = await connection.query(
      `SELECT id FROM kr_hr_invoices WHERE invoiceNumber = ? OR id = ? LIMIT 1`,
      [finalInvNo, finalInvNo]
    )
    if (Array.isArray(dupRows) && dupRows.length > 0) {
      await connection.rollback()
      return NextResponse.json(
        { success: false, error: 'Duplicate invoice number', code: 'DUPLICATE_INVNO' },
        { status: 409 }
      )
    }

    const issueDate = toDateOnly(invDate)
    const noteParts = String(note || '').trim() || null
    // salesContractNumber stores the customer phone number
    const contractRefValue = normalizedCustomerPhone || finalInvNo

    const finalShipmentNo = String(shipment_no || delivery_reference || '').trim() || null
    const finalPdoNo = extractPdoNo(pdo_no, delivery_reference, note) || null
    // Extract branch code from PDO number itself (e.g. PDOTH... → TH, PDOKR... → KR)
    const pdoBranchCode = finalPdoNo ? (finalPdoNo.match(/^PDO([A-Z]{2})/i)?.[1]?.toUpperCase() || null) : null

    await connection.query(
      `INSERT INTO kr_hr_invoices
        (id, invoiceNumber, customer, customer_address, customer_phone, customer_email,
         issueDate, dueDate, subtotal, taxRate, taxAmount, vat_amount, totalAmount,
         paymentStatus, notes, salesContractNumber,
         branch_code, shipment_no, pdo_number, pdo_branch, repdo_no, qaqc_no,
         supplier_name, supplier_address, supplier_phone, supplier_email, supplier_tax_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalInvNo,
        finalInvNo,
        String(customer_name || '').trim(),
        String(customer_address || '').trim() || null,
        String(customer_phone || '').trim() || null,
        String(customer_email || '').trim() || null,
        issueDate,
        issueDate,
        Number(subtotal || 0),
        Number(vat || 0),
        Number(vat_amount || 0),
        Number(vat_amount || 0),
        Number(total_amount || 0),
        'unpaid',
        noteParts || null,
        contractRefValue || finalInvNo,
        normalizedBranchCode,
        finalShipmentNo,
        finalPdoNo || null,
        pdoBranchCode,
        String(repdo_no || '').trim() || null,
        String(qaqc_no || '').trim() || null,
        String(supplier_name || '').trim() || null,
        String(supplier_address || '').trim() || null,
        String(supplier_phone || '').trim() || null,
        String(supplier_email || '').trim() || null,
        String(supplier_tax_id || '').trim() || null,
      ]
    )

    if (Array.isArray(items) && items.length > 0) {
      const itemsToSave = items.map((item: any) => {
        const qty = Number(item?.qty || item?.quantity || 0)
        const price = Number(item?.price || item?.unit_price || item?.unitPrice || 0)
        return {
          name: String(item?.desc || item?.name || '').trim(),
          quantity: qty,
          unit: String(item?.unit || 'pcs').trim() || 'pcs',
          unitPrice: price,
          totalPrice: Number(item?.total || item?.total_price || (qty * price)),
        }
      }).filter((it: any) => it.name)

      for (let i = 0; i < itemsToSave.length; i++) {
        const item = itemsToSave[i]
        await connection.query(
          `INSERT INTO kr_hr_invoice_items
             (invoiceId, name, description, quantity, unit, unitPrice, unit_price, total_price, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            finalInvNo,
            item.name,
            item.name,
            item.quantity,
            item.unit,
            Math.round(item.unitPrice),
            item.unitPrice,
            item.totalPrice,
            i + 1,
          ]
        )
      }
    }

    await connection.commit()

    return NextResponse.json({
      success: true,
      invoiceId: finalInvNo,
      invoiceNumber: finalInvNo,
      message: 'Invoice created successfully',
    })
  } catch (error: unknown) {
    if (connection) {
      try { await connection.rollback() } catch {}
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating branch invoice:', message)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  } finally {
    if (connection) connection.release()
  }
}
