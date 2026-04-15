import { pool } from '../lib/mysql'

async function check() {
  try {
    console.log('Checking payment tables structure...\n')

    // Check acc_payment_vouchers
    console.log('=== acc_payment_vouchers ===')
    const [pvColumns]: any = await pool.query('DESCRIBE acc_payment_vouchers')
    pvColumns.forEach((col: any) => {
      console.log(`  ${col.Field}: ${col.Type}`)
    })

    // Check payment_vouchers
    console.log('\n=== payment_vouchers ===')
    try {
      const [pv2Columns]: any = await pool.query('DESCRIBE payment_vouchers')
      pv2Columns.forEach((col: any) => {
        console.log(`  ${col.Field}: ${col.Type}`)
      })
    } catch (e) {
      console.log('  Table not found or error')
    }

    // Check if there's a field for referencing external invoices
    console.log('\n=== Checking for reference fields ===')
    const [refFields]: any = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME = 'acc_payment_vouchers'
        AND (COLUMN_NAME LIKE '%invoice%' OR COLUMN_NAME LIKE '%reference%' OR COLUMN_NAME LIKE '%korea%')
    `)

    if (refFields.length > 0) {
      refFields.forEach((f: any) => {
        console.log(`  ${f.COLUMN_NAME}: ${f.DATA_TYPE}`)
      })
    } else {
      console.log('  No reference fields found')
      console.log('  Suggestion: Add a field like "external_invoice_id" or "korea_invoice_id"')
    }

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

check()
