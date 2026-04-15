import { pool } from '../lib/mysql'

async function check() {
  try {
    console.log('Checking kr_domestic_invoices table...\n')

    // Check structure
    const [columns]: any = await pool.query('DESCRIBE kr_domestic_invoices')
    console.log('Table structure:')
    columns.forEach((col: any) => {
      console.log(`  ${col.Field}: ${col.Type}`)
    })

    // Check data
    const [count]: any = await pool.query('SELECT COUNT(*) as total FROM kr_domestic_invoices')
    console.log(`\nTotal records: ${count[0].total}`)

    if (count[0].total > 0) {
      const [sample]: any = await pool.query('SELECT * FROM kr_domestic_invoices LIMIT 3')
      console.log('\nSample data:')
      console.log(JSON.stringify(sample, null, 2))
    }

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

check()
