import { pool } from '../lib/mysql'

async function check() {
  try {
    console.log('Checking invoice-related tables...\n')

    const [tables]: any = await pool.query("SHOW TABLES LIKE '%invoice%'")
    console.log('Invoice tables found:')
    tables.forEach((t: any) => {
      const tableName = Object.values(t)[0]
      console.log(`  - ${tableName}`)
    })

    console.log('\n--- Checking kr_ tables ---')
    const [krTables]: any = await pool.query("SHOW TABLES LIKE 'kr_%'")
    console.log('Korea-related tables:')
    krTables.forEach((t: any) => {
      const tableName = Object.values(t)[0]
      console.log(`  - ${tableName}`)
    })

    // Check structure of kr_hr_invoices
    console.log('\n--- kr_hr_invoices structure ---')
    const [columns]: any = await pool.query('DESCRIBE kr_hr_invoices')
    columns.forEach((col: any) => {
      console.log(`  ${col.Field}: ${col.Type}`)
    })

    // Check if there's data
    const [count]: any = await pool.query('SELECT COUNT(*) as total FROM kr_hr_invoices')
    console.log(`\nTotal records: ${count[0].total}`)

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

check()
