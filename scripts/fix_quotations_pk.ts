import { pool } from '../lib/mysql'

async function fix() {
  try {
    console.log('Fixing quotations table PRIMARY KEY...\n')

    // Check if there are any duplicate quoteIDs first
    const [duplicates]: any = await pool.query(`
      SELECT quoteID, COUNT(*) as count
      FROM quotations
      GROUP BY quoteID
      HAVING count > 1
    `)

    if (duplicates.length > 0) {
      console.log('Found duplicate quoteIDs:')
      duplicates.forEach((dup: any) => {
        console.log(`  quoteID ${dup.quoteID}: ${dup.count} records`)
      })

      console.log('\nCleaning up duplicates...')
      // Keep only the latest record for each quoteID
      await pool.query(`
        DELETE t1 FROM quotations t1
        INNER JOIN quotations t2
        WHERE t1.quoteID = t2.quoteID
          AND t1.created_at < t2.created_at
      `)
      console.log('✓ Duplicates removed')
    }

    // Modify quoteID to AUTO_INCREMENT and add PRIMARY KEY
    console.log('Adding AUTO_INCREMENT and PRIMARY KEY...')
    await pool.query(`
      ALTER TABLE quotations
        MODIFY COLUMN quoteID INT NOT NULL AUTO_INCREMENT,
        ADD PRIMARY KEY (quoteID)
    `)

    console.log('✓ PRIMARY KEY added successfully!')

    // Verify
    const [result]: any = await pool.query('DESCRIBE quotations')
    const quoteIDCol = result.find((col: any) => col.Field === 'quoteID')

    console.log('\nVerification:')
    console.log(`  quoteID Extra: ${quoteIDCol.Extra}`)
    console.log(`  quoteID Key: ${quoteIDCol.Key}`)

    process.exit(0)
  } catch (error: any) {
    if (error.code === 'ER_MULTIPLE_PRI_KEY') {
      console.log('PRIMARY KEY already exists, skipping...')
      process.exit(0)
    }
    console.error('✗ Error:', error)
    process.exit(1)
  }
}

fix()
