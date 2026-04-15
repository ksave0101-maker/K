import { pool } from '../lib/mysql'

async function migrate() {
  try {
    console.log('Adding sales_orderID FK to production_orders table...\n')

    // Add sales_orderID column
    await pool.query(`
      ALTER TABLE production_orders
        ADD COLUMN IF NOT EXISTS sales_orderID INT NULL AFTER pdoDate,
        ADD INDEX IF NOT EXISTS idx_sales_orderID (sales_orderID)
    `)
    console.log('✓ Added sales_orderID column and index')

    // Add foreign key constraint
    try {
      await pool.query(`
        ALTER TABLE production_orders
          ADD CONSTRAINT fk_production_orders_sales_order
            FOREIGN KEY (sales_orderID) REFERENCES sales_orders(orderID)
            ON DELETE SET NULL
            ON UPDATE CASCADE
      `)
      console.log('✓ Added foreign key constraint')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ Foreign key constraint already exists, skipping...')
      } else {
        throw err
      }
    }

    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

migrate()
