import { pool } from '../lib/mysql'

async function check() {
  try {
    console.log('Checking kr_hr_invoices table...\n')

    const [rows]: any = await pool.query('SELECT * FROM kr_hr_invoices LIMIT 10')
    console.log('Total invoices found:', rows.length)

    if (rows.length > 0) {
      console.log('\nSample data:')
      console.log(JSON.stringify(rows, null, 2))
    }

    const [unpaid]: any = await pool.query(`
      SELECT COUNT(*) as count
      FROM kr_hr_invoices
      WHERE paymentStatus IN ('unpaid', 'partial', 'overdue')
    `)
    console.log('\nUnpaid invoices count:', unpaid[0].count)

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

check()
