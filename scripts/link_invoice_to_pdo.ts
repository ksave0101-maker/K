import { pool } from '../lib/mysql'

async function linkInvoiceToPDO() {
  try {
    console.log('Linking Invoice to Production Order...\n')

    // Get available PDOs
    console.log('=== Available Production Orders ===')
    const [pdos]: any = await pool.query(`
      SELECT pdoNo, product_name, pdoDate, status
      FROM production_orders
      ORDER BY pdoDate DESC
      LIMIT 10
    `)

    if (pdos.length === 0) {
      console.log('No Production Orders found.')
      console.log('\nCreating sample PDO...')

      // Create a sample PDO with all required fields
      await pool.query(`
        INSERT INTO production_orders
        (pdoNo, pdoDate, product_name, quantity_ordered, unit, start_date, due_date,
         production_line, shift, supervisor, status, created_by)
        VALUES
        ('PDO-TH-2026-001', '2026-03-15', 'LED Panel 600x600mm 40W', 100, 'pcs',
         '2026-03-15', '2026-03-30', 'Line 1', 'morning', 'Thailand Supervisor',
         'completed', 'Thailand Branch')
      `)
      console.log('✓ Created sample PDO: PDO-TH-2026-001')
    } else {
      pdos.forEach((pdo: any, idx: number) => {
        console.log(`${idx + 1}. ${pdo.pdoNo} - ${pdo.product_name} (${pdo.status})`)
      })
    }

    // Get invoices
    console.log('\n=== Korea HQ Invoices ===')
    const [invoices]: any = await pool.query(`
      SELECT id, invoiceNumber, customer, pdo_number
      FROM kr_hr_invoices
      ORDER BY created_at DESC
      LIMIT 5
    `)

    invoices.forEach((inv: any, idx: number) => {
      console.log(`${idx + 1}. ${inv.invoiceNumber} - ${inv.customer} - PDO: ${inv.pdo_number || 'NULL'}`)
    })

    // Example: Link first invoice to first PDO
    if (invoices.length > 0) {
      const invoice = invoices[0]
      const pdoNo = pdos.length > 0 ? pdos[0].pdoNo : 'PDO-TH-2026-001'

      console.log(`\n=== Linking Invoice to PDO ===`)
      console.log(`Invoice: ${invoice.invoiceNumber}`)
      console.log(`PDO: ${pdoNo}`)
      console.log(`Branch: Thailand`)

      await pool.query(`
        UPDATE kr_hr_invoices
        SET pdo_number = ?,
            pdo_branch = ?
        WHERE id = ?
      `, [pdoNo, 'Thailand', invoice.id])

      console.log('✓ Invoice linked to PDO successfully!')

      // Verify
      const [updated]: any = await pool.query(`
        SELECT
          i.invoiceNumber,
          i.pdo_number,
          i.pdo_branch,
          po.product_name
        FROM kr_hr_invoices i
        LEFT JOIN production_orders po ON i.pdo_number = po.pdoNo
        WHERE i.id = ?
      `, [invoice.id])

      console.log('\n=== Verification ===')
      console.log(`Invoice: ${updated[0].invoiceNumber}`)
      console.log(`PDO: ${updated[0].pdo_number}`)
      console.log(`Branch: ${updated[0].pdo_branch}`)
      console.log(`Product: ${updated[0].product_name || 'N/A'}`)
    }

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

linkInvoiceToPDO()
