import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

async function ensureHrEmployeesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hr_employees (
      empID         INT NOT NULL AUTO_INCREMENT,
      employeeId    VARCHAR(50)  COLLATE utf8mb4_unicode_ci NOT NULL,
      username      VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'FK to user_list.userName',
      affix         VARCHAR(20)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      firstName     VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
      lastName      VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
      firstNameTh   VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      lastNameTh    VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      jobTitle      VARCHAR(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      gender        ENUM('Male','Female','Other') DEFAULT NULL,
      birthDate     DATE DEFAULT NULL,
      contactNumber VARCHAR(50)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      startDate     DATE DEFAULT NULL,
      probationEnd  DATE DEFAULT NULL,
      employeeStatus ENUM('Permanent','Probation','Contract','Resigned','Terminated') DEFAULT 'Permanent',
      monthlySalary  DECIMAL(12,2) DEFAULT NULL,
      bankName       VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      bankAccount    VARCHAR(50)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      branch         VARCHAR(50)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
      -- Annual Leave 2026
      annualLeaveEntitlement INT DEFAULT 0,
      annualLeaveCarryForward INT DEFAULT 0,
      annualLeaveUsed        INT DEFAULT 0,
      -- Sick Leave 2026
      sickLeaveEntitlement INT DEFAULT 30,
      sickLeaveUsed        INT DEFAULT 0,
      -- Personal Leave 2026
      personalLeaveEntitlement INT DEFAULT 3,
      personalLeaveUsed        INT DEFAULT 0,
      -- metadata
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (empID),
      UNIQUE KEY uk_employeeId (employeeId),
      KEY idx_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `)
}

export async function GET(request: NextRequest) {
  try {
    await ensureHrEmployeesTable()

    const { searchParams } = new URL(request.url)
    const username  = searchParams.get('username')
    const empId     = searchParams.get('employeeId')
    const branch    = searchParams.get('branch')

    let query = 'SELECT * FROM hr_employees WHERE 1=1'
    const params: any[] = []

    if (username) { query += ' AND username = ?'; params.push(username) }
    if (empId)    { query += ' AND employeeId = ?'; params.push(empId) }
    if (branch)   { query += ' AND branch = ?'; params.push(branch) }

    query += ' ORDER BY empID ASC'

    const [rows]: any = await pool.query(query, params)

    return NextResponse.json({ success: true, employees: rows, total: rows.length })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureHrEmployeesTable()

    const body = await request.json()
    const {
      employeeId, username, affix, firstName, lastName, firstNameTh, lastNameTh,
      jobTitle, gender, birthDate, contactNumber, startDate, probationEnd,
      employeeStatus, monthlySalary, bankName, bankAccount, branch,
      annualLeaveEntitlement = 0, annualLeaveCarryForward = 0, annualLeaveUsed = 0,
      sickLeaveEntitlement = 30, sickLeaveUsed = 0,
      personalLeaveEntitlement = 3, personalLeaveUsed = 0,
    } = body

    if (!employeeId || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'employeeId, firstName, lastName are required' },
        { status: 400 }
      )
    }

    const [result]: any = await pool.query(
      `INSERT INTO hr_employees
        (employeeId, username, affix, firstName, lastName, firstNameTh, lastNameTh,
         jobTitle, gender, birthDate, contactNumber, startDate, probationEnd,
         employeeStatus, monthlySalary, bankName, bankAccount, branch,
         annualLeaveEntitlement, annualLeaveCarryForward, annualLeaveUsed,
         sickLeaveEntitlement, sickLeaveUsed,
         personalLeaveEntitlement, personalLeaveUsed)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        username               = VALUES(username),
        affix                  = VALUES(affix),
        firstName              = VALUES(firstName),
        lastName               = VALUES(lastName),
        firstNameTh            = VALUES(firstNameTh),
        lastNameTh             = VALUES(lastNameTh),
        jobTitle               = VALUES(jobTitle),
        gender                 = VALUES(gender),
        birthDate              = VALUES(birthDate),
        contactNumber          = VALUES(contactNumber),
        startDate              = VALUES(startDate),
        probationEnd           = VALUES(probationEnd),
        employeeStatus         = VALUES(employeeStatus),
        monthlySalary          = VALUES(monthlySalary),
        bankName               = VALUES(bankName),
        bankAccount            = VALUES(bankAccount),
        branch                 = VALUES(branch),
        annualLeaveEntitlement = VALUES(annualLeaveEntitlement),
        annualLeaveCarryForward= VALUES(annualLeaveCarryForward),
        annualLeaveUsed        = VALUES(annualLeaveUsed),
        sickLeaveEntitlement   = VALUES(sickLeaveEntitlement),
        sickLeaveUsed          = VALUES(sickLeaveUsed),
        personalLeaveEntitlement = VALUES(personalLeaveEntitlement),
        personalLeaveUsed      = VALUES(personalLeaveUsed),
        updated_at             = NOW()`,
      [
        employeeId, username ?? null, affix ?? null, firstName, lastName,
        firstNameTh ?? null, lastNameTh ?? null, jobTitle ?? null,
        gender ?? null, birthDate ?? null, contactNumber ?? null,
        startDate ?? null, probationEnd ?? null, employeeStatus ?? 'Permanent',
        monthlySalary ?? null, bankName ?? null, bankAccount ?? null, branch ?? null,
        annualLeaveEntitlement, annualLeaveCarryForward, annualLeaveUsed,
        sickLeaveEntitlement, sickLeaveUsed,
        personalLeaveEntitlement, personalLeaveUsed,
      ]
    )

    // Fetch the inserted/updated row
    const [rows]: any = await pool.query('SELECT * FROM hr_employees WHERE employeeId = ?', [employeeId])

    return NextResponse.json({ success: true, employee: rows[0], insertId: result.insertId })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureHrEmployeesTable()

    const body = await request.json()
    const { employeeId, ...fields } = body

    if (!employeeId) {
      return NextResponse.json({ success: false, error: 'employeeId required' }, { status: 400 })
    }

    const allowedFields = [
      'username','affix','firstName','lastName','firstNameTh','lastNameTh',
      'jobTitle','gender','birthDate','contactNumber','startDate','probationEnd',
      'employeeStatus','monthlySalary','bankName','bankAccount','branch',
      'annualLeaveEntitlement','annualLeaveCarryForward','annualLeaveUsed',
      'sickLeaveEntitlement','sickLeaveUsed',
      'personalLeaveEntitlement','personalLeaveUsed',
    ]

    const setClauses: string[] = []
    const params: any[] = []
    for (const key of allowedFields) {
      if (key in fields) {
        setClauses.push(`${key} = ?`)
        params.push(fields[key])
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    setClauses.push('updated_at = NOW()')
    params.push(employeeId)

    await pool.query(`UPDATE hr_employees SET ${setClauses.join(', ')} WHERE employeeId = ?`, params)

    const [rows]: any = await pool.query('SELECT * FROM hr_employees WHERE employeeId = ?', [employeeId])
    return NextResponse.json({ success: true, employee: rows[0] })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
