/**
 * Run once to seed Pavinee's HR employee record.
 * Usage: npx ts-node scripts/seed-pavinee-hr.ts
 */

import { pool } from '../lib/mysql'

async function seed() {
  const [rows]: any = await pool.query('SELECT employeeId FROM hr_employees WHERE username = ? AND employeeId = ?', ['pavinee', 'EMP-TH-0001'])
  if (rows.length > 0) {
    console.log('Record already exists for username=pavinee. Skipping.')
    await pool.end()
    return
  }

  await pool.query(
    `INSERT INTO hr_employees
      (employeeId, username, affix, firstName, lastName, firstNameTh, lastNameTh,
       jobTitle, gender, birthDate, contactNumber, startDate, probationEnd,
       employeeStatus, monthlySalary, bankName, bankAccount, branch,
       annualLeaveEntitlement, annualLeaveCarryForward, annualLeaveUsed,
       sickLeaveEntitlement, sickLeaveUsed,
       personalLeaveEntitlement, personalLeaveUsed)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      'EMP-TH-0001',
      'pavinee',
      'Ms.',
      'Paranya',
      'Jantraporn',
      null,
      null,
      'Country Manager',
      'Female',
      '1968-05-21',
      '064 480 8555',
      '2025-01-01',
      '2025-12-29',
      'Permanent',
      50000.00,
      'Kasikorn',
      '036-2-0364-0',
      'Thailand',
      6,   // annualLeaveEntitlement
      0,   // annualLeaveCarryForward
      0,   // annualLeaveUsed
      30,  // sickLeaveEntitlement
      0,   // sickLeaveUsed
      3,   // personalLeaveEntitlement
      0,   // personalLeaveUsed
    ]
  )
  console.log('Seeded Pavinee Jantrasom (EMP-THL-0001) into hr_employees.')
  await pool.end()
}

seed().catch(e => { console.error(e); process.exit(1) })
