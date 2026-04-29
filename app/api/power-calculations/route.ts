import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

const powerCalculationColumnDefs: Record<string, string> = {
  pre_inst_id: 'INT(11) NULL DEFAULT NULL',
  usage_history: 'LONGTEXT NULL DEFAULT NULL',
  voltage: 'DECIMAL(10,2) NULL DEFAULT NULL',
  current: 'DECIMAL(10,2) NULL DEFAULT NULL',
  power_factor: 'DECIMAL(5,4) NULL DEFAULT NULL',
  phase_type: 'VARCHAR(20) NULL DEFAULT NULL',
  company_name: 'VARCHAR(255) NULL DEFAULT NULL',
  customer_name: 'VARCHAR(255) NULL DEFAULT NULL',
  product_price: 'DECIMAL(15,2) NULL DEFAULT NULL',
  avg_monthly_usage: 'DECIMAL(15,2) NULL DEFAULT NULL',
  power_saving_rate: 'DECIMAL(5,2) NULL DEFAULT NULL',
  unit_price: 'DECIMAL(10,2) NULL DEFAULT NULL',
  expected_savings_percent: 'DECIMAL(5,2) NULL DEFAULT NULL',
  device_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  amortize_months: 'INT(11) NULL DEFAULT NULL',
  payment_months: 'INT(11) NULL DEFAULT NULL',
  contracted_capacity: 'DECIMAL(15,2) NULL DEFAULT NULL',
  peak_power: 'DECIMAL(15,2) NULL DEFAULT NULL',
  device_capacity: 'DECIMAL(15,2) NULL DEFAULT NULL',
  faucet_method: 'VARCHAR(255) NULL DEFAULT NULL',
  usage_data_months: 'INT(11) NULL DEFAULT NULL',
  emission_factor: 'DECIMAL(10,6) NULL DEFAULT NULL',
  appliances: 'LONGTEXT NULL DEFAULT NULL',
  monthly_kwh: 'LONGTEXT NULL DEFAULT NULL',
  january_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  january_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  february_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  february_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  march_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  march_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  april_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  april_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  may_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  may_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  june_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  june_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  july_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  july_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  august_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  august_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  september_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  september_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  october_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  october_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  november_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  november_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  december_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  december_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  total_annual_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  total_annual_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  average_monthly_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  average_monthly_cost: 'DECIMAL(15,2) NULL DEFAULT NULL',
  roi_years: 'DECIMAL(10,2) NULL DEFAULT NULL',
  roi_months: 'DECIMAL(10,2) NULL DEFAULT NULL',
  annual_savings_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  annual_savings_baht: 'DECIMAL(15,2) NULL DEFAULT NULL',
  monthly_savings_kwh: 'DECIMAL(15,2) NULL DEFAULT NULL',
  monthly_savings_baht: 'DECIMAL(15,2) NULL DEFAULT NULL',
  monthly_payment: 'DECIMAL(15,2) NULL DEFAULT NULL',
  carbon_reduction: 'DECIMAL(15,4) NULL DEFAULT NULL',
  breakeven_year: 'INT(11) NULL DEFAULT NULL',
  cumulative_10year_savings: 'DECIMAL(15,2) NULL DEFAULT NULL',
  twelve_months: 'LONGTEXT NULL DEFAULT NULL',
  pre_install_results: 'LONGTEXT NULL DEFAULT NULL',
  show_12month_modal: 'TINYINT(1) NULL DEFAULT 0',
  status: "VARCHAR(20) NULL DEFAULT 'completed'",
  updated_at: 'TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP',
}

let schemaEnsured = false
let calcIdFixed = false

async function ensurePowerCalculationsSchema() {
  if (schemaEnsured) return
  const conn = await pool.getConnection()
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS power_calculations (
        calcID INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        power_calcuNo VARCHAR(50) NULL,
        title VARCHAR(255) NULL,
        parameters LONGTEXT NULL,
        result LONGTEXT NULL,
        created_by VARCHAR(255) NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        cusID INT(11) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)

    const [rows]: any = await conn.query('SHOW COLUMNS FROM power_calculations')
    const existing = new Set(rows.map((r: any) => r.Field))
    for (const [column, definition] of Object.entries(powerCalculationColumnDefs)) {
      if (!existing.has(column)) {
        await conn.execute(`ALTER TABLE power_calculations ADD COLUMN ${column} ${definition}`)
      }
    }

    await conn.execute(`UPDATE power_calculations SET status = 'completed' WHERE status IS NULL`).catch(() => {})
    schemaEnsured = true
  } finally {
    conn.release()
  }
}

async function ensureCalcIdAutoIncrement() {
  if (calcIdFixed) return
  const conn = await pool.getConnection()
  try {
    // Check if calcID has AUTO_INCREMENT
    const [cols]: any = await conn.query(
      `SHOW COLUMNS FROM power_calculations WHERE Field = 'calcID'`
    )
    const extra: string = cols?.[0]?.Extra || ''
    if (!extra.includes('auto_increment')) {
      await conn.execute(
        `ALTER TABLE power_calculations MODIFY COLUMN calcID INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY`
      )
      console.log('power_calculations: restored AUTO_INCREMENT on calcID')
    }
    calcIdFixed = true
  } catch (e) {
    console.error('ensureCalcIdAutoIncrement error:', e)
  } finally {
    conn.release()
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensurePowerCalculationsSchema()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const calcID = searchParams.get('calcID') || searchParams.get('id')
    const cusID = searchParams.get('cusID')

    let query = `
      SELECT
        p.calcID,
        p.power_calcuNo,
        p.title,
        p.parameters,
        p.result,
        p.created_by,
        p.created_at,
        p.cusID,
        p.status,
        p.voltage,
        p.current,
        p.power_factor,
        p.phase_type,
        p.company_name,
        p.customer_name,
        p.product_price,
        p.avg_monthly_usage,
        p.power_saving_rate,
        p.unit_price,
        p.expected_savings_percent,
        p.device_cost,
        p.amortize_months,
        p.payment_months,
        p.contracted_capacity,
        p.peak_power,
        p.device_capacity,
        p.faucet_method,
        p.usage_data_months,
        p.emission_factor,
        p.january_kwh,
        p.january_cost,
        p.february_kwh,
        p.february_cost,
        p.march_kwh,
        p.march_cost,
        p.april_kwh,
        p.april_cost,
        p.may_kwh,
        p.may_cost,
        p.june_kwh,
        p.june_cost,
        p.july_kwh,
        p.july_cost,
        p.august_kwh,
        p.august_cost,
        p.september_kwh,
        p.september_cost,
        p.october_kwh,
        p.october_cost,
        p.november_kwh,
        p.november_cost,
        p.december_kwh,
        p.december_cost,
        p.total_annual_kwh,
        p.total_annual_cost,
        p.average_monthly_kwh,
        p.average_monthly_cost,
        p.roi_years,
        p.roi_months,
        p.annual_savings_kwh,
        p.annual_savings_baht,
        p.monthly_savings_kwh,
        p.monthly_savings_baht,
        p.monthly_payment,
        p.carbon_reduction,
        p.breakeven_year,
        p.cumulative_10year_savings,
        COALESCE(
          c.fullname,
          JSON_UNQUOTE(JSON_EXTRACT(p.parameters, '$.companyName')),
          p.title,
          '-'
        ) as customerName
      FROM power_calculations p
      LEFT JOIN cus_detail c ON p.cusID = c.cusID
      WHERE 1=1
    `

    const params: any[] = []

    if (calcID) {
      query += ` AND calcID = ?`
      params.push(calcID)
    }

    if (cusID) {
      query += ` AND p.cusID = ?`
      params.push(cusID)
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)
    // ถ้าต้องการรองรับชื่อภาษาอังกฤษ/ไทย สามารถปรับตรงนี้ได้ (เช่น fullname_en, fullname_th)

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM power_calculations WHERE 1=1`
    const countParams: any[] = []

    if (calcID) {
      countQuery += ` AND calcID = ?`
      countParams.push(calcID)
    }

    if (cusID) {
      countQuery += ` AND cusID = ?`
      countParams.push(cusID)
    }

    const [countResult] = await pool.query(countQuery, countParams)
    const total = (countResult as any)[0].total

    // If requesting single calculation by ID, return it as 'calculation' object
    if (calcID) {
      return NextResponse.json({
        success: true,
        calculation: (rows as any[])[0] || null,
        rows,
        total,
        limit,
        offset
      })
    }

    return NextResponse.json({
      success: true,
      calculations: rows,
      powerCalculations: rows,
      rows,
      total,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Power calculations API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensurePowerCalculationsSchema()
    await ensureCalcIdAutoIncrement()
    const body = await request.json()
    const {
      title,
      parameters,
      result,
      created_by,
      cusID,
      power_calcuNo,
      usage_history,
      pre_inst_id,
      status
    } = body

    // Check if power_calcuNo already exists (only if provided)
    if (power_calcuNo) {
      const [existingResult] = await pool.query(
        'SELECT calcID FROM power_calculations WHERE power_calcuNo = ?',
        [power_calcuNo]
      )
      if ((existingResult as any[]).length > 0) {
        return NextResponse.json(
          { success: false, error: 'Power Calcu No already exists. Please refresh to get a new number.' },
          { status: 400 }
        )
      }
    }

    // Store usage_history and pre_inst_id in parameters
    const enrichedParameters = {
      ...parameters,
      usage_history,
      pre_inst_id
    }

    // Extract ALL form fields for separate columns
    const voltage = parameters?.voltage || null
    const current = parameters?.current || null
    const powerFactor = parameters?.pf || null
    const phaseType = parameters?.phase || null
    const companyName = parameters?.companyName || null
    const customerName = parameters?.customerName || null
    const productPrice = parameters?.productPrice || null
    const avgMonthlyUsage = parameters?.avgMonthlyUsage || null
    const powerSavingRate = parameters?.powerSavingRate || null
    const unitPrice = parameters?.unitPrice || null
    const expectedSavingsPercent = parameters?.expectedSavingsPercent || null
    const deviceCost = parameters?.deviceCost || null
    const amortizeMonths = parameters?.amortizeMonths || null
    const paymentMonths = parameters?.paymentMonths || null
    const contractedCapacity = parameters?.contractedCapacity || null
    const peakPower = parameters?.peakPower || null
    const deviceCapacity = parameters?.deviceCapacity || null
    const faucetMethod = parameters?.faucetMethod || null
    const usageDataMonths = parameters?.usageDataMonths || null
    const emissionFactor = parameters?.emissionFactor || null
    const appliances = parameters?.appliances || null
    const monthlyKwh = parameters?.monthlyKwh || null
    const twelveMonths = parameters?.twelveMonths || null
    const preInstallResults = parameters?.preInstallResults || null
    const show12MonthModal = parameters?.show12MonthModal || false

    // Extract monthly electricity data (12 months)
    const monthlyKwhArray = Array.isArray(monthlyKwh) ? monthlyKwh : []
    const monthsData = {
      january_kwh: monthlyKwhArray[0] || null,
      january_cost: monthlyKwhArray[0] ? monthlyKwhArray[0] * (unitPrice || 0) : null,
      february_kwh: monthlyKwhArray[1] || null,
      february_cost: monthlyKwhArray[1] ? monthlyKwhArray[1] * (unitPrice || 0) : null,
      march_kwh: monthlyKwhArray[2] || null,
      march_cost: monthlyKwhArray[2] ? monthlyKwhArray[2] * (unitPrice || 0) : null,
      april_kwh: monthlyKwhArray[3] || null,
      april_cost: monthlyKwhArray[3] ? monthlyKwhArray[3] * (unitPrice || 0) : null,
      may_kwh: monthlyKwhArray[4] || null,
      may_cost: monthlyKwhArray[4] ? monthlyKwhArray[4] * (unitPrice || 0) : null,
      june_kwh: monthlyKwhArray[5] || null,
      june_cost: monthlyKwhArray[5] ? monthlyKwhArray[5] * (unitPrice || 0) : null,
      july_kwh: monthlyKwhArray[6] || null,
      july_cost: monthlyKwhArray[6] ? monthlyKwhArray[6] * (unitPrice || 0) : null,
      august_kwh: monthlyKwhArray[7] || null,
      august_cost: monthlyKwhArray[7] ? monthlyKwhArray[7] * (unitPrice || 0) : null,
      september_kwh: monthlyKwhArray[8] || null,
      september_cost: monthlyKwhArray[8] ? monthlyKwhArray[8] * (unitPrice || 0) : null,
      october_kwh: monthlyKwhArray[9] || null,
      october_cost: monthlyKwhArray[9] ? monthlyKwhArray[9] * (unitPrice || 0) : null,
      november_kwh: monthlyKwhArray[10] || null,
      november_cost: monthlyKwhArray[10] ? monthlyKwhArray[10] * (unitPrice || 0) : null,
      december_kwh: monthlyKwhArray[11] || null,
      december_cost: monthlyKwhArray[11] ? monthlyKwhArray[11] * (unitPrice || 0) : null
    }

    // Calculate summary values
    const totalAnnualKwh = monthlyKwhArray.reduce((sum: number, val: number) => sum + (val || 0), 0)
    const totalAnnualCost = totalAnnualKwh * (unitPrice || 0)
    const filledMonths = monthlyKwhArray.filter((v: number) => v > 0).length
    const averageMonthlyKwh = filledMonths > 0 ? totalAnnualKwh / filledMonths : null
    const averageMonthlyCost = filledMonths > 0 ? totalAnnualCost / filledMonths : null

    // Calculate ROI values
    const monthlySavingsKwh = (avgMonthlyUsage || 0) * ((powerSavingRate || 0) / 100)
    const monthlySavingsBaht = monthlySavingsKwh * (unitPrice || 0)
    const annualSavingsKwh = monthlySavingsKwh * 12
    const annualSavingsBaht = monthlySavingsBaht * 12
    const monthlyPaymentCalc = (paymentMonths && paymentMonths > 0) ? (productPrice || 0) / paymentMonths : null
    const roiYears = annualSavingsBaht > 0 ? (productPrice || 0) / annualSavingsBaht : null
    const roiMonths = roiYears ? roiYears * 12 : null
    const carbonReduction = annualSavingsKwh * (emissionFactor || 0.5) / 1000 // tons CO2
    const breakevenYear = roiYears ? Math.ceil(roiYears) : null
    const cumulative10YearSavings = (annualSavingsBaht * 10) - (productPrice || 0)

    // Generate calcID manually to avoid dependence on AUTO_INCREMENT
    const [maxRow]: any = await pool.query(
      `SELECT COALESCE(MAX(calcID), 0) + 1 AS nextId FROM power_calculations`
    )
    const nextCalcID: number = maxRow[0].nextId

    const query = `
      INSERT INTO power_calculations (
        calcID,
        power_calcuNo, title, parameters, result, created_by, cusID,
        pre_inst_id, usage_history, voltage, current, power_factor, phase_type,
        company_name, customer_name, product_price, avg_monthly_usage, power_saving_rate,
        unit_price, expected_savings_percent, device_cost, amortize_months,
        payment_months, contracted_capacity, peak_power, device_capacity,
        faucet_method, usage_data_months, emission_factor, appliances,
        monthly_kwh,
        january_kwh, january_cost, february_kwh, february_cost, march_kwh, march_cost,
        april_kwh, april_cost, may_kwh, may_cost, june_kwh, june_cost,
        july_kwh, july_cost, august_kwh, august_cost, september_kwh, september_cost,
        october_kwh, october_cost, november_kwh, november_cost, december_kwh, december_cost,
        total_annual_kwh, total_annual_cost, average_monthly_kwh, average_monthly_cost,
        roi_years, roi_months, annual_savings_kwh, annual_savings_baht,
        monthly_savings_kwh, monthly_savings_baht, monthly_payment, carbon_reduction,
        breakeven_year, cumulative_10year_savings,
        twelve_months, pre_install_results, show_12month_modal, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const [insertResult] = await pool.query(query, [
      nextCalcID,
      power_calcuNo,
      title || 'Untitled Calculation',
      JSON.stringify(enrichedParameters),
      JSON.stringify(result || {}),
      created_by || 'system',
      cusID || null,
      pre_inst_id || null,
      usage_history ? JSON.stringify(usage_history) : null,
      voltage,
      current,
      powerFactor,
      phaseType,
      companyName,
      customerName,
      productPrice,
      avgMonthlyUsage,
      powerSavingRate,
      unitPrice,
      expectedSavingsPercent,
      deviceCost,
      amortizeMonths,
      paymentMonths,
      contractedCapacity,
      peakPower,
      deviceCapacity,
      faucetMethod,
      usageDataMonths,
      emissionFactor,
      appliances ? JSON.stringify(appliances) : null,
      monthlyKwh ? JSON.stringify(monthlyKwh) : null,
      // Monthly data
      monthsData.january_kwh,
      monthsData.january_cost,
      monthsData.february_kwh,
      monthsData.february_cost,
      monthsData.march_kwh,
      monthsData.march_cost,
      monthsData.april_kwh,
      monthsData.april_cost,
      monthsData.may_kwh,
      monthsData.may_cost,
      monthsData.june_kwh,
      monthsData.june_cost,
      monthsData.july_kwh,
      monthsData.july_cost,
      monthsData.august_kwh,
      monthsData.august_cost,
      monthsData.september_kwh,
      monthsData.september_cost,
      monthsData.october_kwh,
      monthsData.october_cost,
      monthsData.november_kwh,
      monthsData.november_cost,
      monthsData.december_kwh,
      monthsData.december_cost,
      // Summary
      totalAnnualKwh,
      totalAnnualCost,
      averageMonthlyKwh,
      averageMonthlyCost,
      // ROI
      roiYears,
      roiMonths,
      annualSavingsKwh,
      annualSavingsBaht,
      monthlySavingsKwh,
      monthlySavingsBaht,
      monthlyPaymentCalc,
      carbonReduction,
      breakevenYear,
      cumulative10YearSavings,
      // JSON arrays and flags (at end to match DB schema)
      twelveMonths ? JSON.stringify(twelveMonths) : null,
      preInstallResults ? JSON.stringify(preInstallResults) : null,
      show12MonthModal ? 1 : 0,
      status || 'completed'
    ])

    return NextResponse.json({
      success: true,
      calcID: (insertResult as any).insertId || nextCalcID,
      powerCalcuNo: power_calcuNo
    })
  } catch (error: any) {
    console.error('Create power calculation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensurePowerCalculationsSchema()
    const body = await request.json()
    const {
      calcID,
      title,
      parameters,
      result,
      cusID,
      status,
      usage_history,
      pre_inst_id
    } = body

    if (!calcID) {
      return NextResponse.json(
        { success: false, error: 'calcID is required' },
        { status: 400 }
      )
    }

    // Store usage_history and pre_inst_id in parameters
    const enrichedParameters = {
      ...parameters,
      usage_history,
      pre_inst_id
    }

    // Extract ALL form fields for separate columns
    const voltage = parameters?.voltage || null
    const current = parameters?.current || null
    const powerFactor = parameters?.pf || null
    const phaseType = parameters?.phase || null
    const companyName = parameters?.companyName || null
    const customerName = parameters?.customerName || null
    const productPrice = parameters?.productPrice || null
    const avgMonthlyUsage = parameters?.avgMonthlyUsage || null
    const powerSavingRate = parameters?.powerSavingRate || null
    const unitPrice = parameters?.unitPrice || null
    const expectedSavingsPercent = parameters?.expectedSavingsPercent || null
    const deviceCost = parameters?.deviceCost || null
    const amortizeMonths = parameters?.amortizeMonths || null
    const paymentMonths = parameters?.paymentMonths || null
    const contractedCapacity = parameters?.contractedCapacity || null
    const peakPower = parameters?.peakPower || null
    const deviceCapacity = parameters?.deviceCapacity || null
    const faucetMethod = parameters?.faucetMethod || null
    const usageDataMonths = parameters?.usageDataMonths || null
    const emissionFactor = parameters?.emissionFactor || null
    const appliances = parameters?.appliances || null
    const monthlyKwh = parameters?.monthlyKwh || null
    const twelveMonths = parameters?.twelveMonths || null
    const preInstallResults = parameters?.preInstallResults || null
    const show12MonthModal = parameters?.show12MonthModal || false

    // Extract monthly electricity data (12 months)
    const monthlyKwhArray = Array.isArray(monthlyKwh) ? monthlyKwh : []
    const monthsData = {
      january_kwh: monthlyKwhArray[0] || null,
      january_cost: monthlyKwhArray[0] ? monthlyKwhArray[0] * (unitPrice || 0) : null,
      february_kwh: monthlyKwhArray[1] || null,
      february_cost: monthlyKwhArray[1] ? monthlyKwhArray[1] * (unitPrice || 0) : null,
      march_kwh: monthlyKwhArray[2] || null,
      march_cost: monthlyKwhArray[2] ? monthlyKwhArray[2] * (unitPrice || 0) : null,
      april_kwh: monthlyKwhArray[3] || null,
      april_cost: monthlyKwhArray[3] ? monthlyKwhArray[3] * (unitPrice || 0) : null,
      may_kwh: monthlyKwhArray[4] || null,
      may_cost: monthlyKwhArray[4] ? monthlyKwhArray[4] * (unitPrice || 0) : null,
      june_kwh: monthlyKwhArray[5] || null,
      june_cost: monthlyKwhArray[5] ? monthlyKwhArray[5] * (unitPrice || 0) : null,
      july_kwh: monthlyKwhArray[6] || null,
      july_cost: monthlyKwhArray[6] ? monthlyKwhArray[6] * (unitPrice || 0) : null,
      august_kwh: monthlyKwhArray[7] || null,
      august_cost: monthlyKwhArray[7] ? monthlyKwhArray[7] * (unitPrice || 0) : null,
      september_kwh: monthlyKwhArray[8] || null,
      september_cost: monthlyKwhArray[8] ? monthlyKwhArray[8] * (unitPrice || 0) : null,
      october_kwh: monthlyKwhArray[9] || null,
      october_cost: monthlyKwhArray[9] ? monthlyKwhArray[9] * (unitPrice || 0) : null,
      november_kwh: monthlyKwhArray[10] || null,
      november_cost: monthlyKwhArray[10] ? monthlyKwhArray[10] * (unitPrice || 0) : null,
      december_kwh: monthlyKwhArray[11] || null,
      december_cost: monthlyKwhArray[11] ? monthlyKwhArray[11] * (unitPrice || 0) : null
    }

    // Calculate summary values
    const totalAnnualKwh = monthlyKwhArray.reduce((sum: number, val: number) => sum + (val || 0), 0)
    const totalAnnualCost = totalAnnualKwh * (unitPrice || 0)
    const filledMonths = monthlyKwhArray.filter((v: number) => v > 0).length
    const averageMonthlyKwh = filledMonths > 0 ? totalAnnualKwh / filledMonths : null
    const averageMonthlyCost = filledMonths > 0 ? totalAnnualCost / filledMonths : null

    // Calculate ROI values
    const monthlySavingsKwh = (avgMonthlyUsage || 0) * ((powerSavingRate || 0) / 100)
    const monthlySavingsBaht = monthlySavingsKwh * (unitPrice || 0)
    const annualSavingsKwh = monthlySavingsKwh * 12
    const annualSavingsBaht = monthlySavingsBaht * 12
    const monthlyPaymentCalc = (paymentMonths && paymentMonths > 0) ? (productPrice || 0) / paymentMonths : null
    const roiYears = annualSavingsBaht > 0 ? (productPrice || 0) / annualSavingsBaht : null
    const roiMonths = roiYears ? roiYears * 12 : null
    const carbonReduction = annualSavingsKwh * (emissionFactor || 0.5) / 1000 // tons CO2
    const breakevenYear = roiYears ? Math.ceil(roiYears) : null
    const cumulative10YearSavings = (annualSavingsBaht * 10) - (productPrice || 0)

    const query = `
      UPDATE power_calculations
      SET
        title = ?,
        parameters = ?,
        result = ?,
        cusID = ?,
        status = ?,
        pre_inst_id = ?,
        usage_history = ?,
        voltage = ?,
        current = ?,
        power_factor = ?,
        phase_type = ?,
        company_name = ?,
        customer_name = ?,
        product_price = ?,
        avg_monthly_usage = ?,
        power_saving_rate = ?,
        unit_price = ?,
        expected_savings_percent = ?,
        device_cost = ?,
        amortize_months = ?,
        payment_months = ?,
        contracted_capacity = ?,
        peak_power = ?,
        device_capacity = ?,
        faucet_method = ?,
        usage_data_months = ?,
        emission_factor = ?,
        appliances = ?,
        monthly_kwh = ?,
        twelve_months = ?,
        pre_install_results = ?,
        show_12month_modal = ?,
        january_kwh = ?, january_cost = ?, february_kwh = ?, february_cost = ?,
        march_kwh = ?, march_cost = ?, april_kwh = ?, april_cost = ?,
        may_kwh = ?, may_cost = ?, june_kwh = ?, june_cost = ?,
        july_kwh = ?, july_cost = ?, august_kwh = ?, august_cost = ?,
        september_kwh = ?, september_cost = ?, october_kwh = ?, october_cost = ?,
        november_kwh = ?, november_cost = ?, december_kwh = ?, december_cost = ?,
        total_annual_kwh = ?, total_annual_cost = ?, average_monthly_kwh = ?, average_monthly_cost = ?,
        roi_years = ?, roi_months = ?, annual_savings_kwh = ?, annual_savings_baht = ?,
        monthly_savings_kwh = ?, monthly_savings_baht = ?, monthly_payment = ?, carbon_reduction = ?,
        breakeven_year = ?, cumulative_10year_savings = ?
      WHERE calcID = ?
    `

    await pool.query(query, [
      title || 'Untitled Calculation',
      JSON.stringify(enrichedParameters || {}),
      JSON.stringify(result || {}),
      cusID || null,
      status || 'completed',
      pre_inst_id || null,
      usage_history ? JSON.stringify(usage_history) : null,
      voltage,
      current,
      powerFactor,
      phaseType,
      companyName,
      customerName,
      productPrice,
      avgMonthlyUsage,
      powerSavingRate,
      unitPrice,
      expectedSavingsPercent,
      deviceCost,
      amortizeMonths,
      paymentMonths,
      contractedCapacity,
      peakPower,
      deviceCapacity,
      faucetMethod,
      usageDataMonths,
      emissionFactor,
      appliances ? JSON.stringify(appliances) : null,
      monthlyKwh ? JSON.stringify(monthlyKwh) : null,
      twelveMonths ? JSON.stringify(twelveMonths) : null,
      preInstallResults ? JSON.stringify(preInstallResults) : null,
      show12MonthModal ? 1 : 0,
      // Monthly data
      monthsData.january_kwh, monthsData.january_cost, monthsData.february_kwh, monthsData.february_cost,
      monthsData.march_kwh, monthsData.march_cost, monthsData.april_kwh, monthsData.april_cost,
      monthsData.may_kwh, monthsData.may_cost, monthsData.june_kwh, monthsData.june_cost,
      monthsData.july_kwh, monthsData.july_cost, monthsData.august_kwh, monthsData.august_cost,
      monthsData.september_kwh, monthsData.september_cost, monthsData.october_kwh, monthsData.october_cost,
      monthsData.november_kwh, monthsData.november_cost, monthsData.december_kwh, monthsData.december_cost,
      // Summary
      totalAnnualKwh, totalAnnualCost, averageMonthlyKwh, averageMonthlyCost,
      // ROI
      roiYears, roiMonths, annualSavingsKwh, annualSavingsBaht,
      monthlySavingsKwh, monthlySavingsBaht, monthlyPaymentCalc, carbonReduction,
      breakevenYear, cumulative10YearSavings,
      calcID
    ])

    return NextResponse.json({
      success: true,
      calcID
    })
  } catch (error: any) {
    console.error('Update power calculation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const calcID = searchParams.get('calcID')

    if (!calcID) {
      return NextResponse.json(
        { success: false, error: 'calcID is required' },
        { status: 400 }
      )
    }

    const query = `DELETE FROM power_calculations WHERE calcID = ?`
    await pool.query(query, [calcID])

    return NextResponse.json({
      success: true,
      calcID
    })
  } catch (error: any) {
    console.error('Delete power calculation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
