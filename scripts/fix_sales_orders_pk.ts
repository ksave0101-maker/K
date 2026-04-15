import { pool } from '../lib/mysql'

async function fix() {
  try {
    console.log('Fixing sales_orders table PRIMARY KEY...\n')

    // Check for duplicates first
    const [duplicates]: any = await pool.query(`
      SELECT orderID, COUNT(*) as count
      FROM sales_orders
      GROUP BY orderID
      HAVING count > 1
    `)

    if (duplicates.length > 0) {
      console.log('Found duplicate orderIDs:')
      duplicates.forEach((dup: any) => {
        console.log(`  orderID ${dup.orderID}: ${dup.count} records`)
      })

      console.log('\n⚠ Please clean up duplicates manually before adding PRIMARY KEY')
      process.exit(1)
    }

    // Add AUTO_INCREMENT and PRIMARY KEY
    console.log('Adding AUTO_INCREMENT and PRIMARY KEY to orderID...')
    await pool.query(`
      ALTER TABLE sales_orders
        MODIFY COLUMN orderID INT NOT NULL AUTO_INCREMENT,
        ADD PRIMARY KEY (orderID)
    `)

    console.log('✓ PRIMARY KEY added successfully!')

    // Verify
    const [result]: any = await pool.query('DESCRIBE sales_orders')
    const orderIDCol = result.find((col: any) => col.Field === 'orderID')

    console.log('\nVerification:')
    console.log(`  orderID Extra: ${orderIDCol.Extra}`)
    console.log(`  orderID Key: ${orderIDCol.Key}`)

    console.log('\n✅ Sales orders table fixed!')
    process.exit(0)
  } catch (error: any) {
    if (error.code === 'ER_MULTIPLE_PRI_KEY') {
      console.log('⚠ PRIMARY KEY already exists')
      process.exit(0)
    }
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

fix()
