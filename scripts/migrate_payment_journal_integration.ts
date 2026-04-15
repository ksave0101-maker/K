import { pool } from '../lib/mysql'

async function migrate() {
  try {
    console.log('Integrating Payment Vouchers with Accounting Journal...\n')

    // Step 1: Add accounting code columns
    console.log('Step 1: Adding accounting code columns...')
    try {
      await pool.query(`
        ALTER TABLE acc_payment_vouchers
          ADD COLUMN debit_account VARCHAR(20) NULL COMMENT 'Chart of accounts code for debit side',
          ADD COLUMN credit_account VARCHAR(20) NULL COMMENT 'Chart of accounts code for credit side (bank/cash)'
      `)
      console.log('✓ Accounting code columns added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ Accounting code columns already exist')
      } else {
        throw err
      }
    }

    // Step 2: Add indexes
    console.log('\nStep 2: Adding indexes...')
    const indexes = [
      { name: 'idx_entry_id', column: 'entry_id' },
      { name: 'idx_debit_account', column: 'debit_account' },
      { name: 'idx_credit_account', column: 'credit_account' }
    ]

    for (const idx of indexes) {
      try {
        await pool.query(`
          ALTER TABLE acc_payment_vouchers
            ADD INDEX ${idx.name} (${idx.column})
        `)
        console.log(`✓ Index ${idx.name} added`)
      } catch (err: any) {
        if (err.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠ Index ${idx.name} already exists`)
        } else {
          throw err
        }
      }
    }

    // Step 3: Add Foreign Key
    console.log('\nStep 3: Adding Foreign Key to journal entries...')
    try {
      await pool.query(`
        ALTER TABLE acc_payment_vouchers
          ADD CONSTRAINT fk_payment_vouchers_journal_entry
            FOREIGN KEY (entry_id)
            REFERENCES acc_journal_entries(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
      `)
      console.log('✓ Foreign Key added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_CANT_CREATE_TABLE') {
        console.log('⚠ Foreign Key already exists')
      } else {
        throw err
      }
    }

    // Step 4: Set default accounting codes for existing payments
    console.log('\nStep 4: Setting default accounting codes...')
    await pool.query(`
      UPDATE acc_payment_vouchers
      SET
        debit_account = '2100',  -- Accounts Payable
        credit_account = '1110'  -- Bank Deposit
      WHERE debit_account IS NULL
        AND voucher_type = 'pay'
        AND status = 'posted'
    `)
    console.log('✓ Default codes set for posted payments')

    // Verification
    console.log('\n=== Verification ===')
    const [fks]: any = await pool.query(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME = 'acc_payment_vouchers'
        AND COLUMN_NAME = 'entry_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `)

    if (fks.length > 0) {
      console.log(`✓ FK: entry_id -> ${fks[0].REFERENCED_TABLE_NAME}.${fks[0].REFERENCED_COLUMN_NAME}`)
    }

    const [cols]: any = await pool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'ksystem'
        AND TABLE_NAME = 'acc_payment_vouchers'
        AND COLUMN_NAME IN ('debit_account', 'credit_account')
    `)
    console.log(`✓ Accounting code columns: ${cols.map((c: any) => c.COLUMN_NAME).join(', ')}`)

    console.log('\n✅ Migration completed successfully!')
    console.log('\nNext steps:')
    console.log('  1. Update payment form to select accounting codes')
    console.log('  2. Create automatic journal entry posting')
    console.log('  3. Link to Cash Disbursements Journal report')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    console.error('Error code:', error.code)
    process.exit(1)
  }
}

migrate()
