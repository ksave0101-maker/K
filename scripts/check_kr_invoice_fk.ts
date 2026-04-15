import { pool } from '../lib/mysql'

async function check() {
  try {
    console.log('Checking kr_hr_invoices and related tables...\n')

    // Check kr_hr_invoices structure
    console.log('=== kr_hr_invoices ===')
    const [invoiceColumns]: any = await pool.query('DESCRIBE kr_hr_invoices')
    invoiceColumns.forEach((col: any) => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Key ? `[${col.Key}]` : ''}`)
    })

    // Check kr_hr_invoice_items structure
    console.log('\n=== kr_hr_invoice_items ===')
    const [itemsColumns]: any = await pool.query('DESCRIBE kr_hr_invoice_items')
    itemsColumns.forEach((col: any) => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Key ? `[${col.Key}]` : ''}`)
    })

    // Check current foreign keys
    console.log('\n=== Current Foreign Keys ===')
    const [fks]: any = await pool.query(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME IN ('kr_hr_invoices', 'kr_hr_invoice_items')
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `)

    if (fks.length > 0) {
      fks.forEach((fk: any) => {
        console.log(`  ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`)
      })
    } else {
      console.log('  No foreign keys found')
    }

    // Check related tables
    console.log('\n=== Related Tables ===')
    const [tables]: any = await pool.query("SHOW TABLES LIKE 'kr_%'")
    const relatedTables = []
    for (const t of tables) {
      const tableName = Object.values(t)[0] as string
      if (tableName.includes('contract') || tableName.includes('customer') || tableName.includes('payment')) {
        relatedTables.push(tableName)
      }
    }
    relatedTables.forEach(t => console.log(`  - ${t}`))

    // Check if there's a payments table
    const [paymentTables]: any = await pool.query("SHOW TABLES LIKE '%payment%'")
    console.log('\n=== Payment Tables ===')
    paymentTables.forEach((t: any) => {
      console.log(`  - ${Object.values(t)[0]}`)
    })

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

check()
