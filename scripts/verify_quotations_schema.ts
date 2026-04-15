import { pool } from '../lib/mysql'

async function verify() {
  try {
    console.log('Verifying quotations table schema...\n')

    const [columns]: any = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'quotations'
        AND COLUMN_NAME IN (
          'customer_address', 'customer_company', 'customer_tax_id',
          'discount_percent', 'pre_install_formID', 'power_calc_id'
        )
      ORDER BY COLUMN_NAME
    `)

    console.log('New columns in quotations table:')
    console.log('================================')
    columns.forEach((col: any) => {
      console.log(`✓ ${col.COLUMN_NAME} (${col.DATA_TYPE}) - Nullable: ${col.IS_NULLABLE}`)
    })

    if (columns.length === 0) {
      console.log('❌ No new columns found!')
    } else {
      console.log(`\n✅ Found ${columns.length}/6 expected columns`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

verify()
