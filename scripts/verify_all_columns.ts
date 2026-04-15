import { pool } from '../lib/mysql'

async function verify() {
  try {
    console.log('Verifying all column names in quotations table...\n')

    const [columns]: any = await pool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'quotations'
      ORDER BY ORDINAL_POSITION
    `)

    console.log('All columns in quotations table:')
    console.log('================================')
    columns.forEach((col: any, idx: number) => {
      console.log(`${String(idx + 1).padStart(2, ' ')}. ${col.COLUMN_NAME}`)
    })

    // Check specific columns used in API
    const expectedCols = [
      'quoteID', 'quoteNo', 'quoteDate', 'cusID',
      'customer_name', 'customer_email', 'customer_phone',
      'customer_address', 'customer_company', 'customer_tax_id',
      'pre_install_formID', 'power_calc_id',
      'items', 'subtotal', 'discount_percent', 'discount', 'vat', 'total',
      'status', 'notes', 'created_by', 'created_at'
    ]

    console.log('\n\nChecking expected columns:')
    console.log('==========================')
    const actualCols = columns.map((c: any) => c.COLUMN_NAME)
    expectedCols.forEach(col => {
      const exists = actualCols.includes(col)
      console.log(`${exists ? '✓' : '✗'} ${col}`)
    })

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

verify()
