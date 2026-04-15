import { pool } from '../lib/mysql'

async function migrate() {
  try {
    console.log('Adding Foreign Keys to quotations table...')

    // Step 1: Add columns
    console.log('Step 1: Adding columns...')
    await pool.query(`
      ALTER TABLE quotations
        ADD COLUMN IF NOT EXISTS pre_install_formID INT NULL AFTER cusID,
        ADD COLUMN IF NOT EXISTS power_calc_id INT NULL AFTER pre_install_formID
    `)
    console.log('✓ Columns added')

    // Step 2: Add indexes
    console.log('Step 2: Adding indexes...')
    try {
      await pool.query('ALTER TABLE quotations ADD INDEX idx_cusID (cusID)')
    } catch (e: any) {
      if (e.code !== 'ER_DUP_KEYNAME') throw e
      console.log('  idx_cusID already exists')
    }
    try {
      await pool.query('ALTER TABLE quotations ADD INDEX idx_pre_install_formID (pre_install_formID)')
    } catch (e: any) {
      if (e.code !== 'ER_DUP_KEYNAME') throw e
      console.log('  idx_pre_install_formID already exists')
    }
    try {
      await pool.query('ALTER TABLE quotations ADD INDEX idx_power_calc_id (power_calc_id)')
    } catch (e: any) {
      if (e.code !== 'ER_DUP_KEYNAME') throw e
      console.log('  idx_power_calc_id already exists')
    }
    console.log('✓ Indexes added')

    // Step 3: Clean up orphaned records
    console.log('Step 3: Cleaning up orphaned records...')

    // Check and fix cusID
    const [orphanedCus]: any = await pool.query(`
      SELECT COUNT(*) as count FROM quotations
      WHERE cusID IS NOT NULL
        AND cusID NOT IN (SELECT cusID FROM cus_detail)
    `)
    if (orphanedCus[0].count > 0) {
      console.log(`  Found ${orphanedCus[0].count} quotations with invalid cusID`)
      await pool.query(`
        UPDATE quotations
        SET cusID = NULL
        WHERE cusID IS NOT NULL
          AND cusID NOT IN (SELECT cusID FROM cus_detail)
      `)
      console.log('  ✓ Fixed orphaned cusID records')
    }

    // Step 4: Add Foreign Keys
    console.log('Step 4: Adding Foreign Keys...')
    try {
      await pool.query(`
        ALTER TABLE quotations
          ADD CONSTRAINT fk_quotations_customer
            FOREIGN KEY (cusID)
            REFERENCES cus_detail(cusID)
            ON DELETE SET NULL
            ON UPDATE CASCADE
      `)
      console.log('✓ fk_quotations_customer added')
    } catch (e: any) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log('  fk_quotations_customer already exists')
      } else {
        throw e
      }
    }

    try {
      await pool.query(`
        ALTER TABLE quotations
          ADD CONSTRAINT fk_quotations_pre_installation
            FOREIGN KEY (pre_install_formID)
            REFERENCES pre_installation_forms(formID)
            ON DELETE SET NULL
            ON UPDATE CASCADE
      `)
      console.log('✓ fk_quotations_pre_installation added')
    } catch (e: any) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log('  fk_quotations_pre_installation already exists')
      } else {
        throw e
      }
    }

    try {
      await pool.query(`
        ALTER TABLE quotations
          ADD CONSTRAINT fk_quotations_power_calculation
            FOREIGN KEY (power_calc_id)
            REFERENCES power_calculations(calcID)
            ON DELETE SET NULL
            ON UPDATE CASCADE
      `)
      console.log('✓ fk_quotations_power_calculation added')
    } catch (e: any) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log('  fk_quotations_power_calculation already exists')
      } else {
        throw e
      }
    }

    console.log('\n✓ All Foreign Keys added successfully!')

    // Verify
    console.log('\nVerifying Foreign Keys...')
    const [rows]: any = await pool.query(`
      SELECT
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'quotations'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `)

    console.log('\nForeign Keys in quotations table:')
    rows.forEach((row: any) => {
      console.log(`  ${row.CONSTRAINT_NAME}: ${row.COLUMN_NAME} -> ${row.REFERENCED_TABLE_NAME}(${row.REFERENCED_COLUMN_NAME})`)
    })

    process.exit(0)
  } catch (error) {
    console.error('✗ Migration failed:', error)
    process.exit(1)
  }
}

migrate()
