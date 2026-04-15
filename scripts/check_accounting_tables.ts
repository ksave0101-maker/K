import { pool } from '../lib/mysql'

async function check() {
  try {
    console.log('Checking accounting tables...\n')

    // Check for journal tables
    const [tables]: any = await pool.query("SHOW TABLES LIKE '%journal%'")
    console.log('=== Journal Tables ===')
    tables.forEach((t: any) => {
      console.log(`  ${Object.values(t)[0]}`)
    })

    // Check for accounting tables
    const [accTables]: any = await pool.query("SHOW TABLES LIKE 'acc_%'")
    console.log('\n=== Accounting Tables (acc_*) ===')
    accTables.forEach((t: any) => {
      console.log(`  ${Object.values(t)[0]}`)
    })

    // Check acc_journal_entries structure
    console.log('\n=== acc_journal_entries structure ===')
    try {
      const [cols]: any = await pool.query('DESCRIBE acc_journal_entries')
      cols.forEach((col: any) => {
        console.log(`  ${col.Field}: ${col.Type}`)
      })
    } catch (e) {
      console.log('  Table not found')
    }

    // Check acc_payment_vouchers structure
    console.log('\n=== acc_payment_vouchers structure ===')
    const [pvCols]: any = await pool.query('DESCRIBE acc_payment_vouchers')
    pvCols.forEach((col: any) => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Key ? `[${col.Key}]` : ''}`)
    })

    // Check if entry_id FK exists
    console.log('\n=== Checking entry_id FK ===')
    const [fks]: any = await pool.query(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME = 'acc_payment_vouchers'
        AND COLUMN_NAME = 'entry_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `)
    if (fks.length > 0) {
      console.log(`  FK exists: entry_id -> ${fks[0].REFERENCED_TABLE_NAME}.${fks[0].REFERENCED_COLUMN_NAME}`)
    } else {
      console.log('  No FK found for entry_id')
    }

    // Check chart of accounts
    console.log('\n=== Chart of Accounts ===')
    const [coaTables]: any = await pool.query("SHOW TABLES LIKE '%chart%'")
    if (coaTables.length > 0) {
      coaTables.forEach((t: any) => {
        console.log(`  ${Object.values(t)[0]}`)
      })
    } else {
      console.log('  No chart of accounts table found')
    }

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

check()
