import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const department = searchParams.get('department')
    const employeeId = searchParams.get('employeeId')

    let sql = 'SELECT * FROM kr_salary_payments WHERE 1=1'
    const params: any[] = []
    if (month) { sql += ' AND month = ?'; params.push(month) }
    if (department) { sql += ' AND department = ?'; params.push(department) }
    if (employeeId) { sql += ' AND employeeId = ?'; params.push(employeeId) }
    sql += ' ORDER BY month DESC, employeeName ASC'

    const rows = await query(sql, params)
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, employeeId, employeeName, department, month, baseSalary, bonus, deductions, netPay, paymentDate, paymentStatus, cumulativeIncome, cumulativeTax, cumulativeNationalPension, cumulativeHealthInsurance } = body
    await query(
      `INSERT INTO kr_salary_payments (id, employeeId, employeeName, department, month, baseSalary, bonus, deductions, netPay, paymentDate, paymentStatus, cumulativeIncome, cumulativeTax, cumulativeNationalPension, cumulativeHealthInsurance)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE employeeName=VALUES(employeeName), baseSalary=VALUES(baseSalary), bonus=VALUES(bonus), deductions=VALUES(deductions), netPay=VALUES(netPay), paymentDate=VALUES(paymentDate), paymentStatus=VALUES(paymentStatus), cumulativeIncome=VALUES(cumulativeIncome), cumulativeTax=VALUES(cumulativeTax), cumulativeNationalPension=VALUES(cumulativeNationalPension), cumulativeHealthInsurance=VALUES(cumulativeHealthInsurance)`,
      [id, employeeId, employeeName, department, month, baseSalary || 0, bonus || 0, deductions || 0, netPay || 0, paymentDate || null, paymentStatus || 'pending', cumulativeIncome || 0, cumulativeTax || 0, cumulativeNationalPension || 0, cumulativeHealthInsurance || 0]
    )
    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
