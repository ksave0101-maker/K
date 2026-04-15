import { pool } from '../lib/mysql'

async function check() {
  try {
    console.log('Checking invoices table structure...\n')

    const [cols]: any = await pool.query(`
      DESCRIBE invoices
    `)

    console.log('=== Columns ===')
    cols.forEach((col: any) => {
      console.log(`${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`)
    })

    // Check if branch_code exists
    const hasBranchCode = cols.some((col: any) => col.Field === 'branch_code')
    console.log(`\nHas branch_code column: ${hasBranchCode}`)

    // Check recent invoices
    console.log('\n=== Recent Invoices ===')
    const [invoices]: any = await pool.query(`
      SELECT invNo, customer_name, notes, created_by
      FROM invoices
      ORDER BY created_at DESC
      LIMIT 5
    `)

    invoices.forEach((inv: any) => {
      console.log(`${inv.invNo} - ${inv.customer_name}`)
      console.log(`  Notes: ${inv.notes || 'N/A'}`)
      console.log(`  Created by: ${inv.created_by || 'N/A'}`)
    })

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

check()
