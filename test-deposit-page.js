// Test if deposit API is working
const mysql = require('mysql2/promise')

const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'ksystem',
  password: 'Ksave2025Admin',
  database: 'ksystem',
}

async function testDepositAPI() {
  let connection
  try {
    console.log('🔌 Connecting to database...')
    connection = await mysql.createConnection(dbConfig)
    console.log('✅ Connected!')

    // Test query for deposit
    console.log('\n📊 Testing deposit query...')
    const query = `
      SELECT si.*, c.name_th as customer_name
      FROM acc_sales_invoices si
      LEFT JOIN acc_customers c ON si.customer_id = c.id
      WHERE si.doc_type = 'deposit'
      ORDER BY si.doc_date DESC, si.id DESC
      LIMIT 10
    `
    const [rows] = await connection.execute(query)

    console.log(`✅ Query successful! Found ${rows.length} deposit records`)
    if (rows.length > 0) {
      console.log('\n📄 Sample record:')
      console.log(rows[0])
    } else {
      console.log('ℹ️  No deposit records found (this is OK for first time)')
    }

    // Check table structure
    console.log('\n📋 Checking table structure...')
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM acc_sales_invoices
    `)
    console.log('✅ Table columns:')
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n🔌 Connection closed')
    }
  }
}

testDepositAPI()
