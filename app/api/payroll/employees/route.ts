import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import mysql, { type Connection, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise'
import crypto from 'crypto'

// Database configuration for new connections (fallback)
const dbConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'ksystem',
  password: process.env.MYSQL_PASSWORD || 'Ksave2025Admin',
  database: process.env.MYSQL_DATABASE || 'ksystem',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

type EmployeeRow = RowDataPacket & {
  id: number
  username: string
  name: string | null
  name_th: string | null
  email: string
  typeID: number
  typeName: string | null
  typeDepartmentName: string | null
  site: string
  created_at: string
  salary: number | string | null
  hourlyRate: number | string | null
  dailyRate: number | string | null
  startDate: string | null
  endDate: string | null
  terminationType: string | null
  terminationReason: string | null
  taxId: string | null
}

type UserIdRow = RowDataPacket & {
  userId: number
}

type SalaryIdRow = RowDataPacket & {
  id: number
}

type NextUserIdRow = RowDataPacket & {
  nextUserId: number
}

const generateBaseUsername = (name: string, email?: string) => {
  const emailBase = (email || '').split('@')[0].trim().toLowerCase()
  if (emailBase) return emailBase.replace(/[^a-z0-9._-]/g, '') || 'user'

  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')

  return normalizedName || 'user'
}

const generateTemporaryPassword = () => `Ksave@${crypto.randomBytes(4).toString('hex')}`

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const site = searchParams.get('site') || 'Thailand'
    const search = searchParams.get('search') || ''

    // Query to get employees from Thailand site
    let query = `
      SELECT
        user_list.userId as id,
        user_list.userName as username,
        user_list.name,
        user_list.name_th,
        user_list.email,
        user_list.typeID,
        ct.TypeName as typeName,
        ct.departmentName as typeDepartmentName,
        user_list.site,
        user_list.create_datetime as created_at,
        COALESCE(es.salary, 0) as salary,
        COALESCE(es.hourlyRate, 0) as hourlyRate,
        COALESCE(es.dailyRate, 0) as dailyRate,
        es.startDate,
        es.endDate,
        es.terminationType,
        es.terminationReason,
        es.taxId
      FROM user_list
      LEFT JOIN (
        SELECT s1.userId, s1.salary, s1.hourlyRate, s1.dailyRate,
               s1.startDate, s1.endDate, s1.terminationType,
               s1.terminationReason, s1.taxId
        FROM employee_salary s1
        INNER JOIN (
          SELECT userId, MAX(id) as maxId
          FROM employee_salary
          GROUP BY userId
        ) latest ON latest.userId = s1.userId AND latest.maxId = s1.id
      ) es ON es.userId = user_list.userId
      LEFT JOIN cus_type ct ON ct.typeID = user_list.typeID
      WHERE user_list.site = ?
    `

    const params: string[] = [site]

    // Add search filter if provided
    if (search) {
      query += ` AND (user_list.name LIKE ? OR user_list.userName LIKE ? OR user_list.email LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY user_list.userId DESC LIMIT 100`

    const [rows] = await pool.query<EmployeeRow[]>(query, params)

    // Transform data to include department and position info
    const employees = rows.map(emp => ({
      id: emp.id,
      username: emp.username,
      name: emp.name || emp.username,
      name_th: emp.name_th,
      email: emp.email,
      department: emp.typeDepartmentName || getDepartmentByTypeID(emp.typeID),
      position: emp.typeName || getPositionByTypeID(emp.typeID),
      typeID: emp.typeID,
      site: emp.site,
      salary: Number(emp.salary || 0),
      hourlyRate: Number(emp.hourlyRate || 0),
      dailyRate: Number(emp.dailyRate || 0),
      startDate: emp.startDate,
      endDate: emp.endDate,
      terminationType: emp.terminationType,
      terminationReason: emp.terminationReason,
      taxId: emp.taxId,
      status: 'active',
      createdAt: emp.created_at
    }))

    return NextResponse.json({
      ok: true,
      employees,
      total: employees.length
    })

  } catch (error: unknown) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({
      ok: false,
      error: getErrorMessage(error) || 'Failed to fetch employees'
    }, { status: 500 })
  }
}

// Helper function to map typeID to department
function getDepartmentByTypeID(typeID: number): string {
  const mapping: Record<number, string> = {
    1: 'ผู้ดูแลระบบ',
    2: 'ผู้จัดการ',
    3: 'บัญชี',
    4: 'ผู้บริหาร',
    5: 'ช่างเทคนิค',
    6: 'ฝ่ายขาย',
    7: 'แอดมิน',
    8: 'HR/เงินเดือน',
    9: 'การตลาด',
    10: 'ผู้จัดการสาขา',
    11: 'บัญชี',
    12: 'นักศึกษาฝึกงาน',
  }
  return mapping[typeID] || 'ทั่วไป'
}

// Helper function to map typeID to position
function getPositionByTypeID(typeID: number): string {
  const mapping: Record<number, string> = {
    1: 'System Administrator',
    2: 'Manager',
    3: 'นักบัญชี',
    4: 'ผู้บริหาร (Executive)',
    5: 'ช่างติดตั้ง',
    6: 'พนักงานขาย',
    7: 'Admin',
    8: 'HR Officer',
    9: 'หัวหน้าแผนกการตลาด (M-Marketing)',
    10: 'ผู้จัดการสาขา (Branch Manager)',
    11: 'หัวหน้าแผนกบัญชี (M-Accounting)',
    12: 'นักศึกษาฝึกงาน (Internship)',
  }
  return mapping[typeID] || 'พนักงาน'
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  let connection: Connection | null = null

  try {
    const body = await request.json()
    const {
      password,
      name,
      email,
      typeID,
      site,
      salary,
      hourlyRate,
      dailyRate,
      startDate,
      endDate,
      terminationType,
      terminationReason,
      taxId,
      documents
    } = body

    // Validate required fields
    if (!name || !typeID || !site) {
      return NextResponse.json({
        ok: false,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อ-นามสกุล, ตำแหน่ง, สาขา)'
      }, { status: 400 })
    }

    connection = await mysql.createConnection(dbConfig)

    const requestedUsername = typeof body.username === 'string' ? body.username.trim() : ''
    const baseUsername = requestedUsername || generateBaseUsername(name, email)
    let username = baseUsername
    let suffix = 1

    // Check if username already exists
    while (true) {
      const [existing] = await connection.execute<UserIdRow[]>(
        'SELECT userId FROM user_list WHERE userName = ?',
        [username]
      )
      if (existing.length === 0) break
      username = `${baseUsername}.${suffix}`
      suffix += 1
    }

    const [nextUserRows] = await connection.execute<NextUserIdRow[]>(
      'SELECT COALESCE(MAX(userId), 0) + 1 AS nextUserId FROM user_list'
    )
    const nextUserId = nextUserRows[0]?.nextUserId || 1

    // Hash password (simple MD5 - in production use bcrypt)
    const temporaryPassword = (typeof password === 'string' && password.trim()) || generateTemporaryPassword()
    const hashedPassword = crypto.createHash('md5').update(temporaryPassword).digest('hex')

    // Insert new employee into user_list table
    const insertQuery = `
      INSERT INTO user_list (
        userId,
        userName,
        password,
        name,
        email,
        typeID,
        site,
        create_datetime
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `

    const [result] = await connection.execute<ResultSetHeader>(insertQuery, [
      nextUserId,
      username,
      hashedPassword,
      name,
      email || null,
      typeID,
      site
    ])

    const insertId = result.insertId || nextUserId

    // If salary/hourly/daily rate is provided, insert into salary table (if exists)
    if ((salary && salary > 0) || (hourlyRate && hourlyRate > 0) || (dailyRate && dailyRate > 0)) {
      try {
        await connection.execute(
          `INSERT INTO employee_salary (userId, salary, hourlyRate, dailyRate, startDate, endDate, terminationType, terminationReason, taxId, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            insertId,
            salary || 0,
            hourlyRate || 0,
            dailyRate || 0,
            startDate || new Date().toISOString().split('T')[0],
            endDate || null,
            terminationType || null,
            terminationReason || null,
            taxId || null
          ]
        )
      } catch (salaryError: unknown) {
        console.log('Salary table insert skipped:', salaryError)
        // Continue even if salary table doesn't exist
      }
    }

    // Save uploaded documents
    if (documents && typeof documents === 'object') {
      const docMapping: Record<string, string> = {
        contract: 'contract',
        education: 'education',
        idCard: 'idCard',
        bankAccount: 'bankAccount',
        resume: 'resume',
        certificate: 'certificate'
      }

      for (const [key, filePath] of Object.entries(documents as Record<string, unknown>)) {
        if (filePath && typeof filePath === 'string') {
          try {
            const fileName = filePath.split('/').pop() || ''
            await connection.execute(
              `INSERT INTO employee_documents (userId, doc_type, file_path, file_name, uploaded_at)
               VALUES (?, ?, ?, ?, NOW())`,
              [insertId, docMapping[key] || key, filePath, fileName]
            )
          } catch (docError: unknown) {
            console.log(`Document ${key} insert skipped:`, docError)
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'เพิ่มพนักงานสำเร็จ',
      employeeId: insertId,
      employee: {
        id: insertId,
        username,
        name,
        email,
        department: getDepartmentByTypeID(typeID),
        position: getPositionByTypeID(typeID),
        typeID,
        site,
        salary: salary || 0,
        temporaryPassword,
        status: 'active'
      }
    })

  } catch (error: unknown) {
    console.error('Error creating employee:', error)
    return NextResponse.json({
      ok: false,
      error: getErrorMessage(error) || 'ไม่สามารถเพิ่มพนักงานได้'
    }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// PUT - Update existing employee
export async function PUT(request: NextRequest) {
  let connection: Connection | null = null

  try {
    const body = await request.json()
    const {
      id,
      name,
      name_th,
      email,
      salary,
      hourlyRate,
      dailyRate,
      startDate,
      endDate,
      terminationType,
      terminationReason,
      taxId
    } = body

    // Validate required fields
    if (!id || !name) {
      return NextResponse.json({
        ok: false,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ID, ชื่อ-นามสกุล)'
      }, { status: 400 })
    }

    connection = await mysql.createConnection(dbConfig)

    // Check if employee exists
    const [existing] = await connection.execute<UserIdRow[]>(
      'SELECT userId FROM user_list WHERE userId = ?',
      [id]
    )

    if (existing.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'ไม่พบข้อมูลพนักงานในระบบ'
      }, { status: 404 })
    }

    // Update employee data
    const updateQuery = `
      UPDATE user_list
      SET name = ?,
          name_th = ?,
          email = ?
      WHERE userId = ?
    `

    await connection.execute(updateQuery, [
      name,
      name_th || null,
      email || null,
      id
    ])

    const normalizedSalary = Number(salary || 0)
    const normalizedHourlyRate = Number(hourlyRate || 0)
    const normalizedDailyRate = Number(dailyRate || 0)

    const [salaryRows] = await connection.execute<SalaryIdRow[]>(
      'SELECT id FROM employee_salary WHERE userId = ? ORDER BY id DESC LIMIT 1',
      [id]
    )

    if (salaryRows.length > 0) {
      await connection.execute(
        `UPDATE employee_salary
         SET salary = ?, hourlyRate = ?, dailyRate = ?,
             startDate = ?, endDate = ?, terminationType = ?,
             terminationReason = ?, taxId = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          normalizedSalary,
          normalizedHourlyRate,
          normalizedDailyRate,
          startDate || null,
          endDate || null,
          terminationType || null,
          terminationReason || null,
          taxId || null,
          salaryRows[0].id
        ]
      )
    } else if (normalizedSalary > 0 || normalizedHourlyRate > 0 || normalizedDailyRate > 0) {
      await connection.execute(
        `INSERT INTO employee_salary (userId, salary, hourlyRate, dailyRate, startDate, endDate, terminationType, terminationReason, taxId, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id,
          normalizedSalary,
          normalizedHourlyRate,
          normalizedDailyRate,
          startDate || null,
          endDate || null,
          terminationType || null,
          terminationReason || null,
          taxId || null
        ]
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'อัพเดตข้อมูลพนักงานสำเร็จ',
      employee: {
        id,
        name,
        name_th,
        email,
        salary: normalizedSalary,
        hourlyRate: normalizedHourlyRate,
        dailyRate: normalizedDailyRate
      }
    })

  } catch (error: unknown) {
    console.error('Error updating employee:', error)
    return NextResponse.json({
      ok: false,
      error: getErrorMessage(error) || 'ไม่สามารถอัพเดตข้อมูลพนักงานได้'
    }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
