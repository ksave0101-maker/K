import { pool } from '../lib/mysql'

async function check() {
  try {
    console.log('Checking Invoice-Production Order relationship...\n')

    // Check kr_hr_invoices structure
    console.log('=== kr_hr_invoices columns ===')
    const [invCols]: any = await pool.query('DESCRIBE kr_hr_invoices')
    invCols.forEach((col: any) => {
      console.log(`  ${col.Field}: ${col.Type}`)
    })

    // Check production order tables
    console.log('\n=== Production Order Tables ===')
    const [poTables]: any = await pool.query("SHOW TABLES LIKE '%production%order%'")
    poTables.forEach((t: any) => {
      console.log(`  ${Object.values(t)[0]}`)
    })

    // Check kr_production_orders structure
    console.log('\n=== kr_production_orders columns ===')
    try {
      const [poCols]: any = await pool.query('DESCRIBE kr_production_orders')
      poCols.forEach((col: any) => {
        console.log(`  ${col.Field}: ${col.Type}`)
      })

      // Check for sample data
      const [sample]: any = await pool.query('SELECT * FROM kr_production_orders LIMIT 3')
      console.log(`\nSample records: ${sample.length}`)
      sample.forEach((po: any) => {
        console.log(`  ${po.orderNumber || po.id} - Contract: ${po.contractId || 'N/A'}`)
      })
    } catch (e) {
      console.log('  Table not found')
    }

    // Check if there's a link between invoices and production orders
    console.log('\n=== Checking for links ===')
    const [inv]: any = await pool.query('SELECT * FROM kr_hr_invoices LIMIT 1')
    if (inv.length > 0) {
      console.log('Invoice fields:', Object.keys(inv[0]))
    }

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

check()
