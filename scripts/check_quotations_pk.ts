import { pool } from '../lib/mysql'

async function check() {
  try {
    console.log('Checking quotations table structure...\n')

    // Check table structure
    const [columns]: any = await pool.query('DESCRIBE quotations')

    console.log('Current quoteID column:')
    const quoteIDCol = columns.find((col: any) => col.Field === 'quoteID')
    if (quoteIDCol) {
      console.log(`  Field: ${quoteIDCol.Field}`)
      console.log(`  Type: ${quoteIDCol.Type}`)
      console.log(`  Null: ${quoteIDCol.Null}`)
      console.log(`  Key: ${quoteIDCol.Key}`)
      console.log(`  Default: ${quoteIDCol.Default}`)
      console.log(`  Extra: ${quoteIDCol.Extra}`)
    }

    // Check primary key
    const [keys]: any = await pool.query(`
      SELECT COLUMN_NAME, CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'quotations'
        AND CONSTRAINT_NAME = 'PRIMARY'
    `)

    console.log('\nPrimary Key:')
    if (keys.length > 0) {
      keys.forEach((key: any) => {
        console.log(`  ✓ ${key.COLUMN_NAME}`)
      })
    } else {
      console.log('  ❌ No PRIMARY KEY found!')
    }

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

check()
