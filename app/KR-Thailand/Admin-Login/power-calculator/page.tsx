"use client"

import React, { useEffect, useState, useMemo } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from '../admin-theme.module.css'

export default function PowerCalculatorPage() {
  const searchParams = useSearchParams()
  const editCalcID = searchParams?.get('calcID')
    // ตรวจสอบและสร้างข้อมูลใหม่ถ้ายังไม่มีในฐานข้อมูล
    useEffect(() => {
      async function ensureInitialData() {
        try {
          const res = await fetch('/api/power-calculations?limit=1')
          const j = await res.json()
          if (j && j.success && Array.isArray(j.rows) && j.rows.length === 0) {
            // ยังไม่มีข้อมูล สร้างข้อมูลใหม่
            await fetch('/api/power-calculations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: 'Power Calculation',
                parameters: { voltage: 230, current: 0, pf: 1, phase: 'single', appliances: [] },
                result: { real: 0, apparent: 0, reactive: 0 },
                created_by: 'system',
                cusID: null
              })
            })
          }
        } catch (e) {
          // ignore error
        }
      }
      ensureInitialData()
    }, [])

  // Auto-generate Power Calcu No on page load
  useEffect(() => {
    async function generatePowerCalcuNo() {
      try {
        const res = await fetch('/api/power-calcu-seq')
        const j = await res.json()
        if (res.ok && j && j.success && j.formatted) {
          setPowerCalcuNo(j.formatted)
        }
      } catch (e) {
        console.error('Auto-generate power calcu no error', e)
      }
    }
    generatePowerCalcuNo()
  }, [])

  // Load existing calculation data for editing
  useEffect(() => {
    if (!editCalcID) return

    async function loadExistingData() {
      try {
        const res = await fetch(`/api/power-calculations?calcID=${editCalcID}`)
        const json = await res.json()
        if (json.success && json.rows && json.rows[0]) {
          const data = json.rows[0]
          const params = data.parameters ? (typeof data.parameters === 'string' ? JSON.parse(data.parameters) : data.parameters) : {}
          const result = data.result ? (typeof data.result === 'string' ? JSON.parse(data.result) : data.result) : {}

          // Load all parameters
          setTitle(data.title || 'Power Calculation')
          setPowerCalcuNo(data.power_calcuNo || '')
          setVoltage(params.voltage || 230)
          setCurrent(params.current || 0)
          setPf(params.pf || 1)
          setPhase(params.phase || 'single')
          setAppliances(params.appliances || [])
          setUsageHistory(params.usage_history || params.usageHistory || [])
          setResults(result)
          setCompanyName(params.companyName || '')
          setCustomerName(params.customerName || '')
          setUnitPrice(params.unitPrice || 5.0)
          setExpectedSavingsPercent(params.expectedSavingsPercent || 10)
          setDeviceCost(params.deviceCost || 0)
          setAmortizeMonths(params.amortizeMonths || 12)
          setContractedCapacity(params.contractedCapacity || 0)
          setPeakPower(params.peakPower || 0)
          setAvgMonthlyUsage(params.avgMonthlyUsage || 0)
          setFaucetMethod(params.faucetMethod || '')
          setPowerSavingRate(params.powerSavingRate || 10)
          setDeviceCapacity(params.deviceCapacity || 30)
          setProductPrice(params.productPrice || 128037)
          setPaymentMonths(params.paymentMonths || 60)
          setUsageDataMonths(params.usageDataMonths || 6)
          setMonthlyKwh(params.monthlyKwh || Array(12).fill(0))
          setTwelveMonths(params.twelveMonths || [])

          // Load customer if available
          if (data.cusID) {
            setCustomer({
              cusID: data.cusID,
              name: data.customerName || params.companyName || '',
              phone: '',
              address: ''
            })
          }
        }
      } catch (err) {
        console.error('Failed to load calculation data', err)
      }
    }

    loadExistingData()
  }, [editCalcID])

  const router = useRouter()
  const [voltage, setVoltage] = useState<number>(230)
  const [current, setCurrent] = useState<number>(0)
  const [pf, setPf] = useState<number>(1)
  const [phase, setPhase] = useState<'single'|'three'>('single')
  const [appliances, setAppliances] = useState<Array<any>>([])
  const [newAppliance, setNewAppliance] = useState<{name:string; power:number; qty:number; hours:number}>({ name: '', power: 5, qty: 1, hours: 1 })
  const [usageHistory, setUsageHistory] = useState<Array<any>>([])
  const [newUsage, setNewUsage] = useState<{period:string; kwh:number; peak_kw?:number}>({ period: '', kwh: 0 })
  const [results, setResults] = useState({ real: 0, apparent: 0, reactive: 0 })
  const [title, setTitle] = useState<string>('Power Calculation')
  const [customer, setCustomer] = useState<{ cusID?: number; name?: string; phone?: string; address?: string } | null>(null)
  const [loadingSave, setLoadingSave] = useState(false)
  const [loadingSaveDraft, setLoadingSaveDraft] = useState(false)
  const [powerCalcuNo, setPowerCalcuNo] = useState<string | null>(null)
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerResults, setCustomerResults] = useState<any[]>([])
  const [searchingCustomers, setSearchingCustomers] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)
  const [productResults, setProductResults] = useState<any[]>([])
  const [searchingProducts, setSearchingProducts] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{ productID?: number; name?: string; price?: number } | null>(null)
  const [preInstallResults, setPreInstallResults] = useState<any[]>([])
  const [showPreInstallModal, setShowPreInstallModal] = useState(false)
  const [loadingPreInsts, setLoadingPreInsts] = useState(false)
  const [importedPreInstID, setImportedPreInstID] = useState<number | string | null>(null)
  
  const [show12MonthModal, setShow12MonthModal] = useState(false)
  const [twelveMonths, setTwelveMonths] = useState<Array<{ period: string; kwh: number; peak_kw?: number }>>([])
  const [unitPrice, setUnitPrice] = useState<number>(5.0)
  const [expectedSavingsPercent, setExpectedSavingsPercent] = useState<number>(10)
  const [deviceCost, setDeviceCost] = useState<number>(0)
  const [amortizeMonths, setAmortizeMonths] = useState<number>(12)
  const [contractedCapacity, setContractedCapacity] = useState<number>(0)
  const [peakPower, setPeakPower] = useState<number>(0)
  const [avgMonthlyUsage, setAvgMonthlyUsage] = useState<number>(0)
  const [faucetMethod, setFaucetMethod] = useState<string>('')
  const [powerSavingRate, setPowerSavingRate] = useState<number>(10)
  const [deviceCapacity, setDeviceCapacity] = useState<number>(30)
  const [productPrice, setProductPrice] = useState<number>(128037)
  const [paymentMonths, setPaymentMonths] = useState<number>(60)
  const [emissionFactor] = useState<number>(0.466)
  const [companyName, setCompanyName] = useState<string>('')
  const [customerName, setCustomerName] = useState<string>('')
  const [usageDataMonths, setUsageDataMonths] = useState<number>(6)

  // Monthly electricity data for editable table (Jan-Dec)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const monthNamesTh = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  const [monthlyKwh, setMonthlyKwh] = useState<number[]>(() => Array(12).fill(0))

  // Print / report helpers
  const printReport = () => {
    try {
      const titleText = title || 'Power Calculation Report'
      const data = {
        title: titleText,
        customer,
        voltage, current, pf, phase,
        appliances,
        usageHistory,
        results
      }

      const rowsAppliances = (appliances || []).map(a => `
        <tr>
          <td>${(a.name||'')}</td>
          <td style="text-align:right">${Number(a.power||0).toLocaleString()}</td>
          <td style="text-align:center">${Number(a.qty||1)}</td>
          <td style="text-align:center">${Number(a.hours||0)}</td>
        </tr>
      `).join('')

      const rowsUsage = (usageHistory || []).map(u => `
        <tr>
          <td>${u.period||''}</td>
          <td style="text-align:right">${Number(u.kwh||0).toLocaleString()}</td>
          <td style="text-align:right">${u.peak_kw ? Number(u.peak_kw).toFixed(2) : '-'}</td>
        </tr>
      `).join('')

      const html = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${titleText}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding: 20px; color: #222 }
          h1 { font-size: 20px; margin-bottom: 6px }
          .meta { margin-bottom: 12px; color: #444 }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12px }
          th, td { border: 1px solid #ddd; padding: 6px }
          th { background: #f3f4f6; text-align: left }
          .footer { position: fixed; bottom: 8px; left: 0; right: 0; text-align: center; font-size: 12px; color: #666 }
          @media print {
            @page { margin: 18mm }
            .footer { position: fixed; bottom: 8px }
            .pagenum:after { content: counter(page) }
            .totalpages:after { content: counter(pages) }
          }
        </style>
      </head>
      <body>
        <h1>${titleText}</h1>
        <div class="meta">
          <div><strong>Customer:</strong> ${customer?.name || ''} ${customer?.phone ? ' — ' + customer.phone : ''}</div>
          <div><strong>Calculated:</strong> ${new Date().toLocaleString()}</div>
        </div>

        <h3>Inputs</h3>
        <table>
          <tr><th>Voltage (V)</th><td>${voltage}</td><th>Phase</th><td>${phase}</td></tr>
          <tr><th>Current (A)</th><td>${current}</td><th>Power Factor</th><td>${pf}</td></tr>
        </table>

        <h3>Appliances</h3>
        <table>
          <thead><tr><th>Name</th><th style="text-align:right">Power (W)</th><th style="text-align:center">Qty</th><th style="text-align:center">Hours/day</th></tr></thead>
          <tbody>
            ${rowsAppliances}
          </tbody>
        </table>

        <h3>Results</h3>
        <table>
          <tr><th>Apparent (VA)</th><td>${results.apparent.toFixed(2)}</td><th>Real (W)</th><td>${results.real.toFixed(2)}</td></tr>
          <tr><th>Reactive (VAR)</th><td>${results.reactive.toFixed(2)}</td><th>Estimated Current (A)</th><td>${((phase === 'single' ? results.apparent / voltage : results.apparent / (Math.sqrt(3) * voltage)) || 0).toFixed(2)}</td></tr>
        </table>

        <h3>Usage History</h3>
        <table>
          <thead><tr><th>Period</th><th style="text-align:right">kWh</th><th style="text-align:right">Peak kW</th></tr></thead>
          <tbody>
            ${rowsUsage}
          </tbody>
        </table>

        

        <div class="footer">${'Page '}<span class="pagenum"></span>${' / '}<span class="totalpages"></span></div>
        <script>
          // Auto print when opened
          window.onload = function() { setTimeout(function(){ window.print(); }, 200); }
        </script>
      </body>
      </html>`

      const w = window.open('', '_blank')
      if (!w) return alert('Unable to open print window')
      w.document.open()
      w.document.write(html)
      w.document.close()
    } catch (err) {
      console.error('Print report error', err)
      alert('Failed to prepare report')
    }
  }

  const [locale, setLocale] = useState<'en'|'th'>('th')

  useEffect(() => {
    // Read locale from localStorage on client side only
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l)
    } catch (_e) {}

    const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLocale(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  // Initialize twelveMonths with last 12 YYYY-MM periods
  useEffect(() => {
    if (twelveMonths && twelveMonths.length > 0) return
    const arr: Array<{ period: string; kwh: number }> = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      arr.push({ period: `${y}-${m}`, kwh: 0 })
    }
    setTwelveMonths(arr.reverse())
  }, [])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  // Compute from appliances when available, otherwise use manual current
  useEffect(() => {
    let apparent = 0
    let real = 0
    if (appliances && appliances.length > 0) {
      const totalW = appliances.reduce((s, a) => s + (Number(a.power) || 0) * (Number(a.qty) || 1), 0)
      // Apparent power S in VA approximated by totalW / PF
      apparent = totalW / (Number(pf) || 1)
      real = totalW
    } else {
      // Calculate based on phase type
      const v = Number(voltage)
      const i = Number(current)
      const powerFactor = Number(pf)

      if (phase === 'three') {
        // Three-phase: S = √3 × V × I
        apparent = Math.sqrt(3) * v * i
      } else {
        // Single-phase: S = V × I
        apparent = v * i
      }

      // Real power: P = S × PF
      real = apparent * powerFactor
    }
    const reactive = Math.sqrt(Math.max(0, apparent * apparent - real * real))
    setResults({ real, apparent, reactive })
  }, [voltage, current, pf, phase, appliances])

  // Compute monthly electricity cost summary data from editable monthlyKwh state
  const monthlyElectricitySummary = useMemo(() => {
    const rows = monthNames.map((m, idx) => {
      const kwh = monthlyKwh[idx] || 0
      const cost = kwh * Number(unitPrice || 0)
      return { month: m, monthTh: monthNamesTh[idx], kwh, cost, index: idx }
    })

    const totalKwh = monthlyKwh.reduce((sum, kwh) => sum + (kwh || 0), 0)
    const totalCost = totalKwh * Number(unitPrice || 0)
    const filledMonths = monthlyKwh.filter(k => k > 0).length
    const avgKwh = filledMonths > 0 ? totalKwh / filledMonths : 0
    const avgCost = filledMonths > 0 ? totalCost / filledMonths : 0

    return { rows, totalKwh, totalCost, avgKwh, avgCost, filledMonths }
  }, [monthlyKwh, unitPrice, monthNames, monthNamesTh])

  // Function to update monthly kWh value
  const updateMonthlyKwh = (index: number, value: number) => {
    setMonthlyKwh(prev => {
      const newArr = [...prev]
      newArr[index] = value
      return newArr
    })
  }

  // Sync monthlyKwh with usageHistory for saving
  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    const newHistory = monthlyKwh.map((kwh, idx) => ({
      period: `${year}-${String(idx + 1).padStart(2, '0')}`,
      kwh: kwh || 0
    })).filter(h => h.kwh > 0)
    setUsageHistory(newHistory)
  }, [monthlyKwh])

  // Auto-calculate average monthly usage from filled months
  useEffect(() => {
    const filledMonths = monthlyKwh.filter(k => k > 0)
    if (filledMonths.length > 0) {
      const avg = filledMonths.reduce((s, k) => s + k, 0) / filledMonths.length
      setAvgMonthlyUsage(Math.round(avg))
      setUsageDataMonths(filledMonths.length)
    }
  }, [monthlyKwh])

  // Compute usage history totals for profit/loss table
  const usageHistoryTotals = useMemo(() => {
    const totals = (usageHistory || []).reduce((s: any, u: any) => {
      const kwh = Number(u.kwh || 0)
      const price = Number(unitPrice || 0)
      const costBefore = kwh * price
      const savedKwh = kwh * (Number(expectedSavingsPercent || 0) / 100)
      const costAfter = (kwh - savedKwh) * price
      const savingBaht = costBefore - costAfter
      s.kwh += kwh
      s.costBefore += costBefore
      s.savingBaht += savingBaht
      s.costAfter += costAfter
      s.monthlyProfit += (savingBaht - (amortizeMonths > 0 ? (Number(deviceCost || 0) / Number(amortizeMonths || 1)) : 0))
      return s
    }, { kwh: 0, costBefore: 0, savingBaht: 0, costAfter: 0, monthlyProfit: 0 })

    const annualSavings = (usageHistory || []).reduce((s: number, u: any) =>
      s + (Number(u.kwh || 0) * Number(unitPrice || 0) * (Number(expectedSavingsPercent || 0) / 100)), 0)

    const paybackMonths = deviceCost > 0
      ? Math.max(0, Number(deviceCost) / Math.max(1, annualSavings / 12))
      : 0

    return { ...totals, annualSavings, paybackMonths }
  }, [usageHistory, unitPrice, expectedSavingsPercent, amortizeMonths, deviceCost])

  // Compute power analysis summary values
  const powerAnalysis = useMemo(() => {
    const monthlySavingsKwh = avgMonthlyUsage * (powerSavingRate / 100);
    const monthlySavingsBaht = monthlySavingsKwh * unitPrice;
    const annualSavingsBaht = monthlySavingsBaht * 12;
    const carbonReduction = monthlySavingsKwh * 12 * emissionFactor;
    const monthlyPayment = paymentMonths > 0 ? productPrice / paymentMonths : 0;
    const roiYears = annualSavingsBaht > 0 ? productPrice / annualSavingsBaht : 0;

    // ROI table data (14 years)
    const roiTableData = Array.from({ length: 14 }).map((_, idx) => {
      const year = idx + 1;
      const cumulative = (annualSavingsBaht * year) - productPrice;
      return {
        year,
        annualSavings: annualSavingsBaht,
        cumulative,
        investment: productPrice,
        progressPercent: Math.min(100, Math.max(0, ((annualSavingsBaht * year) / (productPrice * 2)) * 100))
      };
    });

    return {
      monthlySavingsKwh,
      monthlySavingsBaht,
      annualSavingsBaht,
      carbonReduction,
      monthlyPayment,
      roiYears,
      roiTableData
    };
  }, [avgMonthlyUsage, powerSavingRate, unitPrice, emissionFactor, productPrice, paymentMonths]);

  return (
    <AdminLayout title="Power Calculator" titleTh="เครื่องคิดกำลังไฟฟ้า">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            {L('Power Calculator', 'เครื่องคิดกำลังไฟฟ้า')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Calculate electrical power values', 'คำนวณค่ากำลังไฟฟ้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Power Calcu No','เลขที่บิล')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input value={powerCalcuNo || ''} onChange={e => setPowerCalcuNo(e.target.value || null)} placeholder={L('Bill No','เลขที่บิล')} className={styles.formInput} style={{ width: 320 }} required />
                <button type="button" className={`${styles.btn} ${styles.btnOutline}`} onClick={async () => {
                  try {
                    const res = await fetch('/api/power-calcu-seq')
                    const j = await res.json()
                    if (res.ok && j && j.success && j.formatted) {
                      setPowerCalcuNo(j.formatted)
                    } else {
                      alert(L('Failed to generate number','สร้างเลขไม่สำเร็จ'))
                    }
                  } catch (e) { console.error('gen seq error', e); alert(L('Failed to generate number','สร้างเลขไม่สำเร็จ')) }
                }}>{L('Refresh','รีเฟรช')}</button>
              </div>
            </div>
            {show12MonthModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <div style={{ background: '#fff', padding: 16, borderRadius: 8, width: 'min(920px, 96%)', maxHeight: '90vh', overflow: 'auto' }}>
                  <h3>{L('Enter last 12 months usage','กรอกค่าไฟย้อนหลัง 12 เดือน')}</h3>
                  <div style={{ marginTop: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: 8 }}>Period</th>
                          <th style={{ textAlign: 'right', padding: 8 }}>kWh</th>
                          <th style={{ textAlign: 'right', padding: 8 }}>Peak kW</th>
                        </tr>
                      </thead>
                      <tbody>
                        {twelveMonths.map((m, idx) => (
                          <tr key={m.period} style={{ borderTop: '1px solid #eee' }}>
                            <td style={{ padding: 8 }}>{m.period}</td>
                            <td style={{ padding: 8, textAlign: 'right' }}>
                              <input type="number" value={m.kwh} onChange={e => setTwelveMonths(s => { const copy = [...s]; copy[idx] = { ...copy[idx], kwh: Number(e.target.value) }; return copy })} style={{ width: '100%', textAlign: 'right' }} />
                            </td>
                            <td style={{ padding: 8, textAlign: 'right' }}>
                              <input type="number" value={(m as any).peak_kw || ''} onChange={e => setTwelveMonths(s => { const copy = [...s]; copy[idx] = { ...copy[idx], peak_kw: e.target.value ? Number(e.target.value) : undefined }; return copy })} style={{ width: '100%', textAlign: 'right' }} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setShow12MonthModal(false)}>{L('Cancel','ยกเลิก')}</button>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => {
                      setUsageHistory(twelveMonths)
                      setShow12MonthModal(false)
                    }}>{L('Save 12 months','บันทึก 12 เดือน')}</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Title and Customer Search */}
          <div style={{ marginTop: 18, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #e6eef6' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder={L('Title (optional)','หัวข้อ (ไม่บังคับ)')} className={styles.formInput} style={{ width: 280 }} />
              <button type="button" onClick={async () => {
                setLoadingPreInsts(true)
                try {
                  const [formsRes, contractsRes] = await Promise.all([
                    fetch('/api/pre-installation?limit=200'),
                    fetch('/api/contracts')
                  ])
                  const jf = await formsRes.json()
                  const jc = await contractsRes.json()
                  const used = Array.isArray(jc.contracts) ? jc.contracts.map((c: any) => String(c.preInstID)) : []
                  if (jf && jf.success && Array.isArray(jf.forms)) {
                    const forms = jf.forms.map((f: any) => ({ ...f, used: used.includes(String(f.formID)) }))
                    setPreInstallResults(forms)
                    setShowPreInstallModal(true)
                  } else {
                    alert(L('No pre-installation forms found','ไม่พบแบบฟอร์มก่อนการติดตั้ง'))
                  }
                } catch (err) {
                  console.error('Fetch pre-installations error', err)
                  alert(L('Failed to load pre-installation list','ไม่สามารถโหลดรายการแบบฟอร์มก่อนการติดตั้ง'))
                } finally {
                  setLoadingPreInsts(false)
                }
              }} className={styles.btnOutline}>{loadingPreInsts ? L('Loading...','กำลังโหลด...') : L('Import from Pre-installation','ดึงลูกค้าจากแบบฟอร์มก่อนติดตั้ง')}</button>
              {importedPreInstID && <div style={{ color: '#0b7285' }}>{L('Imported Form:','นำเข้าแบบฟอร์ม:')} {importedPreInstID}</div>}
              <input className={styles.formInput} placeholder={L('Search customer by name/phone','ค้นหาลูกค้าด้วยชื่อ/โทร')} value={customerSearchTerm} onChange={e => setCustomerSearchTerm(e.target.value)} style={{ width: 220 }} />
              <button className={`${styles.btn} ${styles.btnOutline}`} onClick={async () => {
                if (!customerSearchTerm) return alert(L('Enter search term','กรุณาระบุคำค้น'))
                setSearchingCustomers(true)
                try {
                  const res = await fetch(`/api/customers?search=${encodeURIComponent(customerSearchTerm)}`)
                  const j = await res.json()
                  if (res.ok && j && Array.isArray(j.customers)) {
                    setCustomerResults(j.customers)
                  } else {
                    setCustomerResults([])
                    alert(L('No customers found','ไม่พบลูกค้า'))
                  }
                } catch (err) {
                  setCustomerResults([])
                  console.error('Customer search error', err)
                  alert(L('Search failed','ค้นหาไม่สำเร็จ'))
                } finally {
                  setSearchingCustomers(false)
                }
              }}>{searchingCustomers ? L('Searching...','ค้นหา...') : L('Search Customer','ค้นหาลูกค้า')}</button>
            </div>

            {/* Voltage, Phase, Current, Power Factor */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 12 }}>
              <div className={styles.formGroup} style={{ margin: 0 }}>
                <label className={styles.formLabel}>{L('Voltage (V)', 'แรงดัน (V)')}</label>
                <input type="number" value={voltage} onChange={e => setVoltage(Number(e.target.value))} className={styles.formInput} style={{ width: 100 }} />
              </div>
              <div className={styles.formGroup} style={{ margin: 0 }}>
                <label className={styles.formLabel}>{L('Phase', 'เฟส')}</label>
                <select value={phase} onChange={e => setPhase(e.target.value as any)} className={styles.formSelect} style={{ width: 140 }}>
                  <option value="single">{L('Single-phase', 'เฟสเดี่ยว')}</option>
                  <option value="three">{L('Three-phase', 'เฟสสามเฟส')}</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ margin: 0 }}>
                <label className={styles.formLabel}>{L('Current (A)', 'กระแส (A)')}</label>
                <input type="number" value={current} onChange={e => setCurrent(Number(e.target.value))} className={styles.formInput} style={{ width: 100 }} />
              </div>
              <div className={styles.formGroup} style={{ margin: 0 }}>
                <label className={styles.formLabel}>{L('Power Factor', 'ตัวประกอบกำลัง')}</label>
                <input type="number" step="0.01" min="0" max="1" value={pf} onChange={e => setPf(Number(e.target.value))} className={styles.formInput} style={{ width: 100 }} />
              </div>
            </div>

            {appliances.length > 0 && (
              <table className={styles.table} style={{ width: '100%', marginTop: 8, tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '45%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '15%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>{L('Name','ชื่อ')}</th>
                    <th style={{ textAlign: 'right' }}>{L('Power (W)','กำลัง (W)')}</th>
                    <th style={{ textAlign: 'center' }}>{L('Qty','จำนวน')}</th>
                    <th style={{ textAlign: 'center' }}>{L('Hours/day','ชม./วัน')}</th>
                    <th style={{ textAlign: 'center' }}>{L('Actions','จัดการ')}</th>
                  </tr>
                </thead>
                <tbody>
                  {appliances.map((a, i) => (
                    <tr key={i}>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</td>
                      <td style={{ textAlign: 'right' }}>{Number(a.power).toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>{a.qty}</td>
                      <td style={{ textAlign: 'center' }}>{a.hours}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button className={styles.btnOutline} onClick={() => setAppliances(s => s.filter((_, idx) => idx !== i))}>{L('Remove','ลบ')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Customer search results */}
          {customerResults.length > 0 && (
            <div style={{ marginTop: 18, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #e6eef6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{L('Search Results','ผลการค้นหา')}</div>
                <button className={styles.btnOutline} onClick={() => setCustomerResults([])}>{L('Close','ปิด')}</button>
              </div>
              {customerResults.length === 0 ? (
                <div style={{ color: '#666' }}>{L('No customers','ไม่พบลูกค้า')}</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.table} style={{ width: '100%', minWidth: 600, tableLayout: 'fixed' }}>
                    <colgroup><col style={{ width: '35%' }} /><col style={{ width: '20%' }} /><col style={{ width: '30%' }} /><col style={{ width: '15%' }} /></colgroup>
                    <thead>
                      <tr><th>{L('Name','ชื่อ')}</th><th>{L('Phone','โทรศัพท์')}</th><th>{L('Address','ที่อยู่')}</th><th style={{ textAlign: 'center' }}>{L('Action','เลือก')}</th></tr>
                    </thead>
                    <tbody>
                      {customerResults.map((c, i) => (
                        <tr key={i}>
                          <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.fullname || c.name || ''}</td>
                          <td style={{ fontSize: 13 }}>{c.phone || c.tel || c.customer_phone || ''}</td>
                          <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>{c.address || c.site_address || ''}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => { const customerName = c.fullname || c.name || ''; setCustomer({ cusID: c.cusID, name: customerName, phone: c.phone || c.tel || c.customer_phone || '', address: c.address || c.site_address || '' }); setCompanyName(customerName); setCustomerResults([]); setCustomerSearchTerm('') }}>{L('Select','เลือก')}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '24px', background: 'linear-gradient(135deg, #255899 0%, #1e4a80 100%)', padding: '24px', borderRadius: '12px', color: '#fff' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>{L('Results', 'ผลลัพธ์')}</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>{L('Apparent Power (S)', 'กำลังปรากฏ (S)')}</div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{results.apparent.toFixed(2)}</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>VA</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>{L('Real Power (P)', 'กำลังจริง (P)')}</div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{results.real.toFixed(2)}</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>W</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>{L('Reactive Power (Q)', 'กำลังรีแอคทีฟ (Q)')}</div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{results.reactive.toFixed(2)}</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>VAR</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '4px' }}>{L('Estimated Current', 'กระแสโดยประมาณ')}</div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{((phase === 'single' ? results.apparent / voltage : results.apparent / (Math.sqrt(3) * voltage)) || 0).toFixed(2)}</div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>A</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', fontSize: '14px', color: '#64748b' }}>
            <strong>{L('Formulas:', 'สูตร:')}</strong>
            <ul style={{ margin: '8px 0 0 20px', paddingLeft: '0' }}>
              <li>S (Apparent) = V × I</li>
              <li>P (Real) = S × PF</li>
              <li>Q (Reactive) = √(S² - P²)</li>
            </ul>
          </div>

          {showCustomerModal && (
            <div style={{ marginTop: 12, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #e6eef6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{L('Search Results','ผลการค้นหา')}</div>
                <button className={styles.btnOutline} onClick={() => setShowCustomerModal(false)}>{L('Close','ปิด')}</button>
              </div>
              {customerResults.length === 0 ? (
                <div style={{ color: '#666' }}>{L('No customers','ไม่พบลูกค้า')}</div>
              ) : (
                <table className={styles.table} style={{ width: '100%', tableLayout: 'fixed' }}>
                  <colgroup><col style={{ width: '40%' }} /><col style={{ width: '30%' }} /><col style={{ width: '20%' }} /><col style={{ width: '10%' }} /></colgroup>
                  <thead>
                    <tr><th>{L('Name','ชื่อ')}</th><th>{L('Phone','โทรศัพท์')}</th><th>{L('Address','ที่อยู่')}</th><th>{L('Action','เลือก')}</th></tr>
                  </thead>
                  <tbody>
                    {customerResults.map((c, i) => (
                      <tr key={i}>
                        <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.fullname || c.name || ''}</td>
                        <td>{c.phone || c.tel || c.customer_phone || ''}</td>
                        <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || c.site_address || ''}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => { const customerName = c.fullname || c.name || ''; setCustomer({ cusID: c.cusID, name: customerName, phone: c.phone || c.tel || c.customer_phone || '', address: c.address || c.site_address || '' }); setCompanyName(customerName); setShowCustomerModal(false); setCustomerSearchTerm('') }}>{L('Select','เลือก')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {showProductModal && (
            <div style={{ marginTop: 12, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #e6eef6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{L('Product Search Results','ผลการค้นหาสินค้า')}</div>
                <button className={styles.btnOutline} onClick={() => setShowProductModal(false)}>{L('Close','ปิด')}</button>
              </div>
              {productResults.length === 0 ? (
                <div style={{ color: '#666' }}>{L('No products','ไม่พบสินค้า')}</div>
              ) : (
                <table className={styles.table} style={{ width: '100%', tableLayout: 'fixed' }}>
                  <colgroup><col style={{ width: '15%' }} /><col style={{ width: '35%' }} /><col style={{ width: '20%' }} /><col style={{ width: '20%' }} /><col style={{ width: '10%' }} /></colgroup>
                  <thead>
                    <tr><th>{L('SKU','รหัส')}</th><th>{L('Name','ชื่อสินค้า')}</th><th>{L('Capacity','ความจุ')}</th><th>{L('Price','ราคา')}</th><th>{L('Action','เลือก')}</th></tr>
                  </thead>
                  <tbody>
                    {productResults.map((p, i) => (
                      <tr key={i}>
                        <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.sku || '-'}</td>
                        <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name || ''}</td>
                        <td>{p.capacity || '-'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{(p.price || 0).toLocaleString()}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => {
                            setSelectedProduct({ productID: p.productID, name: p.name, price: p.price || 0 })
                            setProductPrice(p.price || 0)
                            setShowProductModal(false)
                            setProductSearchTerm('')
                          }}>{L('Select','เลือก')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {showPreInstallModal && (
            <div style={{ marginTop: 12, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #e6eef6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{L('Pre-installation Forms','แบบฟอร์มก่อนติดตั้ง')}</div>
                <button className={styles.btnOutline} onClick={() => setShowPreInstallModal(false)}>{L('Close','ปิด')}</button>
              </div>
              {preInstallResults.length === 0 ? (
                <div style={{ color: '#666' }}>{L('No forms found','ไม่พบแบบฟอร์ม')}</div>
              ) : (
                <table className={styles.table} style={{ width: '100%', tableLayout: 'fixed' }}>
                  <colgroup><col style={{ width: '20%' }} /><col style={{ width: '40%' }} /><col style={{ width: '20%' }} /><col style={{ width: '20%' }} /></colgroup>
                  <thead>
                    <tr><th>{L('Form ID','รหัส')}</th><th>{L('Site / Customer','สถานที่/ลูกค้า')}</th><th>{L('Created','สร้างเมื่อ')}</th><th>{L('Action','เลือก')}</th></tr>
                  </thead>
                  <tbody>
                    {preInstallResults.map((f, i) => (
                      <tr key={i}>
                        <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.formID}</td>
                        <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.site_address || f.customer_name || f.site_name || '-'}</td>
                        <td>{new Date(f.created_at).toLocaleString()}</td>
                        <td style={{ textAlign: 'center' }}>
                          {f.used ? (
                            <span style={{ color: '#888' }}>{L('Used','ใช้งานแล้ว')}</span>
                          ) : (
                            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={async () => {
                              try {
                                const res = await fetch(`/api/pre-installation?id=${encodeURIComponent(f.formID)}`)
                                const j = await res.json()
                                if (!res.ok || !j.success || !j.form) return alert(L('Pre-installation form not found', 'ไม่พบแบบฟอร์มก่อนการติดตั้ง'))
                                const form = j.form
                                const cu = form.customer || { fullname: form.customer_name || form.site_name, phone: form.customer_phone, address: form.site_address || form.address }
                                const customerName = cu.fullname || cu.name || ''
                                setCustomer({ cusID: cu.cusID, name: customerName, phone: cu.phone || cu.contact_phone || '', address: cu.address || cu.site_address || '' })
                                setCompanyName(customerName)
                                setImportedPreInstID(form.formID || form.formID)
                                setShowPreInstallModal(false)
                                alert(L('Customer imported from Pre-installation', 'ดึงข้อมูลลูกค้าจากแบบฟอร์มก่อนการติดตั้งเรียบร้อย'))
                              } catch (err) {
                                console.error('Import pre-installation error', err)
                                alert(L('Failed to import pre-installation form', 'ไม่สามารถดึงข้อมูลแบบฟอร์มก่อนการติดตั้ง'))
                              }
                            }}>{L('Select','เลือก')}</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {customer && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#fff', border: '1px solid #e6eef6' }}>
              <div style={{ fontWeight: 700 }}>{L('Customer', 'ลูกค้า')}:</div>
              <div style={{ fontSize: 13 }}>{customer.name}</div>
              {customer.phone && <div style={{ fontSize: 13 }}>{L('Phone','โทร')}: {customer.phone}</div>}
              {customer.address && <div style={{ fontSize: 13 }}>{L('Address','ที่อยู่')}: {customer.address}</div>}
            </div>
          )}

          {/* Pricing / savings inputs and 12-month profit/loss table */}
          <div style={{ marginTop: 16, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #eef2ff' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 13, color: '#334155' }}>{L('Unit price (THB/kWh)','ราคา/หน่วย (บาท/หน่วย)')}</label>
                <input type="number" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} className={styles.formInput} style={{ width: 120 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 13, color: '#334155' }}>{L('Expected saving %','คาดการณ์การประหยัด (%)')}</label>
                <input type="number" value={expectedSavingsPercent} onChange={e => setExpectedSavingsPercent(Number(e.target.value))} className={styles.formInput} style={{ width: 80 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 13, color: '#334155' }}>{L('Device cost (THB)','ราคาติดตั้ง (บาท)')}</label>
                <input type="number" value={deviceCost} onChange={e => setDeviceCost(Number(e.target.value))} className={styles.formInput} style={{ width: 140 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 13, color: '#334155' }}>{L('Amortize months','ผ่อนต่อ (เดือน)')}</label>
                <input type="number" value={amortizeMonths} onChange={e => setAmortizeMonths(Number(e.target.value) || 1)} className={styles.formInput} style={{ width: 80 }} />
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              {(!usageHistory || usageHistory.length === 0) ? (
                <div style={{ color: '#666' }}>{L('No usage history available. Add usage or import 12 months.','ยังไม่มีข้อมูลย้อนหลัง กรุณาเพิ่มหรือดึงข้อมูล 12 เดือน')}</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.table} style={{ width: '100%', minWidth: 900, tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '12%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>{L('Period','ช่วง')}</th>
                        <th style={{ textAlign: 'right' }}>{L('kWh','หน่วย kWh')}</th>
                        <th style={{ textAlign: 'right' }}>{L('Unit price','ราคา/หน่วย')}</th>
                        <th style={{ textAlign: 'right' }}>{L('Cost before','ค่าไฟก่อน')}</th>
                        <th style={{ textAlign: 'right' }}>{L('Savings %','ประหยัด %')}</th>
                        <th style={{ textAlign: 'right' }}>{L('kWh saved','หน่วยที่ประหยัด')}</th>
                        <th style={{ textAlign: 'right' }}>{L('Cost after','ค่าไฟหลัง')}</th>
                        <th style={{ textAlign: 'right' }}>{L('Monthly profit','กำไร(บาท)/เดือน')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageHistory.map((u: any, i: number) => {
                        const kwh = Number(u.kwh || 0)
                        const price = Number(unitPrice || 0)
                        const costBefore = kwh * price
                        const savedKwh = kwh * (Number(expectedSavingsPercent || 0) / 100)
                        const costAfter = (kwh - savedKwh) * price
                        const savingBaht = costBefore - costAfter
                        const monthlyDevice = amortizeMonths > 0 ? (Number(deviceCost || 0) / Number(amortizeMonths || 1)) : 0
                        const monthlyProfit = savingBaht - monthlyDevice
                        return (
                          <tr key={i}>
                            <td>{u.period || ''}</td>
                            <td style={{ textAlign: 'right' }}>{kwh.toLocaleString()}</td>
                            <td style={{ textAlign: 'right' }}>{price.toFixed(2)}</td>
                            <td style={{ textAlign: 'right' }}>{costBefore.toFixed(2)}</td>
                            <td style={{ textAlign: 'right' }}>{Number(expectedSavingsPercent || 0).toFixed(1)}%</td>
                            <td style={{ textAlign: 'right' }}>{savedKwh.toFixed(2)}</td>
                            <td style={{ textAlign: 'right' }}>{costAfter.toFixed(2)}</td>
                            <td style={{ textAlign: 'right' }}>{monthlyProfit.toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th style={{ textAlign: 'left' }}>{L('Total','รวม')}</th>
                        <th style={{ textAlign: 'right' }}>{usageHistoryTotals.kwh.toLocaleString()}</th>
                        <th></th>
                        <th style={{ textAlign: 'right' }}>{usageHistoryTotals.costBefore.toFixed(2)}</th>
                        <th></th>
                        <th style={{ textAlign: 'right' }}>{(usageHistoryTotals.savingBaht / (unitPrice || 1)).toFixed(2)}</th>
                        <th style={{ textAlign: 'right' }}>{usageHistoryTotals.costAfter.toFixed(2)}</th>
                        <th style={{ textAlign: 'right' }}>{usageHistoryTotals.monthlyProfit.toFixed(2)}</th>
                      </tr>
                    </tfoot>
                  </table>
                  <div style={{ marginTop: 8, color: '#334155' }}>
                    <div>{L('Estimated annual savings (THB):','คาดการณ์การประหยัดต่อปี (บาท):')} {usageHistoryTotals.annualSavings.toFixed(2)}</div>
                    <div>{L('Estimated payback period (months):','ระยะเวลาคืนทุน (เดือน):')} {deviceCost > 0 ? usageHistoryTotals.paybackMonths.toFixed(1) : '-'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Power saving analysis table - matching reference design */}
          <div style={{ marginTop: 20, padding: 0, background: '#fff', borderRadius: 8, border: '2px solid #255899', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #255899 0%, #1e4a80 100%)', padding: '16px 20px', color: '#fff' }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{L('Power saving analysis table', 'ตารางวิเคราะห์การประหยัดพลังงาน')}</h2>
              <div style={{ marginTop: 8, fontSize: 14 }}>
                {L('Based on the power saving rate:', 'อิงจากอัตราประหยัด:')} ( <span style={{ color: '#ff0', fontWeight: 700 }}>{powerSavingRate}%</span> ) {L('this is an economic feasibility analysis of installing', 'นี่คือการวิเคราะห์ความเป็นไปได้ทางเศรษฐกิจของการติดตั้ง')}
                <br />{L('a "smart power saving device" for', 'อุปกรณ์ประหยัดพลังงานอัจฉริยะสำหรับ')} <strong style={{ color: '#ff0' }}>{companyName || customer?.name || L('Customer', 'ลูกค้า')}</strong>
              </div>
            </div>

            <div style={{ padding: 20 }}>
              {/* Company name input */}
              <div style={{ marginBottom: 16 }}>
                <label className={styles.formLabel}>{L('Company Name', 'ชื่อบริษัท')}</label>
                <input className={styles.formInput} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder={L('Enter company name', 'กรอกชื่อบริษัท')} style={{ maxWidth: 400 }} />
              </div>

              {/* Customer name input */}
              <div style={{ marginBottom: 16 }}>
                <label className={styles.formLabel}>{L('Customer Name', 'ชื่อลูกค้า')}</label>
                <input className={styles.formInput} value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={L('Enter customer name', 'กรอกชื่อลูกค้า')} style={{ maxWidth: 400 }} />
              </div>

              {/* Section 1: Contracted capacity and average monthly usage */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ background: '#255899', color: '#fff', padding: '8px 12px', fontWeight: 600, fontSize: 14 }}>
                  ■ {L('Contracted capacity and average monthly usage', 'ความจุสัญญาและค่าเฉลี่ยการใช้งานรายเดือน')}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'left', width: '35%' }}>{L('List Title', 'รายการ')}</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right', width: '25%' }}>{L('Detail', 'รายละเอียด')}</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'left', width: '40%' }}>{L('Note', 'หมายเหตุ')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Current (A)', 'กระแสไฟฟ้า (A)')}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right' }}>
                        <input type="number" className={styles.formInput} value={contractedCapacity || ''} onChange={e => setContractedCapacity(Number(e.target.value || 0))} style={{ width: 100, textAlign: 'right' }} /> <span style={{ color: '#d00', fontWeight: 600 }}>KVA</span>
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px' }}></td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Peak power', 'กำลังสูงสุด')}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right' }}>
                        <input type="number" className={styles.formInput} value={peakPower || ''} onChange={e => setPeakPower(Number(e.target.value || 0))} style={{ width: 100, textAlign: 'right' }} /> <span style={{ color: '#d00', fontWeight: 600 }}>KW</span>
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', color: '#0066cc' }}>{L('Maximum peak (Peak usage)', 'ค่าพีคสูงสุด (การใช้งานสูงสุด)')}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Average monthly usage', 'ค่าเฉลี่ยการใช้รายเดือน')}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right' }}>
                        <input type="number" className={styles.formInput} value={avgMonthlyUsage || ''} onChange={e => setAvgMonthlyUsage(Number(e.target.value || 0))} style={{ width: 120, textAlign: 'right' }} /> <span style={{ color: '#d00', fontWeight: 600 }}>KVA</span>
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px' }}></td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Electric faucet method', 'วิธีการวัดไฟฟ้า')}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right' }}>
                        <input type="text" className={styles.formInput} value={faucetMethod || ''} onChange={e => setFaucetMethod(e.target.value)} style={{ width: 100, textAlign: 'right' }} />
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px' }}></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 2: Details */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ background: '#255899', color: '#fff', padding: '8px 12px', fontWeight: 600, fontSize: 14 }}>
                  ■ {L('Details', 'รายละเอียด')}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'left', width: '35%' }}>{L('List Title', 'รายการ')}</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right', width: '25%' }}>{L('Detail', 'รายละเอียด')}</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'left', width: '40%' }}>{L('Note', 'หมายเหตุ')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Monthly average', 'ค่าเฉลี่ยรายเดือน')}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{avgMonthlyUsage.toLocaleString()}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', color: '#d00' }}>
                        {L('Usage for', 'ใช้งาน')} <input type="number" value={usageDataMonths} onChange={e => setUsageDataMonths(Number(e.target.value || 0))} style={{ width: 50, textAlign: 'center', border: '1px solid #ccc', borderRadius: 4 }} /> {L('months', 'เดือน')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Power saving rate (%)', 'อัตราประหยัดพลังงาน (%)')}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right' }}>
                        <input type="number" className={styles.formInput} value={powerSavingRate} onChange={e => setPowerSavingRate(Number(e.target.value || 0))} style={{ width: 80, textAlign: 'right' }} />%
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px' }}></td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Monthly savings', 'การประหยัดรายเดือน')}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{powerAnalysis.monthlySavingsBaht.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px' }}></td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Annual savings', 'การประหยัดรายปี')}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{powerAnalysis.annualSavingsBaht.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', color: '#d00' }}>12 {L('months', 'เดือน')}</td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Carbon emission reduction', 'การลดการปล่อย CO2')}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{powerAnalysis.carbonReduction.toFixed(3)}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px' }}></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 3: Smart power saving device */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ background: '#255899', color: '#fff', padding: '8px 12px', fontWeight: 600, fontSize: 14 }}>
                  ■ {L('Smart power saving device application capacity and installation amount', 'ขนาดอุปกรณ์ประหยัดพลังงานและจำนวนเงินติดตั้ง')}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                      <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'left', width: '35%' }}>{L('List Title', 'รายการ')}</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right', width: '25%' }}>{L('Detail', 'รายละเอียด')}</th>
                      <th style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'left', width: '40%' }}>{L('Note', 'หมายเหตุ')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Applicable capacity', 'ขนาดที่ใช้ได้')}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right' }}>
                        <select className={styles.formInput} value={deviceCapacity} onChange={e => setDeviceCapacity(Number(e.target.value))} style={{ width: 100 }}>
                          <option value="30">30</option>
                          <option value="50">50</option>
                          <option value="80">80</option>
                          <option value="100">100</option>
                          <option value="150">150</option>
                        </select> <span style={{ color: '#d00', fontWeight: 600 }}>KVA</span>
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px' }}></td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Product price', 'ราคาสินค้า')}</td>
                      <td colSpan={2} style={{ border: '1px solid #ddd', padding: '8px 12px' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            className={styles.formInput}
                            placeholder={L('Search product by name/SKU','ค้นหาสินค้าด้วยชื่อ/SKU')}
                            value={productSearchTerm}
                            onChange={e => setProductSearchTerm(e.target.value)}
                            style={{ width: 200 }}
                          />
                          <button className={`${styles.btn} ${styles.btnOutline}`} onClick={async () => {
                            setSearchingProducts(true)
                            try {
                              const searchQuery = productSearchTerm.trim() ? `?q=${encodeURIComponent(productSearchTerm)}` : '?limit=100'
                              const res = await fetch(`/api/products${searchQuery}`)
                              const j = await res.json()
                              if (res.ok && j && j.success && Array.isArray(j.products)) {
                                setProductResults(j.products)
                                setShowProductModal(true)
                              } else {
                                setProductResults([])
                                alert(L('No products found','ไม่พบสินค้า'))
                              }
                            } catch (err) {
                              setProductResults([])
                              console.error('Product search error', err)
                              alert(L('Search failed','ค้นหาไม่สำเร็จ'))
                            } finally {
                              setSearchingProducts(false)
                            }
                          }}>{searchingProducts ? L('Searching...','ค้นหา...') : L('Search Product','ค้นหาสินค้า')}</button>
                          {selectedProduct && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#ecfdf5', border: '1px solid #86efac', borderRadius: 6 }}>
                              <span style={{ fontSize: 13, color: '#065f46' }}>{selectedProduct.name}</span>
                              <span style={{ fontSize: 15, fontWeight: 700, color: '#059669' }}>{(selectedProduct.price || 0).toLocaleString()} {L('Baht','บาท')}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Monthly payment', 'ผ่อนชำระรายเดือน')}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{powerAnalysis.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span style={{ color: '#d00', fontWeight: 600 }}>{L('Baht', 'บาท')}</span></td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', color: '#d00' }}>
                        <select className={styles.formSelect} value={paymentMonths} onChange={e => setPaymentMonths(Number(e.target.value))} style={{ width: 80 }}>
                          <option value={12}>12</option>
                          <option value={18}>18</option>
                          <option value={24}>24</option>
                          <option value={30}>30</option>
                          <option value={36}>36</option>
                          <option value={42}>42</option>
                          <option value={48}>48</option>
                          <option value={54}>54</option>
                          <option value={60}>60</option>
                        </select> {L('months', 'เดือน')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', background: '#fffde7' }}>{L('Total investment amount', 'จำนวนเงินลงทุนทั้งหมด')}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{productPrice.toLocaleString()}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px 12px' }}></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ROI Display */}
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ background: '#255899', color: '#fff', padding: '8px 12px', fontWeight: 600, fontSize: 14 }}>
                  ■ ROI
                </div>
                <div style={{ background: '#fffde7', border: '2px solid #255899', padding: '12px 24px', borderRadius: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: '#d00' }}>{powerAnalysis.roiYears.toFixed(1)}</span>
                  <span style={{ fontSize: 14, marginLeft: 8, color: '#666' }}>({L('year/month', 'ปี/เดือน')})</span>
                </div>
              </div>

              {/* ROI Table with Progress Bars */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#255899', color: '#fff' }}>
                        <th style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'center' }}>{L('Year', 'ปี')}</th>
                        <th style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'right' }}>{L('Annual savings', 'ประหยัด/ปี')}</th>
                        <th style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'left', width: '40%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{L('Cumulative', 'สะสม')}</span>
                            <span style={{ color: '#ff0' }}>▼{productPrice.toLocaleString()}</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {powerAnalysis.roiTableData.map((row) => (
                        <tr key={row.year}>
                          <td style={{ border: '1px solid #ddd', padding: '4px 8px', textAlign: 'center' }}>{row.year}</td>
                          <td style={{ border: '1px solid #ddd', padding: '4px 8px', textAlign: 'right' }}>{row.annualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td style={{ border: '1px solid #ddd', padding: '4px 8px', position: 'relative' }}>
                            <div style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: `${row.progressPercent}%`,
                              background: `linear-gradient(90deg, #ff6b6b 0%, #ffd93d 30%, #6bcb77 100%)`,
                              opacity: 0.7
                            }} />
                            <span style={{ position: 'relative', zIndex: 1, fontWeight: row.cumulative >= 0 ? 600 : 400, color: row.cumulative >= 0 ? '#006600' : '#000' }}>
                              {row.cumulative.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Electricity Cost Summary - Editable */}
                <div>
                  <div style={{ background: '#255899', color: '#fff', padding: '6px 12px', fontWeight: 600, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{L('Electricity Cost Summary', 'สรุปค่าไฟฟ้า')}</span>
                    <span style={{ fontSize: 11, opacity: 0.8 }}>({L('Editable', 'กรอกข้อมูลได้')})</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#0066cc', color: '#fff' }}>
                        <th style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{L('Month', 'เดือน')}</th>
                        <th style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'right' }}>{L('Usage(kWh)', 'การใช้(kWh)')}</th>
                        <th style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'right' }}>{L('Electricity Cost', 'ค่าไฟฟ้า')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyElectricitySummary.rows.map((row) => (
                        <tr key={row.month}>
                          <td style={{ border: '1px solid #ddd', padding: '4px 8px', background: row.kwh > 0 ? '#fffde7' : '#fff', fontSize: 12 }}>
                            {locale === 'th' ? row.monthTh : row.month}
                          </td>
                          <td style={{ border: '1px solid #ddd', padding: '2px 4px', textAlign: 'right' }}>
                            <input
                              type="number"
                              value={row.kwh || ''}
                              onChange={(e) => updateMonthlyKwh(row.index, Number(e.target.value) || 0)}
                              placeholder="0"
                              style={{
                                width: '100%',
                                border: '1px solid #ddd',
                                borderRadius: 4,
                                padding: '4px 6px',
                                textAlign: 'right',
                                fontSize: 12,
                                background: row.kwh > 0 ? '#fff8e1' : '#fff',
                                color: row.kwh > 0 ? '#d00' : '#666'
                              }}
                            />
                          </td>
                          <td style={{ border: '1px solid #ddd', padding: '4px 8px', textAlign: 'right', color: row.cost > 0 ? '#d00' : '#999', fontWeight: row.cost > 0 ? 600 : 400, fontSize: 12 }}>
                            {row.cost > 0 ? row.cost.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#fffde7', fontWeight: 600 }}>
                        <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{L('Total', 'รวม')}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'right', color: '#d00' }}>{monthlyElectricitySummary.totalKwh.toLocaleString()}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'right', color: '#d00' }}>{monthlyElectricitySummary.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      </tr>
                      <tr style={{ background: '#f0f0f0' }}>
                        <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>
                          {L('Average', 'เฉลี่ย')}
                          {monthlyElectricitySummary.filledMonths > 0 && (
                            <span style={{ fontSize: 10, color: '#666', marginLeft: 4 }}>({monthlyElectricitySummary.filledMonths} {L('months', 'เดือน')})</span>
                          )}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'right' }}>{monthlyElectricitySummary.avgKwh.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'right' }}>{monthlyElectricitySummary.avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Note section */}
              <div style={{ marginTop: 16, padding: 12, background: '#fffde7', borderRadius: 4, fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: '#255899', marginBottom: 4 }}>■ {L('Note', 'หมายเหตุ')}</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: '#666' }}>
                  <li>{L("The lifespan of K Energy Save's power saving device is semi-permanent, and the table above shows savings based on 10 years.", 'อายุการใช้งานของอุปกรณ์ประหยัดพลังงาน K Energy Save เป็นกึ่งถาวร และตารางด้านบนแสดงการประหยัดตาม 10 ปี')}</li>
                  <li>{L('Investment payback period may vary depending on electricity usage.', 'ระยะเวลาคืนทุนอาจแตกต่างกันขึ้นอยู่กับการใช้ไฟฟ้า')}</li>
                  <li>{L('The power saving rate is 8% to 15% and may increase depending on site conditions.', 'อัตราประหยัดพลังงานอยู่ที่ 8% ถึง 15% และอาจเพิ่มขึ้นขึ้นอยู่กับสภาพหน้างาน')}</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <button type="button" onClick={async () => {
              setLoadingSave(true)
              try {
                let createdBy = 'thailand admin'
                try {
                  const raw = typeof window !== 'undefined' ? localStorage.getItem('k_system_admin_user') : null
                  if (raw) {
                    const u = JSON.parse(raw)
                    createdBy = u?.name || u?.username || u?.userId || u?.email || createdBy
                  }
                } catch (_) {}
                const payload: any = {
                  title: title || null,
                  parameters: {
                    voltage,
                    current,
                    pf,
                    phase,
                    appliances,
                    usageHistory,
                    unitPrice,
                    expectedSavingsPercent,
                    deviceCost,
                    amortizeMonths,
                    contractedCapacity,
                    peakPower,
                    avgMonthlyUsage,
                    faucetMethod,
                    powerSavingRate,
                    deviceCapacity,
                    productPrice,
                    paymentMonths,
                    emissionFactor,
                    companyName,
                    customerName,
                    usageDataMonths,
                    monthlyKwh,
                    preInstallResults,
                    importedPreInstID,
                    show12MonthModal,
                    twelveMonths
                  },
                  result: results,
                  power_calcuNo: powerCalcuNo || null,
                  cusID: customer?.cusID || null,
                  usage_history: usageHistory,
                  pre_inst_id: importedPreInstID || null,
                  created_by: createdBy,
                  status: 'completed'
                }

                // If editing existing record, include calcID and use PUT method
                const method = editCalcID ? 'PUT' : 'POST'
                if (editCalcID) {
                  payload.calcID = editCalcID
                }

                const res = await fetch('/api/power-calculations', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                const j = await res.json()
                if (res.ok && j && j.success) {
                  // After save, go to list page
                  router.push('/KR-Thailand/Admin-Login/power-calculator/list')
                } else {
                  alert(L('Save failed', 'บันทึกไม่สำเร็จ') + ': ' + (j?.error || res.statusText))
                }
              } catch (err) {
                console.error('Save power calculation error', err)
                alert(L('Server error while saving', 'เกิดข้อผิดพลาดขณะบันทึก'))
              } finally {
                setLoadingSave(false)
              }
            }} className={`${styles.btn} ${styles.btnPrimary}`}>{loadingSave ? L('Saving...','กำลังบันทึก...') : L('Save Calculation','บันทึกการคำนวณ')}</button>

            <button type="button" onClick={async () => {
              setLoadingSaveDraft(true)
              try {
                let createdBy = 'thailand admin'
                try {
                  const raw = typeof window !== 'undefined' ? localStorage.getItem('k_system_admin_user') : null
                  if (raw) {
                    const u = JSON.parse(raw)
                    createdBy = u?.name || u?.username || u?.userId || u?.email || createdBy
                  }
                } catch (_) {}
                const payload: any = {
                  title: title || null,
                  parameters: {
                    voltage,
                    current,
                    pf,
                    phase,
                    appliances,
                    usageHistory,
                    unitPrice,
                    expectedSavingsPercent,
                    deviceCost,
                    amortizeMonths,
                    contractedCapacity,
                    peakPower,
                    avgMonthlyUsage,
                    faucetMethod,
                    powerSavingRate,
                    deviceCapacity,
                    productPrice,
                    paymentMonths,
                    emissionFactor,
                    companyName,
                    customerName,
                    usageDataMonths,
                    monthlyKwh,
                    preInstallResults,
                    importedPreInstID,
                    show12MonthModal,
                    twelveMonths
                  },
                  result: results,
                  power_calcuNo: powerCalcuNo || null,
                  cusID: customer?.cusID || null,
                  usage_history: usageHistory,
                  pre_inst_id: importedPreInstID || null,
                  created_by: createdBy,
                  status: 'draft'
                }

                // If editing existing record, include calcID and use PUT method
                const method = editCalcID ? 'PUT' : 'POST'
                if (editCalcID) {
                  payload.calcID = editCalcID
                }

                const res = await fetch('/api/power-calculations', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                const j = await res.json()
                if (res.ok && j && j.success) {
                  alert(L('Draft saved successfully', 'บันทึกร่างสำเร็จ'))
                  router.push('/KR-Thailand/Admin-Login/power-calculator/list')
                } else {
                  alert(L('Save draft failed', 'บันทึกร่างไม่สำเร็จ') + ': ' + (j?.error || res.statusText))
                }
              } catch (err) {
                console.error('Save draft error', err)
                alert(L('Server error while saving draft', 'เกิดข้อผิดพลาดขณะบันทึกร่าง'))
              } finally {
                setLoadingSaveDraft(false)
              }
            }} className={`${styles.btn} ${styles.btnOutline}`}>{loadingSaveDraft ? L('Saving...','กำลังบันทึก...') : L('Save Draft','บันทึกร่าง')}</button>

            <button type="button" onClick={() => { setCustomer(null); setTitle('Power Calculation') }} className={`${styles.btn} ${styles.btnOutline}`} style={{ marginLeft: 8 }}>{L('Clear','ล้าง')}</button>
          </div>

        </div>
      </div>
    </AdminLayout>
  )
}
