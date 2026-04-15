import { pool } from '../lib/mysql'

async function fix() {
  try {
    console.log('Converting amount columns to DECIMAL for USD...\n')

    // Alter columns to DECIMAL(15,2)
    console.log('Altering columns...')
    await pool.query(`
      ALTER TABLE kr_hr_invoices
        MODIFY COLUMN subtotal DECIMAL(15,2) DEFAULT 0.00,
        MODIFY COLUMN taxAmount DECIMAL(15,2) DEFAULT 0.00,
        MODIFY COLUMN totalAmount DECIMAL(15,2) DEFAULT 0.00
    `)
    console.log('✓ Columns altered to DECIMAL(15,2)\n')

    // Re-update with exact amounts
    console.log('Updating with exact USD amounts...')
    const updates = [
      { invoiceNumber: 'KR-INV-20260215-0001', totalAmount: 22814.81 },
      { invoiceNumber: 'KR-INV-20260301-0001', totalAmount: 40740.74 },
      { invoiceNumber: 'KR-INV-20260310-0001', totalAmount: 28518.52 },
      { invoiceNumber: 'KR-INV-20260320-0001', totalAmount: 34222.22 }
    ]

    for (const update of updates) {
      const taxRate = 10
      const totalAmount = update.totalAmount
      const subtotal = totalAmount / 1.1
      const taxAmount = totalAmount - subtotal

      await pool.query(`
        UPDATE kr_hr_invoices
        SET subtotal = ?,
            taxRate = ?,
            taxAmount = ?,
            totalAmount = ?
        WHERE invoiceNumber = ?
      `, [subtotal, taxRate, taxAmount, totalAmount, update.invoiceNumber])
    }
    console.log('✓ Amounts updated\n')

    // Verify
    console.log('=== Verification ===\n')
    const [invoices]: any = await pool.query(`
      SELECT invoiceNumber, subtotal, taxAmount, totalAmount
      FROM kr_hr_invoices
      ORDER BY issueDate
    `)

    invoices.forEach((inv: any) => {
      console.log(`${inv.invoiceNumber}:`)
      console.log(`  Subtotal: $${Number(inv.subtotal).toFixed(2)}`)
      console.log(`  Tax: $${Number(inv.taxAmount).toFixed(2)}`)
      console.log(`  Total: $${Number(inv.totalAmount).toFixed(2)}\n`)
    })

    console.log('✅ All amounts now stored with 2 decimal places!')

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

fix()
