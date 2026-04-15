import { pool } from '../lib/mysql'

async function check() {
  try {
    const [cols]: any = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, NUMERIC_PRECISION, NUMERIC_SCALE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME = 'kr_hr_invoices'
        AND COLUMN_NAME IN ('subtotal', 'taxAmount', 'totalAmount')
    `)

    console.log('=== Column Types ===')
    cols.forEach((col: any) => {
      console.log(`${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (precision: ${col.NUMERIC_PRECISION}, scale: ${col.NUMERIC_SCALE})`)
    })

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

check()
