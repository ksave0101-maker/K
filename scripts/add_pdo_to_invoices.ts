import { pool } from '../lib/mysql'

async function migrate() {
  try {
    console.log('Adding PDO (Production Order) field to invoices...\n')

    // Add pdo_number field to kr_hr_invoices
    console.log('Adding pdo_number field...')
    try {
      await pool.query(`
        ALTER TABLE kr_hr_invoices
          ADD COLUMN pdo_number VARCHAR(50) NULL AFTER salesContractNumber,
          ADD COLUMN pdo_branch VARCHAR(20) NULL COMMENT 'Branch that created the PDO'
      `)
      console.log('✓ Fields added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ Fields already exist')
      } else {
        throw err
      }
    }

    // Add indexes
    console.log('\nAdding indexes...')
    try {
      await pool.query(`
        ALTER TABLE kr_hr_invoices
          ADD INDEX idx_pdo_number (pdo_number)
      `)
      console.log('✓ Index added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ Index already exists')
      } else {
        throw err
      }
    }

    // Verification
    console.log('\n=== Verification ===')
    const [cols]: any = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME = 'kr_hr_invoices'
        AND COLUMN_NAME IN ('pdo_number', 'pdo_branch')
    `)

    cols.forEach((col: any) => {
      console.log(`✓ ${col.COLUMN_NAME}: ${col.DATA_TYPE}`)
    })

    console.log('\n✅ Migration completed!')
    console.log('\nNew fields:')
    console.log('  - pdo_number: Production Order Number from branch')
    console.log('  - pdo_branch: Branch that created the PDO')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

migrate()
