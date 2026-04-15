import { pool } from '../lib/mysql'

async function check() {
  try {
    console.log('Checking Invoice PDO linkage...\n')

    // Check invoices with PDO data
    const [invoices]: any = await pool.query(`
      SELECT
        i.id,
        i.invoiceNumber,
        i.customer,
        i.pdo_number,
        i.pdo_branch,
        po.pdoNo AS linked_pdo,
        po.product_name,
        po.pdoDate
      FROM kr_hr_invoices i
      LEFT JOIN production_orders po ON i.pdo_number = po.pdoNo
      ORDER BY i.created_at DESC
      LIMIT 10
    `)

    console.log('=== Recent Invoices ===')
    invoices.forEach((inv: any) => {
      console.log(`\nInvoice: ${inv.invoiceNumber || inv.id}`)
      console.log(`  Customer: ${inv.customer}`)
      console.log(`  pdo_number field: ${inv.pdo_number || 'NULL'}`)
      console.log(`  pdo_branch field: ${inv.pdo_branch || 'NULL'}`)
      console.log(`  Linked PDO: ${inv.linked_pdo || 'NOT LINKED'}`)
      if (inv.linked_pdo) {
        console.log(`  Product: ${inv.product_name}`)
        console.log(`  PDO Date: ${inv.pdoDate}`)
      }
    })

    // Check available PDOs
    console.log('\n\n=== Available Production Orders ===')
    const [pdos]: any = await pool.query(`
      SELECT pdoNo, product_name, pdoDate, status
      FROM production_orders
      ORDER BY pdoDate DESC
      LIMIT 5
    `)

    pdos.forEach((pdo: any) => {
      console.log(`PDO: ${pdo.pdoNo} - ${pdo.product_name} (${pdo.status})`)
    })

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

check()
