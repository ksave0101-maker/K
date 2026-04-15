import { pool } from '../lib/mysql'

async function migrate() {
  try {
    console.log('Adding Extended Foreign Keys for Korea HR Invoices...\n')

    // ===== 1. Add customer_id to kr_hr_invoices =====
    console.log('Step 1: Adding customer_id field...')
    try {
      await pool.query(`
        ALTER TABLE kr_hr_invoices
          ADD COLUMN customer_id INT NULL AFTER customer
      `)
      console.log('✓ customer_id field added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ customer_id field already exists')
      } else {
        throw err
      }
    }

    try {
      await pool.query(`
        ALTER TABLE kr_hr_invoices
          ADD INDEX idx_customer_id (customer_id)
      `)
      console.log('✓ customer_id index added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ customer_id index already exists')
      } else {
        throw err
      }
    }

    try {
      await pool.query(`
        ALTER TABLE kr_hr_invoices
          ADD CONSTRAINT fk_kr_hr_invoices_customer
            FOREIGN KEY (customer_id)
            REFERENCES kr_customers(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
      `)
      console.log('✓ customer FK added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_CANT_CREATE_TABLE') {
        console.log('⚠ customer FK already exists')
      } else {
        throw err
      }
    }

    // ===== 2. Add contract_id to kr_hr_invoices =====
    console.log('\nStep 2: Adding contract_id and contract_type fields...')
    try {
      await pool.query(`
        ALTER TABLE kr_hr_invoices
          ADD COLUMN contract_id INT NULL AFTER salesContractNumber,
          ADD COLUMN contract_type ENUM('domestic', 'international') NULL AFTER contract_id
      `)
      console.log('✓ contract fields added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ contract fields already exist')
      } else {
        throw err
      }
    }

    try {
      await pool.query(`
        ALTER TABLE kr_hr_invoices
          ADD INDEX idx_contract_id (contract_id)
      `)
      console.log('✓ contract_id index added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ contract_id index already exists')
      } else {
        throw err
      }
    }

    // ===== 3. Add korea_invoice_id to acc_payment_vouchers =====
    console.log('\nStep 3: Adding korea_invoice_id to acc_payment_vouchers...')
    try {
      await pool.query(`
        ALTER TABLE acc_payment_vouchers
          ADD COLUMN korea_invoice_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER description
      `)
      console.log('✓ korea_invoice_id field added to acc_payment_vouchers')
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ korea_invoice_id field already exists in acc_payment_vouchers')
        // Try to modify the column to fix collation
        await pool.query(`
          ALTER TABLE acc_payment_vouchers
            MODIFY COLUMN korea_invoice_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL
        `)
        console.log('✓ korea_invoice_id collation fixed')
      } else {
        throw err
      }
    }

    try {
      await pool.query(`
        ALTER TABLE acc_payment_vouchers
          ADD INDEX idx_korea_invoice_id (korea_invoice_id)
      `)
      console.log('✓ korea_invoice_id index added to acc_payment_vouchers')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ korea_invoice_id index already exists in acc_payment_vouchers')
      } else {
        throw err
      }
    }

    try {
      await pool.query(`
        ALTER TABLE acc_payment_vouchers
          ADD CONSTRAINT fk_acc_payment_vouchers_korea_invoice
            FOREIGN KEY (korea_invoice_id)
            REFERENCES kr_hr_invoices(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
      `)
      console.log('✓ korea_invoice FK added to acc_payment_vouchers')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ korea_invoice FK already exists in acc_payment_vouchers')
      } else {
        throw err
      }
    }

    // ===== 4. Add korea_invoice_id to payment_vouchers =====
    console.log('\nStep 4: Adding korea_invoice_id to payment_vouchers...')
    try {
      await pool.query(`
        ALTER TABLE payment_vouchers
          ADD COLUMN korea_invoice_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER notes
      `)
      console.log('✓ korea_invoice_id field added to payment_vouchers')
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ korea_invoice_id field already exists in payment_vouchers')
        // Try to modify the column to fix collation
        await pool.query(`
          ALTER TABLE payment_vouchers
            MODIFY COLUMN korea_invoice_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL
        `)
        console.log('✓ korea_invoice_id collation fixed')
      } else {
        throw err
      }
    }

    try {
      await pool.query(`
        ALTER TABLE payment_vouchers
          ADD INDEX idx_korea_invoice_id (korea_invoice_id)
      `)
      console.log('✓ korea_invoice_id index added to payment_vouchers')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ korea_invoice_id index already exists in payment_vouchers')
      } else {
        throw err
      }
    }

    try {
      await pool.query(`
        ALTER TABLE payment_vouchers
          ADD CONSTRAINT fk_payment_vouchers_korea_invoice
            FOREIGN KEY (korea_invoice_id)
            REFERENCES kr_hr_invoices(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
      `)
      console.log('✓ korea_invoice FK added to payment_vouchers')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ korea_invoice FK already exists in payment_vouchers')
      } else {
        throw err
      }
    }

    // ===== Verification =====
    console.log('\n=== Verification ===')
    const [fks]: any = await pool.query(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'ksystem'
        AND (
          (TABLE_NAME = 'kr_hr_invoices' AND REFERENCED_TABLE_NAME IS NOT NULL)
          OR (TABLE_NAME = 'kr_hr_invoice_items' AND REFERENCED_TABLE_NAME IS NOT NULL)
          OR (TABLE_NAME = 'acc_payment_vouchers' AND COLUMN_NAME = 'korea_invoice_id')
          OR (TABLE_NAME = 'payment_vouchers' AND COLUMN_NAME = 'korea_invoice_id')
        )
      ORDER BY TABLE_NAME, COLUMN_NAME
    `)

    console.log('\nForeign Keys:')
    fks.forEach((fk: any) => {
      console.log(`  ✓ ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`)
    })

    console.log('\n✅ Migration completed successfully!')
    console.log('\nNote: contract_id does not have FK constraint due to polymorphic relationship.')
    console.log('Use application logic to link to kr_domestic_contracts or kr_int_contracts based on contract_type.')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    console.error('Error code:', error.code)
    process.exit(1)
  }
}

migrate()
