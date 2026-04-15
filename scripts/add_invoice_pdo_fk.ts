import { pool } from '../lib/mysql'

async function migrate() {
  try {
    console.log('Adding Foreign Key: kr_hr_invoices -> production_orders...\n')

    // First, check table and columns
    console.log('Checking production_orders table structure...')
    const [allPoCols]: any = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME = 'production_orders'
      ORDER BY ORDINAL_POSITION
    `)

    console.log('production_orders columns:')
    allPoCols.forEach((col: any) => {
      console.log(`  ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.COLUMN_KEY ? `[${col.COLUMN_KEY}]` : ''}`)
    })

    console.log('\nChecking kr_hr_invoices.pdo_number...')
    const [invCols]: any = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, CHARACTER_SET_NAME, COLLATION_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME = 'kr_hr_invoices'
        AND COLUMN_NAME = 'pdo_number'
    `)
    console.log('kr_hr_invoices.pdo_number:', invCols[0])

    // Check if production_orders table exists and has data
    const [poCheck]: any = await pool.query(`SELECT COUNT(*) as cnt FROM production_orders`)
    console.log(`\nproduction_orders table has ${poCheck[0].cnt} records`)

    // Add FK from pdo_number to production_orders.pdoNo
    console.log('\nCreating foreign key constraint...')
    console.log('kr_hr_invoices.pdo_number -> production_orders.pdoNo')
    try {
      await pool.query(`
        ALTER TABLE kr_hr_invoices
          ADD CONSTRAINT fk_kr_invoice_pdo
            FOREIGN KEY (pdo_number)
            REFERENCES production_orders(pdoNo)
            ON DELETE SET NULL
            ON UPDATE CASCADE
      `)
      console.log('✓ Foreign key created')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_FK_DUP_NAME') {
        console.log('⚠ Foreign key already exists')
      } else {
        throw err
      }
    }

    // Verification
    console.log('\n=== Verification ===')
    const [fks]: any = await pool.query(`
      SELECT
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME = 'kr_hr_invoices'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `)

    fks.forEach((fk: any) => {
      console.log(`✓ ${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`)
    })

    console.log('\n✅ Migration completed!')
    console.log('\nForeign Key Relationship:')
    console.log('  kr_hr_invoices.pdo_number -> production_orders.pdoNo')
    console.log('  ON DELETE SET NULL (if PDO is deleted, invoice pdo_number becomes NULL)')
    console.log('  ON UPDATE CASCADE (if PDO number changes, invoice pdo_number updates automatically)')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

migrate()
