import { pool } from '../lib/mysql'

async function migrate() {
  try {
    console.log('Running quotations migration...')

    // Add customer detail columns
    console.log('Adding customer_address, customer_company, customer_tax_id, discount_percent...')
    await pool.query(`
      ALTER TABLE quotations
        ADD COLUMN IF NOT EXISTS customer_address TEXT AFTER customer_phone,
        ADD COLUMN IF NOT EXISTS customer_company VARCHAR(255) AFTER customer_address,
        ADD COLUMN IF NOT EXISTS customer_tax_id VARCHAR(13) AFTER customer_company,
        ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2) DEFAULT 0.00 AFTER subtotal
    `)

    console.log('✓ Columns added successfully!')

    // Update existing records
    console.log('Updating existing records...')
    await pool.query(`UPDATE quotations SET discount_percent = 0.00 WHERE discount_percent IS NULL`)

    console.log('✓ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('✗ Migration failed:', error)
    process.exit(1)
  }
}

migrate()
