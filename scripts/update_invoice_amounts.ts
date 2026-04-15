import { pool } from '../lib/mysql'

async function updateAmounts() {
  try {
    console.log('Updating Korea Invoice Amounts to USD...\n')

    // Correct invoice amounts from user's data
    const updates = [
      { invoiceNumber: 'KR-INV-20260215-0001', totalAmount: 22814.81 },
      { invoiceNumber: 'KR-INV-20260301-0001', totalAmount: 40740.74 },
      { invoiceNumber: 'KR-INV-20260310-0001', totalAmount: 28518.52 },
      { invoiceNumber: 'KR-INV-20260320-0001', totalAmount: 34222.22 }
    ]

    for (const update of updates) {
      // Calculate subtotal and tax (assuming 10% VAT)
      const taxRate = 10
      const totalAmount = update.totalAmount
      const subtotal = totalAmount / 1.1  // Remove 10% VAT
      const taxAmount = totalAmount - subtotal

      console.log(`Updating ${update.invoiceNumber}:`)
      console.log(`  Subtotal: $${subtotal.toFixed(2)}`)
      console.log(`  Tax (10%): $${taxAmount.toFixed(2)}`)
      console.log(`  Total: $${totalAmount.toFixed(2)}`)

      await pool.query(`
        UPDATE kr_hr_invoices
        SET subtotal = ?,
            taxRate = ?,
            taxAmount = ?,
            totalAmount = ?
        WHERE invoiceNumber = ?
      `, [subtotal, taxRate, taxAmount, totalAmount, update.invoiceNumber])

      console.log('  ✓ Updated\n')
    }

    // Verify updates
    console.log('=== Verification ===\n')
    const [invoices]: any = await pool.query(`
      SELECT invoiceNumber, subtotal, taxAmount, totalAmount, paymentStatus
      FROM kr_hr_invoices
      ORDER BY issueDate
    `)

    invoices.forEach((inv: any) => {
      console.log(`${inv.invoiceNumber}:`)
      console.log(`  Subtotal: $${Number(inv.subtotal || 0).toFixed(2)}`)
      console.log(`  Tax: $${Number(inv.taxAmount || 0).toFixed(2)}`)
      console.log(`  Total: $${Number(inv.totalAmount || 0).toFixed(2)}`)
      console.log(`  Status: ${inv.paymentStatus}\n`)
    })

    console.log('✅ All invoice amounts updated successfully!')

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

updateAmounts()
