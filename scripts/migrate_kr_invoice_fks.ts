import { pool } from '../lib/mysql'

async function migrate() {
  try {
    console.log('Adding Foreign Keys for Korea HR Invoices...\n')

    // Step 1: Add index first (if it doesn't exist)
    try {
      console.log('Adding index on invoiceId...')
      await pool.query(`
        ALTER TABLE kr_hr_invoice_items
          ADD INDEX idx_invoiceId (invoiceId)
      `)
      console.log('✓ Index added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ Index already exists, skipping...')
      } else {
        throw err
      }
    }

    // Step 2: Add Foreign Key
    try {
      console.log('\nAdding FK: kr_hr_invoice_items -> kr_hr_invoices...')
      await pool.query(`
        ALTER TABLE kr_hr_invoice_items
          ADD CONSTRAINT fk_kr_hr_invoice_items_invoice
            FOREIGN KEY (invoiceId)
            REFERENCES kr_hr_invoices(id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
      `)
      console.log('✓ Foreign Key added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ Foreign Key already exists, skipping...')
      } else {
        throw err
      }
    }

    // Verify
    console.log('\n=== Verification ===')
    const [fks]: any = await pool.query(`
      SELECT
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME = 'kr_hr_invoice_items'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `)

    if (fks.length > 0) {
      fks.forEach((fk: any) => {
        console.log(`✓ ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`)
      })
    }

    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    console.error('Error code:', error.code)
    process.exit(1)
  }
}

migrate()
