import { pool } from '../lib/mysql'

async function check() {
  try {
    console.log('Checking Chart of Accounts and Journal structure...\n')

    // Check acc_chart_of_accounts
    console.log('=== acc_chart_of_accounts ===')
    const [coaCols]: any = await pool.query('DESCRIBE acc_chart_of_accounts')
    coaCols.forEach((col: any) => {
      console.log(`  ${col.Field}: ${col.Type}`)
    })

    // Sample data
    const [coa]: any = await pool.query('SELECT * FROM acc_chart_of_accounts ORDER BY code LIMIT 10')
    console.log('\nSample accounts:')
    coa.forEach((acc: any) => {
      console.log(`  ${acc.code} - ${acc.name_th} (${acc.account_type})`)
    })

    // Check acc_journal_lines
    console.log('\n=== acc_journal_lines ===')
    const [jlCols]: any = await pool.query('DESCRIBE acc_journal_lines')
    jlCols.forEach((col: any) => {
      console.log(`  ${col.Field}: ${col.Type}`)
    })

    // Check for common account codes for payments
    console.log('\n=== Common Payment Account Codes ===')
    const [paymentAccs]: any = await pool.query(`
      SELECT code, name_th, name_en, account_type
      FROM acc_chart_of_accounts
      WHERE name_th LIKE '%จ่าย%'
         OR name_th LIKE '%เงินสด%'
         OR name_th LIKE '%ธนาคาร%'
         OR name_th LIKE '%เจ้าหนี้%'
         OR name_en LIKE '%cash%'
         OR name_en LIKE '%bank%'
         OR name_en LIKE '%payable%'
      ORDER BY code
      LIMIT 20
    `)

    if (paymentAccs.length > 0) {
      paymentAccs.forEach((acc: any) => {
        console.log(`  ${acc.code} - ${acc.name_th} / ${acc.name_en} (${acc.account_type})`)
      })
    } else {
      console.log('  No payment-related accounts found')
    }

    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

check()
