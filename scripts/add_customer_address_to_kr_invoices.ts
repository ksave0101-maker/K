import { pool } from '../lib/mysql'

async function migrate() {
  try {
    console.log('Adding customer_address to kr_hr_invoices...\n')

    await pool.query(`
      ALTER TABLE kr_hr_invoices
      ADD COLUMN customer_address TEXT NULL AFTER customer
    `)

    console.log('✓ customer_address column added')

    // Verify
    const [cols]: any = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME = 'kr_hr_invoices'
        AND COLUMN_NAME = 'customer_address'
    `)

    if (cols.length > 0) {
      console.log(`\n✓ Verified: ${cols[0].COLUMN_NAME} (${cols[0].COLUMN_TYPE})`)
    }

    console.log('\n✅ Migration completed!')
    process.exit(0)
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠ customer_address column already exists')
      process.exit(0)
    }
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

migrate()
