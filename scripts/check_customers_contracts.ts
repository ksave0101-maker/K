import { pool } from '../lib/mysql'

async function check() {
  try {
    console.log('Checking related tables structure...\n')

    // Check kr_customers
    console.log('=== kr_customers ===')
    const [customerCols]: any = await pool.query('DESCRIBE kr_customers')
    customerCols.forEach((col: any) => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Key ? `[${col.Key}]` : ''}`)
    })

    const [customerCount]: any = await pool.query('SELECT COUNT(*) as total FROM kr_customers')
    console.log(`Total records: ${customerCount[0].total}`)

    // Check kr_domestic_contracts
    console.log('\n=== kr_domestic_contracts ===')
    const [contractCols]: any = await pool.query('DESCRIBE kr_domestic_contracts')
    contractCols.forEach((col: any) => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Key ? `[${col.Key}]` : ''}`)
    })

    const [contractCount]: any = await pool.query('SELECT COUNT(*) as total FROM kr_domestic_contracts')
    console.log(`Total records: ${contractCount[0].total}`)

    // Check kr_int_contracts
    console.log('\n=== kr_int_contracts ===')
    const [intContractCols]: any = await pool.query('DESCRIBE kr_int_contracts')
    intContractCols.forEach((col: any) => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Key ? `[${col.Key}]` : ''}`)
    })

    const [intContractCount]: any = await pool.query('SELECT COUNT(*) as total FROM kr_int_contracts')
    console.log(`Total records: ${intContractCount[0].total}`)

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

check()
