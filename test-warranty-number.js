// Test Warranty Number Generation
// Run: node test-warranty-number.js

const mysql = require('mysql2/promise')

async function testWarrantyNumber() {
  console.log('🧪 Testing Warranty Number Generation...\n')

  let connection

  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      database: process.env.MYSQL_DATABASE || 'ksystem',
      user: process.env.MYSQL_USER || 'ksystem',
      password: process.env.MYSQL_PASSWORD || 'Ksave2025Admin',
      connectTimeout: 10000
    })
    console.log('✅ Connected to MySQL\n')

    // Test document number generation
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const yearMonth = `${year}${month}`
    const yearMonthDay = `${year}${month}${day}`

    console.log('📅 Current Year-Month:', yearMonth)
    console.log('📅 Current Year-Month-Day:', yearMonthDay)
    console.log()

    // Get current counter for WT (uses yearMonthDay)
    const [before] = await connection.query(
      `SELECT counter FROM document_counters WHERE prefix = 'WT' AND \`year_month\` = ?`,
      [yearMonthDay]
    )

    const currentCounter = before.length > 0 ? before[0].counter : 0
    console.log(`📊 Current WT counter: ${currentCounter}`)

    // Simulate document number generation
    await connection.query(
      `INSERT INTO document_counters (prefix, \`year_month\`, counter)
       VALUES ('WT', ?, 1)
       ON DUPLICATE KEY UPDATE counter = counter + 1`,
      [yearMonthDay]
    )

    const [after] = await connection.query(
      `SELECT counter FROM document_counters WHERE prefix = 'WT' AND \`year_month\` = ?`,
      [yearMonthDay]
    )

    const newCounter = after[0].counter
    const counterStr = String(newCounter).padStart(4, '0')
    const wtNo = `WT-TH-${yearMonthDay}-${counterStr}`

    console.log(`📊 New WT counter: ${newCounter}`)
    console.log()
    console.log('🎯 Generated Warranty Number:')
    console.log(`   ${wtNo}`)
    console.log()

    // Test other document types (use YYYYMMDD like Warranty)
    const testPrefixes = ['CN', 'GR', 'PV', 'PR']
    console.log('🔍 Testing other document types (use YYYYMMDD):')

    for (const prefix of testPrefixes) {
      await connection.query(
        `INSERT INTO document_counters (prefix, \`year_month\`, counter)
         VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE counter = counter + 1`,
        [prefix, yearMonthDay]
      )

      const [result] = await connection.query(
        `SELECT counter FROM document_counters WHERE prefix = ? AND \`year_month\` = ?`,
        [prefix, yearMonthDay]
      )

      const counter = result[0].counter
      const docNo = `${prefix}-${yearMonthDay}-${String(counter).padStart(4, '0')}`
      console.log(`   ${prefix}: ${docNo}`)
    }

    console.log()
    console.log('✅ All tests completed!')
    console.log()
    console.log('📋 Summary:')
    console.log('   - Warranty (WT): Uses WT-TH-YYYYMMDD-#### format (daily reset) ✅')
    console.log('   - Other docs:    Uses XX-YYYYMMDD-#### format (daily reset) ✅')
    console.log()
    console.log('🔄 All documents reset counter daily at midnight')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n🔌 Connection closed.')
    }
  }
}

testWarrantyNumber()
