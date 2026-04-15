import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'

type RequestLang = 'th' | 'en'

type PayslipRow = RowDataPacket & {
  id: number
  employee_id: number
  employee_code: string
  employee_name: string
  position_name: string | null
  department_name: string | null
  payroll_period: string
  accumulated_income: number
  accumulated_social_security: number
  accumulated_tax: number
  accumulated_provident_fund: number
  salary: number
  bonus: number
  position_allowance: number
  overtime_pay: number
  commission: number
  health_insurance: number
  income_tax: number
  social_security: number
  provident_fund: number
  absent_late_deduction: number
  uniform_deduction: number
  advance_deduction: number
  total_income: number
  total_deductions: number
  net_income: number
  net_income_text: string | null
  prepared_by: string | null
  approved_by: string | null
  document_date: string | null
}

const createPayrollPayslipsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payroll_payslips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      employee_code VARCHAR(50) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      position_name VARCHAR(255) NULL,
      department_name VARCHAR(255) NULL,
      payroll_period VARCHAR(7) NOT NULL,
      accumulated_income DECIMAL(12,2) DEFAULT 0,
      accumulated_social_security DECIMAL(12,2) DEFAULT 0,
      accumulated_tax DECIMAL(12,2) DEFAULT 0,
      accumulated_provident_fund DECIMAL(12,2) DEFAULT 0,
      salary DECIMAL(12,2) DEFAULT 0,
      bonus DECIMAL(12,2) DEFAULT 0,
      position_allowance DECIMAL(12,2) DEFAULT 0,
      overtime_pay DECIMAL(12,2) DEFAULT 0,
      commission DECIMAL(12,2) DEFAULT 0,
      health_insurance DECIMAL(12,2) DEFAULT 0,
      income_tax DECIMAL(12,2) DEFAULT 0,
      social_security DECIMAL(12,2) DEFAULT 0,
      provident_fund DECIMAL(12,2) DEFAULT 0,
      absent_late_deduction DECIMAL(12,2) DEFAULT 0,
      uniform_deduction DECIMAL(12,2) DEFAULT 0,
      advance_deduction DECIMAL(12,2) DEFAULT 0,
      total_income DECIMAL(12,2) DEFAULT 0,
      total_deductions DECIMAL(12,2) DEFAULT 0,
      net_income DECIMAL(12,2) DEFAULT 0,
      net_income_text TEXT NULL,
      prepared_by VARCHAR(255) NULL,
      approved_by VARCHAR(255) NULL,
      document_date DATE NULL,
      created_at DATETIME DEFAULT NOW(),
      updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
      UNIQUE KEY uk_employee_period (employee_id, payroll_period)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
}

const toNumber = (value: unknown) => {
  const parsed = Number(value || 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error'

const getRequestLang = (value: unknown): RequestLang =>
  value === 'en' ? 'en' : 'th'

const T = (lang: RequestLang, en: string, th: string) =>
  lang === 'th' ? th : en

export async function GET(request: NextRequest) {
  try {
    await createPayrollPayslipsTable()

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const period = searchParams.get('period')
    const lang = getRequestLang(searchParams.get('lang'))

    if (!employeeId || !period) {
      return NextResponse.json({ ok: false, error: T(lang, 'employeeId and period are required', 'employeeId และ period จำเป็นต้องระบุ') }, { status: 400 })
    }

    const [rows] = await pool.query<PayslipRow[]>(
      `SELECT *
       FROM payroll_payslips
       WHERE employee_id = ? AND payroll_period = ?
       ORDER BY id DESC
       LIMIT 1`,
      [employeeId, period]
    )

    return NextResponse.json({ ok: true, payslip: rows[0] || null })
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await createPayrollPayslipsTable()

    const body = await request.json()
    const lang = getRequestLang(body.lang)
    const {
      employeeId,
      employeeCode,
      employeeName,
      position,
      department,
      period,
      accumulatedIncome,
      accumulatedSocialSecurity,
      accumulatedTax,
      accumulatedProvidentFund,
      salary,
      bonus,
      positionAllowance,
      overtime,
      commission,
      healthInsurance,
      incomeTax,
      socialSecurity,
      providentFund,
      absentLateDeduction,
      uniformDeduction,
      advanceDeduction,
      totalIncome,
      totalDeductions,
      netIncome,
      netIncomeText,
      preparedBy,
      approvedBy,
      documentDate
    } = body

    if (!employeeId || !employeeCode || !employeeName || !period) {
      return NextResponse.json({ ok: false, error: T(lang, 'Please complete employee and payroll period information', 'กรุณากรอกข้อมูลพนักงานและงวดสลิปเงินเดือนให้ครบ') }, { status: 400 })
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO payroll_payslips (
         employee_id, employee_code, employee_name, position_name, department_name, payroll_period,
         accumulated_income, accumulated_social_security, accumulated_tax, accumulated_provident_fund,
         salary, bonus, position_allowance, overtime_pay, commission, health_insurance,
         income_tax, social_security, provident_fund, absent_late_deduction,
         uniform_deduction, advance_deduction, total_income, total_deductions,
         net_income, net_income_text, prepared_by, approved_by, document_date
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         employee_code = VALUES(employee_code),
         employee_name = VALUES(employee_name),
         position_name = VALUES(position_name),
         department_name = VALUES(department_name),
         accumulated_income = VALUES(accumulated_income),
         accumulated_social_security = VALUES(accumulated_social_security),
         accumulated_tax = VALUES(accumulated_tax),
         accumulated_provident_fund = VALUES(accumulated_provident_fund),
         salary = VALUES(salary),
         bonus = VALUES(bonus),
         position_allowance = VALUES(position_allowance),
         overtime_pay = VALUES(overtime_pay),
         commission = VALUES(commission),
         health_insurance = VALUES(health_insurance),
         income_tax = VALUES(income_tax),
         social_security = VALUES(social_security),
         provident_fund = VALUES(provident_fund),
         absent_late_deduction = VALUES(absent_late_deduction),
         uniform_deduction = VALUES(uniform_deduction),
         advance_deduction = VALUES(advance_deduction),
         total_income = VALUES(total_income),
         total_deductions = VALUES(total_deductions),
         net_income = VALUES(net_income),
         net_income_text = VALUES(net_income_text),
         prepared_by = VALUES(prepared_by),
         approved_by = VALUES(approved_by),
         document_date = VALUES(document_date),
         updated_at = NOW()`,
      [
        employeeId,
        employeeCode,
        employeeName,
        position || null,
        department || null,
        period,
        toNumber(accumulatedIncome),
        toNumber(accumulatedSocialSecurity),
        toNumber(accumulatedTax),
        toNumber(accumulatedProvidentFund),
        toNumber(salary),
        toNumber(bonus),
        toNumber(positionAllowance),
        toNumber(overtime),
        toNumber(commission),
        toNumber(healthInsurance),
        toNumber(incomeTax),
        toNumber(socialSecurity),
        toNumber(providentFund),
        toNumber(absentLateDeduction),
        toNumber(uniformDeduction),
        toNumber(advanceDeduction),
        toNumber(totalIncome),
        toNumber(totalDeductions),
        toNumber(netIncome),
        netIncomeText || null,
        preparedBy || null,
        approvedBy || null,
        documentDate || null
      ]
    )

    return NextResponse.json({
      ok: true,
      message: T(lang, 'Payslip saved successfully', 'บันทึกสลิปเงินเดือนสำเร็จ'),
      id: result.insertId || null
    })
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: getErrorMessage(error) }, { status: 500 })
  }
}
