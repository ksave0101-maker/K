import { pool } from '../lib/mysql'

async function migrate() {
  try {
    console.log('Adding branch_code column to invoices table...\n')

    // Add branch_code column
    try {
      await pool.query(`
        ALTER TABLE invoices
        ADD COLUMN branch_code VARCHAR(10) NULL AFTER invNo,
        ADD INDEX idx_branch_code (branch_code)
      `)
      console.log('✓ branch_code column added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ branch_code column already exists')
      } else {
        throw err
      }
    }

    // Verify
    console.log('\n=== Verification ===')
    const [cols]: any = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME = 'invoices'
        AND COLUMN_NAME = 'branch_code'
    `)

    if (cols.length > 0) {
      console.log(`✓ ${cols[0].COLUMN_NAME}: ${cols[0].COLUMN_TYPE} [${cols[0].COLUMN_KEY || 'no key'}]`)
    }

    console.log('\n✅ Migration completed!')
    console.log('\nUsage:')
    console.log('  branch_code values: TH, KR, VN, MY, BN')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

migrate()
