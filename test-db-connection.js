// Test Database Connection
// Run: node test-db-connection.js

const mysql = require('mysql2/promise')

async function testConnection() {
  console.log('🔍 Testing Database Connection...\n')

  let connection

  try {
    // 1. Test MySQL Connection
    console.log('1️⃣ Connecting to MySQL...')
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'ksystem',
      password: process.env.MYSQL_PASSWORD || 'Ksave2025Admin',
      connectTimeout: 10000
    })
    console.log('   ✅ MySQL connection successful!\n')

    // 2. Test Database Exists
    console.log('2️⃣ Checking database "ksystem"...')
    const [databases] = await connection.query(
      "SHOW DATABASES LIKE 'ksystem'"
    )
    if (databases.length > 0) {
      console.log('   ✅ Database "ksystem" exists!\n')
    } else {
      console.log('   ❌ Database "ksystem" NOT found!\n')
      return
    }

    // 3. Switch to ksystem database
    await connection.query('USE ksystem')

    // 4. Test contracts table
    console.log('3️⃣ Checking table "contracts"...')
    try {
      const [contractsCheck] = await connection.query(
        "SHOW TABLES LIKE 'contracts'"
      )
      if (contractsCheck.length > 0) {
        console.log('   ✅ Table "contracts" exists!')

        const [contractsCount] = await connection.query(
          'SELECT COUNT(*) as total FROM contracts'
        )
        console.log(`   📊 Total contracts: ${contractsCount[0].total}`)

        const [activeContracts] = await connection.query(
          'SELECT COUNT(*) as total FROM contracts WHERE status = "active"'
        )
        console.log(`   ✅ Active contracts: ${activeContracts[0].total}\n`)

        // Show sample contracts
        if (contractsCount[0].total > 0) {
          console.log('   📋 Sample contracts:')
          const [samples] = await connection.query(
            'SELECT contractID, contractNo, customer_name, status FROM contracts LIMIT 3'
          )
          samples.forEach(c => {
            console.log(`      - ${c.contractNo} | ${c.customer_name} | ${c.status}`)
          })
          console.log()
        }
      } else {
        console.log('   ❌ Table "contracts" NOT found!\n')
      }
    } catch (err) {
      console.log('   ❌ Error checking contracts:', err.message, '\n')
    }

    // 5. Test warranties table
    console.log('4️⃣ Checking table "warranties"...')
    try {
      const [warrantiesCheck] = await connection.query(
        "SHOW TABLES LIKE 'warranties'"
      )
      if (warrantiesCheck.length > 0) {
        console.log('   ✅ Table "warranties" exists!')

        const [warrantiesCount] = await connection.query(
          'SELECT COUNT(*) as total FROM warranties'
        )
        console.log(`   📊 Total warranties: ${warrantiesCount[0].total}`)

        // Check if contract_no column exists
        const [columns] = await connection.query(
          "SHOW COLUMNS FROM warranties LIKE 'contract_no'"
        )
        if (columns.length > 0) {
          console.log('   ✅ Column "contract_no" exists in warranties')
        } else {
          console.log('   ⚠️  Column "contract_no" NOT found in warranties')
          console.log('   → Run: alter_warranties_add_contract_no.sql')
        }
        console.log()
      } else {
        console.log('   ❌ Table "warranties" NOT found!')
        console.log('   → Run: setup_all_documents.sql or fix_missing_tables.sql\n')
      }
    } catch (err) {
      console.log('   ❌ Error checking warranties:', err.message, '\n')
    }

    // 6. Test document_counters table
    console.log('5️⃣ Checking table "document_counters"...')
    try {
      const [countersCheck] = await connection.query(
        "SHOW TABLES LIKE 'document_counters'"
      )
      if (countersCheck.length > 0) {
        console.log('   ✅ Table "document_counters" exists!')
        const [countersCount] = await connection.query(
          'SELECT COUNT(*) as total FROM document_counters'
        )
        console.log(`   📊 Total counters: ${countersCount[0].total}\n`)
      } else {
        console.log('   ❌ Table "document_counters" NOT found!\n')
      }
    } catch (err) {
      console.log('   ❌ Error checking document_counters:', err.message, '\n')
    }

    console.log('✅ Database connection test completed!\n')

  } catch (error) {
    console.error('❌ Connection Error:', error.message)
    console.error('\nTroubleshooting:')
    console.error('1. Check MySQL is running: sudo systemctl status mysql')
    console.error('2. Check credentials in /lib/mysql.ts')
    console.error('3. Check user permissions: GRANT ALL ON ksystem.* TO \'ksystem\'@\'localhost\';')
  } finally {
    if (connection) {
      await connection.end()
      console.log('🔌 Connection closed.')
    }
  }
}

testConnection()
