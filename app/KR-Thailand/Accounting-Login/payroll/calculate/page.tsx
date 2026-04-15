"use client"

import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'

type EmployeeOption = {
  id: number
  username: string
  name: string
  name_th?: string
  typeID?: number
  department: string
  position: string
  salary?: number
  hourlyRate?: number
  dailyRate?: number
}

type PayrollForm = {
  employeeCode: string
  employeeName: string
  position: string
  department: string
  period: string
  accumulatedIncome: number
  accumulatedSocialSecurity: number
  accumulatedTax: number
  accumulatedProvidentFund: number
  salary: number
  bonus: number
  positionAllowance: number
  overtime: number
  commission: number
  healthInsurance: number
  incomeTax: number
  socialSecurity: number
  providentFund: number
  absentLateDeduction: number
  uniformDeduction: number
  advanceDeduction: number
  preparedBy: string
  approvedBy: string
  documentDate: string
}

type Lang = 'th' | 'en'

const DEFAULT_APPROVED_BY: Record<Lang, string> = {
  th: 'NAM CHAL JANG',
  en: 'NAM CHAL JANG'
}

const COMPANY_NAME: Record<Lang, string> = {
  th: 'บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด',
  en: 'K Energy Save Co., Ltd.'
}

const COMPANY_ADDRESS: Record<Lang, string[]> = {
  th: [
    '84 ซอยเฉลิมพระเกียรติ ร.9 ซอย 34 แขวงหนองบอน เขตประเวศ กรุงเทพมหานคร 10250',
    'โทร: 02-080-8916 | อีเมล: info@kenergy-save.com'
  ],
  en: [
    '84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250',
    'Tel: 02-080-8916 | Email: info@kenergy-save.com'
  ]
}

const defaultForm = (lang: Lang = 'th'): PayrollForm => ({
  employeeCode: '',
  employeeName: '',
  position: '',
  department: '',
  period: '',
  accumulatedIncome: 0,
  accumulatedSocialSecurity: 0,
  accumulatedTax: 0,
  accumulatedProvidentFund: 0,
  salary: 0,
  bonus: 0,
  positionAllowance: 0,
  overtime: 0,
  commission: 0,
  healthInsurance: 0,
  incomeTax: 0,
  socialSecurity: 0,
  providentFund: 0,
  absentLateDeduction: 0,
  uniformDeduction: 0,
  advanceDeduction: 0,
  preparedBy: 'kattarin sukakate',
  approvedBy: DEFAULT_APPROVED_BY[lang],
  documentDate: new Date().toISOString().split('T')[0]
})

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 700,
  color: '#334155'
}

const textInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none'
}

const numberInputStyle: React.CSSProperties = {
  ...textInputStyle,
  textAlign: 'right'
}

function numberToThaiText(amount: number) {
  if (!Number.isFinite(amount) || amount === 0) return 'ศูนย์บาทถ้วน'

  const digitText = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  const positionText = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']

  const convertInteger = (value: number): string => {
    if (value === 0) return ''

    const valueText = String(value)
    let result = ''

    for (let i = 0; i < valueText.length; i += 1) {
      const digit = Number(valueText[i])
      const position = valueText.length - i - 1

      if (digit === 0) continue

      if (position >= 6) {
        const front = Math.floor(value / 1000000)
        const back = value % 1000000
        return `${convertInteger(front)}ล้าน${convertInteger(back)}`
      }

      if (position === 1) {
        if (digit === 1) {
          result += 'สิบ'
        } else if (digit === 2) {
          result += 'ยี่สิบ'
        } else {
          result += `${digitText[digit]}สิบ`
        }
      } else if (position === 0 && digit === 1 && valueText.length > 1) {
        result += 'เอ็ด'
      } else {
        result += `${digitText[digit]}${positionText[position]}`
      }
    }

    return result
  }

  const roundedAmount = Math.round(amount * 100) / 100
  const integerPart = Math.floor(roundedAmount)
  const decimalPart = Math.round((roundedAmount - integerPart) * 100)

  const bahtText = `${convertInteger(integerPart)}บาท`
  if (decimalPart === 0) return `${bahtText}ถ้วน`

  return `${bahtText}${convertInteger(decimalPart)}สตางค์`
}

function numberToEnglishText(amount: number) {
  if (!Number.isFinite(amount) || amount === 0) return 'Zero baht only'

  const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  const scales = ['', 'thousand', 'million', 'billion', 'trillion']

  const convertHundreds = (value: number) => {
    let result = ''
    const hundred = Math.floor(value / 100)
    const remainder = value % 100

    if (hundred > 0) {
      result += `${units[hundred]} hundred`
      if (remainder > 0) result += ' '
    }

    if (remainder >= 20) {
      result += tens[Math.floor(remainder / 10)]
      if (remainder % 10 > 0) result += `-${units[remainder % 10]}`
    } else if (remainder >= 10) {
      result += teens[remainder - 10]
    } else if (remainder > 0) {
      result += units[remainder]
    }

    return result
  }

  const convertInteger = (value: number) => {
    if (value === 0) return 'zero'

    const parts: string[] = []
    let remaining = value
    let scaleIndex = 0

    while (remaining > 0) {
      const chunk = remaining % 1000
      if (chunk > 0) {
        const chunkText = convertHundreds(chunk)
        parts.unshift([chunkText, scales[scaleIndex]].filter(Boolean).join(' '))
      }
      remaining = Math.floor(remaining / 1000)
      scaleIndex += 1
    }

    return parts.join(' ')
  }

  const roundedAmount = Math.round(amount * 100) / 100
  const integerPart = Math.floor(roundedAmount)
  const decimalPart = Math.round((roundedAmount - integerPart) * 100)
  const bahtText = `${convertInteger(integerPart)} baht`

  if (decimalPart === 0) return `${bahtText} only`

  return `${bahtText} and ${convertInteger(decimalPart)} satang`
}

const numberToCurrencyText = (amount: number, lang: Lang) =>
  lang === 'th' ? numberToThaiText(amount) : numberToEnglishText(amount)

const calculateSocialSecurity = (salary: number) => Math.min(salary * 0.05, 750)

const calculateProvidentFund = (salary: number) => salary * 0.03

const calculateIncomeTax = (salary: number) => {
  const yearlyIncome = salary * 12
  const taxableIncome = Math.max(yearlyIncome - 90000, 0)

  if (taxableIncome <= 150000) return 0
  if (taxableIncome <= 300000) return ((taxableIncome - 150000) * 0.05) / 12
  if (taxableIncome <= 500000) return (7500 + (taxableIncome - 300000) * 0.1) / 12
  if (taxableIncome <= 750000) return (27500 + (taxableIncome - 500000) * 0.15) / 12
  return (65000 + (taxableIncome - 750000) * 0.2) / 12
}

const getDefaultPositionAllowance = (typeID?: number) => {
  const allowanceByType: Record<number, number> = {
    2: 8000,
    3: 3000,
    6: 2500,
    8: 3500,
    10: 10000,
    11: 6000
  }
  return allowanceByType[typeID || 0] || 0
}

const createEmployeeForm = (employee: EmployeeOption, previousForm: PayrollForm, lang: Lang): PayrollForm => {
  const baseSalary = Number(employee.salary || 0)
  const socialSecurity = calculateSocialSecurity(baseSalary)
  const providentFund = calculateProvidentFund(baseSalary)
  const incomeTax = calculateIncomeTax(baseSalary)

  return {
    ...defaultForm(lang),
    period: previousForm.period,
    documentDate: previousForm.documentDate,
    preparedBy: previousForm.preparedBy,
    approvedBy: previousForm.approvedBy || defaultForm(lang).approvedBy,
    employeeCode: `EMP-${String(employee.id).padStart(4, '0')}`,
    employeeName: employee.name_th || employee.name || '',
    position: employee.position || '',
    department: employee.department || '',
    salary: baseSalary,
    positionAllowance: getDefaultPositionAllowance(employee.typeID),
    socialSecurity,
    providentFund,
    incomeTax
  }
}

export default function CalculatePayrollPage() {
  const { L, lang } = useLang()
  const [mounted, setMounted] = useState(false)
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [form, setForm] = useState<PayrollForm>(() => defaultForm(lang))
  const [saving, setSaving] = useState(false)
  const [loadingPayslip, setLoadingPayslip] = useState(false)

  useEffect(() => {
    setMounted(true)
    void loadEmployees()
  }, [])

  // approvedBy is always fixed — no sync needed

  const loadEmployees = async () => {
    try {
      const res = await fetch('/api/payroll/employees?site=Thailand')
      const data = await res.json()
      if (data.ok && Array.isArray(data.employees)) {
        setEmployees(data.employees as EmployeeOption[])
      }
    } catch (err) {
      console.error('Failed to load employees:', err)
    }
  }

  const updateForm = <K extends keyof PayrollForm>(field: K, value: PayrollForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const loadSavedPayslip = useCallback(async (employeeId: string, period: string) => {
    try {
      setLoadingPayslip(true)
      const res = await fetch(`/api/payroll/payslips?employeeId=${encodeURIComponent(employeeId)}&period=${encodeURIComponent(period)}&lang=${lang}`)
      const data = await res.json()
      const employee = employees.find(item => item.id === Number(employeeId))

      if (!data.ok || !data.payslip) {
        if (employee) {
          setForm(prev => createEmployeeForm(employee, { ...prev, period }, lang))
        }
        return
      }

      const payslip = data.payslip
      setForm(prev => ({
        ...(employee ? createEmployeeForm(employee, { ...prev, period }, lang) : prev),
        employeeCode: payslip.employee_code || prev.employeeCode,
        employeeName: payslip.employee_name || prev.employeeName,
        position: payslip.position_name || prev.position,
        department: payslip.department_name || prev.department,
        period: payslip.payroll_period || prev.period,
        accumulatedIncome: Number(payslip.accumulated_income || 0),
        accumulatedSocialSecurity: Number(payslip.accumulated_social_security || 0),
        accumulatedTax: Number(payslip.accumulated_tax || 0),
        accumulatedProvidentFund: Number(payslip.accumulated_provident_fund || 0),
        salary: Number(payslip.salary || 0),
        bonus: Number(payslip.bonus || 0),
        positionAllowance: Number(payslip.position_allowance || 0),
        overtime: Number(payslip.overtime_pay || 0),
        commission: Number(payslip.commission || 0),
        healthInsurance: Number(payslip.health_insurance || 0),
        incomeTax: Number(payslip.income_tax || 0),
        socialSecurity: Number(payslip.social_security || 0),
        providentFund: Number(payslip.provident_fund || 0),
        absentLateDeduction: Number(payslip.absent_late_deduction || 0),
        uniformDeduction: Number(payslip.uniform_deduction || 0),
        advanceDeduction: Number(payslip.advance_deduction || 0),
        preparedBy: 'kattarin sukakate',
        approvedBy: 'NAM CHAL JANG',
        documentDate: payslip.document_date ? String(payslip.document_date).split('T')[0] : prev.documentDate
      }))
    } catch (err) {
      console.error('Failed to load saved payslip:', err)
    } finally {
      setLoadingPayslip(false)
    }
  }, [employees, lang])

  useEffect(() => {
    if (!selectedEmployee || !form.period) return
    void loadSavedPayslip(selectedEmployee, form.period)
  }, [selectedEmployee, form.period, loadSavedPayslip])

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId)
    const employee = employees.find(item => item.id === Number(employeeId))
    if (!employee) {
      setForm(prev => ({ ...defaultForm(lang), period: prev.period, documentDate: prev.documentDate }))
      return
    }

    setForm(prev => createEmployeeForm(employee, prev, lang))
  }

  const totalIncome =
    form.salary +
    form.bonus +
    form.positionAllowance +
    form.overtime +
    form.commission +
    form.healthInsurance

  const totalDeductions =
    form.incomeTax +
    form.socialSecurity +
    form.providentFund +
    form.absentLateDeduction +
    form.uniformDeduction +
    form.advanceDeduction

  const netIncome = totalIncome - totalDeductions

  const netIncomeText = numberToCurrencyText(netIncome, lang)
  const formattedPeriod = form.period
    ? new Date(`${form.period}-01`).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'long', year: 'numeric' })
    : '-'

  const savePayslip = async () => {
    const res = await fetch('/api/payroll/payslips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: Number(selectedEmployee),
        employeeCode: form.employeeCode,
        employeeName: form.employeeName,
        position: form.position,
        department: form.department,
        period: form.period,
        accumulatedIncome: form.accumulatedIncome,
        accumulatedSocialSecurity: form.accumulatedSocialSecurity,
        accumulatedTax: form.accumulatedTax,
        accumulatedProvidentFund: form.accumulatedProvidentFund,
        salary: form.salary,
        bonus: form.bonus,
        positionAllowance: form.positionAllowance,
        overtime: form.overtime,
        commission: form.commission,
        healthInsurance: form.healthInsurance,
        incomeTax: form.incomeTax,
        socialSecurity: form.socialSecurity,
        providentFund: form.providentFund,
        absentLateDeduction: form.absentLateDeduction,
        uniformDeduction: form.uniformDeduction,
        advanceDeduction: form.advanceDeduction,
        totalIncome,
        totalDeductions,
        netIncome,
        netIncomeText,
        preparedBy: form.preparedBy,
        approvedBy: form.approvedBy,
        documentDate: form.documentDate,
        lang
      })
    })

    const data = await res.json()
    if (!data.ok) {
      throw new Error(data.error || 'Failed to save payslip')
    }
  }

  const handleGenerateSlip = async () => {
    if (!form.employeeCode || !form.employeeName || !form.period) {
      alert(L('Please complete employee and period information', 'กรุณากรอกข้อมูลพนักงานและงวดสลิปเงินเดือนให้ครบ'))
      return
    }
    try {
      setSaving(true)
      await savePayslip()
      setShowResult(true)
    } catch (err) {
      alert(`❌ ${err instanceof Error ? err.message : 'Failed to save payslip'}`)
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatMoney = (amount: number) =>
    amount.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const fmtDateTH = (iso?: string) => { if (!iso) return '-'; const [y, m, d] = iso.slice(0, 10).split('-'); return `${d}-${m}-${+y + 543}` }

  if (!mounted) {
    return (
      <AccWindow title={L('K Energy Save Co., Ltd.', 'บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด')}>
        <div style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>{L('Loading...', 'กำลังโหลด...')}</div>
      </AccWindow>
    )
  }

  return (
    <AccWindow title={L('K Energy Save Co., Ltd.', 'บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด')}>
      <div style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
        {!showResult ? (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #0f172a 100%)',
              borderRadius: 16,
              padding: '22px 26px',
              marginBottom: 20,
              color: 'white',
              boxShadow: '0 12px 30px rgba(15,23,42,0.18)'
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
                📄 {L('Payroll Slip Form', 'แบบฟอร์มสลิปเงินเดือน')}
              </div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                {L('Complete salary details for monthly payslip generation', 'กรอกข้อมูลเพื่อจัดทำสลิปเงินเดือนประจำเดือน')}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #dbe4ee' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
                  {L('Employee Information', 'ข้อมูลพนักงาน')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
                  <div>
                    <label style={fieldLabelStyle}>{L('Employee', 'พนักงาน')}</label>
                    <select
                      value={selectedEmployee}
                      onChange={e => handleEmployeeChange(e.target.value)}
                      style={{ ...textInputStyle, textAlign: 'left' }}
                    >
                      <option value="">{L('Select employee', 'เลือกพนักงาน')}</option>
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} ({employee.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Employee Code', 'รหัสพนักงาน')}</label>
                    <input value={form.employeeCode} onChange={e => updateForm('employeeCode', e.target.value)} style={textInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Full Name', 'ชื่อ-นามสกุล')}</label>
                    <input value={form.employeeName} onChange={e => updateForm('employeeName', e.target.value)} style={textInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Position', 'ตำแหน่ง')}</label>
                    <input value={form.position} onChange={e => updateForm('position', e.target.value)} style={textInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Department', 'ฝ่าย')}</label>
                    <input value={form.department} onChange={e => updateForm('department', e.target.value)} style={textInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Payslip Month', 'สลิปเงินเดือน ประจำเดือน')}</label>
                    <input
                      type="month"
                      value={form.period}
                      onChange={e => updateForm('period', e.target.value)}
                      style={{ ...textInputStyle, textAlign: 'left' }}
                    />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Document Date', 'วันที่')}</label>
                    <input
                      type="date"
                      value={form.documentDate}
                      onChange={e => updateForm('documentDate', e.target.value)}
                      style={{ ...textInputStyle, textAlign: 'left' }}
                    />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Prepared By', 'จัดทำโดย')}</label>
                    <input value={form.preparedBy} onChange={e => updateForm('preparedBy', e.target.value)} style={textInputStyle} />
                  </div>
                </div>
                {(loadingPayslip || saving) && (
                  <div style={{ marginTop: 12, fontSize: 13, color: '#475569', fontWeight: 600 }}>
                    {loadingPayslip
                      ? L('Loading saved payslip data...', 'กำลังโหลดข้อมูลสลิปเงินเดือนที่เคยบันทึก...')
                      : L('Saving payslip to database...', 'กำลังบันทึกสลิปเงินเดือนลงฐานข้อมูล...')}
                  </div>
                )}
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #dbe4ee' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
                  {L('Accumulated Totals', 'ยอดสะสม')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
                  <div>
                    <label style={fieldLabelStyle}>{L('Accumulated Income', 'เงินได้สะสม')}</label>
                    <input type="number" value={form.accumulatedIncome} onChange={e => updateForm('accumulatedIncome', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Accumulated Social Security', 'ประกันสังคมสะสม')}</label>
                    <input type="number" value={form.accumulatedSocialSecurity} onChange={e => updateForm('accumulatedSocialSecurity', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Accumulated Tax', 'ภาษีสะสม')}</label>
                    <input type="number" value={form.accumulatedTax} onChange={e => updateForm('accumulatedTax', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Accumulated Provident Fund', 'กองทุนสะสม')}</label>
                    <input type="number" value={form.accumulatedProvidentFund} onChange={e => updateForm('accumulatedProvidentFund', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #dbe4ee' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#15803d', marginBottom: 14 }}>
                    {L('Income Items', 'รายการรับ')}
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <label style={fieldLabelStyle}>{L('Salary', 'เงินเดือน')}</label>
                      <input type="number" value={form.salary} onChange={e => updateForm('salary', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Bonus', 'โบนัส')}</label>
                      <input type="number" value={form.bonus} onChange={e => updateForm('bonus', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Position Allowance', 'ค่าตำแหน่ง')}</label>
                      <input type="number" value={form.positionAllowance} onChange={e => updateForm('positionAllowance', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Overtime', 'ค่าล่วงเวลา')}</label>
                      <input type="number" value={form.overtime} onChange={e => updateForm('overtime', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Commission', 'ค่าคอมมิชชั่น')}</label>
                      <input type="number" value={form.commission} onChange={e => updateForm('commission', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Health Insurance', 'ประกันสุขภาพ')}</label>
                      <input type="number" value={form.healthInsurance} onChange={e => updateForm('healthInsurance', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: '#dcfce7', color: '#166534', fontWeight: 800 }}>
                      {L('Total Income', 'รวมรายรับ')}: {formatMoney(totalIncome)}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #dbe4ee' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#b91c1c', marginBottom: 14 }}>
                    {L('Deduction Items', 'รายการหัก')}
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <label style={fieldLabelStyle}>{L('Income Tax', 'ภาษีเงินได้')}</label>
                      <input type="number" value={form.incomeTax} onChange={e => updateForm('incomeTax', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Social Security', 'เงินประกันสังคม')}</label>
                      <input type="number" value={form.socialSecurity} onChange={e => updateForm('socialSecurity', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Provident Fund', 'กองทุนสำรองเลี้ยงชีพ')}</label>
                      <input type="number" value={form.providentFund} onChange={e => updateForm('providentFund', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Absent / Leave / Late Deduction', 'หักขาด/ลา/มาสาย')}</label>
                      <input type="number" value={form.absentLateDeduction} onChange={e => updateForm('absentLateDeduction', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Uniform Deduction', 'หักชุดฟอร์ม')}</label>
                      <input type="number" value={form.uniformDeduction} onChange={e => updateForm('uniformDeduction', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Advance Deduction', 'เบิกล่วงหน้า')}</label>
                      <input type="number" value={form.advanceDeduction} onChange={e => updateForm('advanceDeduction', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontWeight: 800 }}>
                      {L('Total Deductions', 'รวมรายการหัก')}: {formatMoney(totalDeductions)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #dbe4ee' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: '#ecfccb', color: '#365314', fontWeight: 800 }}>
                    {L('Net Income', 'รวมเงินได้สุทธิ')}<br />{formatMoney(netIncome)} {L('Baht', 'บาท')}
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Net Income in Words', 'รวมตัวอักษร')}</label>
                    <div style={{ ...textInputStyle, minHeight: 46, background: '#f8fafc' }}>
                      {netIncomeText}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleGenerateSlip}
                  disabled={saving}
                  style={{
                    padding: '14px 28px',
                    background: saving ? '#94a3b8' : 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 10px 22px rgba(20,184,166,0.24)'
                  }}
                >
                  {saving ? L('Saving...', 'กำลังบันทึก...') : L('Save and Generate Payslip', 'บันทึกและสร้างสลิปเงินเดือน')}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div id="payslip-print-area" style={{ background: '#fff', borderRadius: 16, border: '1px solid #cbd5e1', padding: 28 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 20,
              marginBottom: 20,
              paddingBottom: 18,
              borderBottom: '2px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                <div style={{
                  width: 78,
                  height: 78,
                  borderRadius: 10,
                  background: '#fff',
                  padding: 4,
                  border: '1px solid #dbe4ee',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Image
                    src="/k-energy-save-logo.jpg"
                    alt="K Energy Save Logo"
                    width={68}
                    height={68}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                    {COMPANY_NAME[lang]}
                  </div>
                  {COMPANY_ADDRESS[lang].map(line => (
                    <div key={line} style={{ fontSize: 12, color: '#475569', marginTop: 4, lineHeight: 1.5 }}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 190 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{L('Payslip', 'สลิปเงินเดือน')}</div>
                <div style={{ fontSize: 14, color: '#475569', marginTop: 6 }}>{formattedPeriod}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700, width: '18%' }}>{L('Employee Code', 'รหัสพนักงาน')}</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{form.employeeCode || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700, width: '18%' }}>{L('Payslip Month', 'สลิปเงินเดือน ประจำเดือน')}</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{formattedPeriod}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>{L('Full Name', 'ชื่อ-นามสกุล')}</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{form.employeeName || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>{L('Position', 'ตำแหน่ง')}</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{form.position || '-'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>{L('Department', 'ฝ่าย')}</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{form.department || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>{L('Date', 'วันที่')}</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{fmtDateTH(form.documentDate)}</td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>{L('Accumulated Income', 'เงินได้สะสม')}</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{formatMoney(form.accumulatedIncome)}</td>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>{L('Accumulated Social Security', 'ประกันสังคมสะสม')}</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{formatMoney(form.accumulatedSocialSecurity)}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>{L('Accumulated Tax', 'ภาษีสะสม')}</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{formatMoney(form.accumulatedTax)}</td>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>{L('Accumulated Provident Fund', 'กองทุนสะสม')}</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{formatMoney(form.accumulatedProvidentFund)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th colSpan={2} style={{ border: '1px solid #000', padding: 10, background: '#dcfce7', fontWeight: 800 }}>{L('Income Items', 'รายการรับ')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [L('Salary', 'เงินเดือน'), form.salary],
                    [L('Bonus', 'โบนัส'), form.bonus],
                    [L('Position Allowance', 'ค่าตำแหน่ง'), form.positionAllowance],
                    [L('Overtime', 'ค่าล่วงเวลา'), form.overtime],
                    [L('Commission', 'ค่าคอมมิชชั่น'), form.commission],
                    [L('Health Insurance', 'ประกันสุขภาพ'), form.healthInsurance],
                    [L('Total Income', 'รวมรายรับ'), totalIncome]
                  ].map(([label, value], index) => (
                    <tr key={label}>
                      <td style={{ border: '1px solid #000', padding: 10, fontWeight: index === 6 ? 800 : 600 }}>{label}</td>
                      <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right', background: index === 6 ? '#f0fdf4' : '#fff', fontWeight: index === 6 ? 800 : 500 }}>
                        {formatMoney(Number(value))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th colSpan={2} style={{ border: '1px solid #000', padding: 10, background: '#fee2e2', fontWeight: 800 }}>{L('Deduction Items', 'รายการหัก')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [L('Income Tax', 'ภาษีเงินได้'), form.incomeTax],
                    [L('Social Security', 'เงินประกันสังคม'), form.socialSecurity],
                    [L('Provident Fund', 'กองทุนสำรองเลี้ยงชีพ'), form.providentFund],
                    [L('Absent / Leave / Late Deduction', 'หักขาด/ลา/มาสาย'), form.absentLateDeduction],
                    [L('Uniform Deduction', 'หักชุดฟอร์ม'), form.uniformDeduction],
                    [L('Advance Deduction', 'เบิกล่วงหน้า'), form.advanceDeduction],
                    [L('Total Deductions', 'รวมรายการหัก'), totalDeductions]
                  ].map(([label, value], index) => (
                    <tr key={label}>
                      <td style={{ border: '1px solid #000', padding: 10, fontWeight: index === 6 ? 800 : 600 }}>{label}</td>
                      <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right', background: index === 6 ? '#fff1f2' : '#fff', fontWeight: index === 6 ? 800 : 500 }}>
                        {formatMoney(Number(value))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 800, width: '24%' }}>{L('Net Income', 'รวมเงินได้สุทธิ')}</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right', fontWeight: 800, color: '#166534' }}>
                    {formatMoney(netIncome)} {L('Baht', 'บาท')}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 800 }}>{L('Net Income in Words', 'รวมตัวอักษร')}</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{netIncomeText}</td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 12, fontWeight: 700, width: '25%' }}>{L('Prepared By', 'จัดทำโดย')}</td>
                  <td style={{ border: '1px solid #000', padding: 12 }}>kattarin sukakate</td>
                  <td style={{ border: '1px solid #000', padding: 12, fontWeight: 700, width: '30%' }}>{L('Approved By', 'ผู้อนุมัติ')}</td>
                  <td style={{ border: '1px solid #000', padding: 12 }}>NAM CHAL JANG</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 12, fontWeight: 700 }}>{L('Date', 'วันที่')}</td>
                  <td style={{ border: '1px solid #000', padding: 12 }}>{fmtDateTH(form.documentDate)}</td>
                  <td style={{ border: '1px solid #000', padding: 12 }}></td>
                  <td style={{ border: '1px solid #000', padding: 12 }}></td>
                </tr>
              </tbody>
            </table>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 26 }}>
              <button
                onClick={() => setShowResult(false)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#64748b',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ← {L('Back to Edit', 'กลับไปแก้ไข')}
              </button>
              <button
                onClick={handlePrint}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🖨️ {L('Print', 'พิมพ์')}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }

          #payslip-print-area,
          #payslip-print-area * { visibility: visible !important; }

          .no-print { display: none !important; }

          @page {
            size: A5 portrait;
            margin: 6mm;
          }

          #payslip-print-area {
            position: static !important;
            width: auto !important;
            min-height: auto !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            background: #fff !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
            page-break-after: auto !important;
          }

          body,
          html {
            overflow: visible !important;
            height: auto !important;
          }

          #payslip-print-area > div:first-child {
            margin-bottom: 2mm !important;
            padding-bottom: 2mm !important;
            gap: 6px !important;
            page-break-inside: avoid !important;
          }
          #payslip-print-area img {
            width: 36px !important;
            height: 36px !important;
          }
          #payslip-print-area > div:first-child div[style*="fontSize: 20"],
          #payslip-print-area > div:first-child div[style*="fontWeight: 800"] {
            font-size: 9pt !important;
          }
          #payslip-print-area > div:first-child div[style*="fontSize: 12"],
          #payslip-print-area > div:first-child div[style*="fontSize: 14"] {
            font-size: 7pt !important;
          }
          #payslip-print-area > div:first-child div[style*="fontSize: 24"] {
            font-size: 11pt !important;
          }
          #payslip-print-area > div:first-child div[style*="minWidth"] {
            min-width: 100px !important;
          }

          /* All tables */
          #payslip-print-area table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 7pt !important;
            margin-bottom: 1.5mm !important;
            table-layout: fixed !important;
            page-break-inside: auto !important;
          }
          #payslip-print-area thead {
            display: table-header-group !important;
          }
          #payslip-print-area tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          #payslip-print-area td,
          #payslip-print-area th {
            padding: 1.5px 4px !important;
            line-height: 1.35 !important;
            word-break: break-word !important;
          }

          #payslip-print-area > div[style*="gridTemplateColumns: '1fr 1fr'"] {
            gap: 2mm !important;
            margin-bottom: 1.5mm !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </AccWindow>
  )
}
