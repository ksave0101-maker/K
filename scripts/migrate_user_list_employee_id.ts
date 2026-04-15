/**
 * Migration: Add employeeId column to user_list
 * - Adds employeeId varchar(100) UNIQUE NULL
 * - Adds unique index idx_user_list_employee_id
 * - Auto-populates Thailand users: EMP-TH-{userId padded 4 digits}
 * - vacation_leave_requests.employeeId can then be treated as a logical FK
 *
 * Run: npx ts-node -P tsconfig.json scripts/migrate_user_list_employee_id.ts
 */

import { pool } from '../lib/mysql'

async function migrate() {
  try {
    console.log('Migration: user_list.employeeId\n')

    // ===== Step 1: Add employeeId column =====
    console.log('Step 1: Adding employeeId column to user_list...')
    try {
      await pool.query(`
        ALTER TABLE user_list
          ADD COLUMN employeeId VARCHAR(100) COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL
      `)
      console.log('✓ employeeId column added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠ employeeId column already exists, skipping')
      } else {
        throw err
      }
    }

    // ===== Step 2: Add unique index =====
    console.log('\nStep 2: Adding unique index on employeeId...')
    try {
      await pool.query(`
        ALTER TABLE user_list
          ADD UNIQUE INDEX idx_user_list_employee_id (employeeId)
      `)
      console.log('✓ Unique index added')
    } catch (err: any) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠ Index already exists, skipping')
      } else {
        throw err
      }
    }

    // ===== Step 3: Populate Thailand users =====
    console.log('\nStep 3: Auto-populating employeeId for Thailand users (site LIKE %Thailand%)...')
    const [result]: any = await pool.query(`
      UPDATE user_list
      SET employeeId = CONCAT('EMP-TH-', LPAD(userId, 4, '0'))
      WHERE (site LIKE '%Thailand%' OR site LIKE '%thailand%')
        AND (employeeId IS NULL OR employeeId = '')
    `)
    console.log(`✓ Updated ${result.affectedRows} Thailand user(s)`)

    // ===== Step 4: Show current state =====
    console.log('\nStep 4: Current employeeId assignments:')
    const [rows]: any = await pool.query(`
      SELECT userId, userName, name, site, employeeId
      FROM user_list
      WHERE employeeId IS NOT NULL
      ORDER BY userId
      LIMIT 50
    `)
    rows.forEach((r: any) => {
      console.log(`  userId=${r.userId}  ${String(r.userName).padEnd(20)}  ${String(r.name || '').padEnd(25)}  site=${r.site}  employeeId=${r.employeeId}`)
    })

    console.log('\n✅ Migration complete.')
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message)
    process.exit(1)
  } finally {
    await pool.end().catch(() => {})
  }
}

migrate()
