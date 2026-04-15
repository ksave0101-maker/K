import { pool } from '../lib/mysql'

async function verify() {
  try {
    console.log('Verifying Korea Invoice Data...\n')

    const [invoices]: any = await pool.query(`
      SELECT
        invoiceNumber,
        customer,
        issueDate,
        dueDate,
        totalAmount,
        paymentStatus
      FROM kr_hr_invoices
      ORDER BY issueDate
    `)

    console.log('=== Current Database Records ===\n')
    invoices.forEach((inv: any) => {
      const issueDate = inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('th-TH') : 'N/A'
      const dueDate = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('th-TH') : 'N/A'

      console.log(`Invoice: ${inv.invoiceNumber}`)
      console.log(`  Customer: ${inv.customer}`)
      console.log(`  Issue Date: ${issueDate}`)
      console.log(`  Due Date: ${dueDate}`)
      console.log(`  Amount: $${Number(inv.totalAmount || 0).toFixed(2)}`)
      console.log(`  Status: ${inv.paymentStatus}`)
      console.log('')
    })

    console.log('\n=== Expected Data (from user) ===\n')
    const expected = [
      { no: 'KR-INV-20260215-0001', issue: '15/2/2569', due: '15/3/2569', amount: 22814.81, status: 'overdue' },
      { no: 'KR-INV-20260301-0001', issue: '1/3/2569', due: '31/3/2569', amount: 40740.74, status: 'unpaid' },
      { no: 'KR-INV-20260310-0001', issue: '10/3/2569', due: '10/4/2569', amount: 28518.52, status: 'partial' },
      { no: 'KR-INV-20260320-0001', issue: '20/3/2569', due: '20/4/2569', amount: 34222.22, status: 'unpaid' }
    ]

    expected.forEach(exp => {
      console.log(`Invoice: ${exp.no}`)
      console.log(`  Issue: ${exp.issue}, Due: ${exp.due}`)
      console.log(`  Amount: $${exp.amount.toFixed(2)}`)
      console.log(`  Status: ${exp.status}`)
      console.log('')
    })

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

verify()
