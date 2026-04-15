"use client"

import { useEffect, useState } from 'react'
import styles from '../../admin-theme.module.css'

interface PowerCalculatorModalProps {
  calcID: string | number
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

export default function PowerCalculatorModal({ calcID, isOpen, onClose, onSave }: PowerCalculatorModalProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Form states
  const [customerName, setCustomerName] = useState('')
  const [voltage, setVoltage] = useState(230)
  const [current, setCurrent] = useState(0)
  const [pf, setPf] = useState(1)
  const [phase, setPhase] = useState('single')
  const [companyName, setCompanyName] = useState('')
  const [unitPrice, setUnitPrice] = useState(5.0)
  const [powerSavingRate, setPowerSavingRate] = useState(10)
  const [deviceCapacity, setDeviceCapacity] = useState(30)
  const [productPrice, setProductPrice] = useState(0)
  const [paymentMonths, setPaymentMonths] = useState(60)
  const [avgMonthlyUsage, setAvgMonthlyUsage] = useState(0)
  const [locale, setLocale] = useState<'en' | 'th'>('th')

  // Translation function
  const T = (en: string, th: string) => locale === 'th' ? th : en

  // Listen for locale changes
  useEffect(() => {
    // Read initial locale
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l)
    } catch { }

    // Listen for locale change events
    const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') {
        setLocale(v)
        try {
          localStorage.setItem('locale', v)
          localStorage.setItem('k_system_lang', v)
        } catch { }
      }
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !calcID) return

    async function loadData() {
      try {
        setLoading(true)
        const res = await fetch(`/api/power-calculations?calcID=${calcID}`)
        const json = await res.json()
        if (json.success && json.rows && json.rows[0]) {
          const record = json.rows[0]
          setData(record)

          // Parse parameters
          const params = record.parameters ?
            (typeof record.parameters === 'string' ? JSON.parse(record.parameters) : record.parameters)
            : {}

          // Set form values
          setCustomerName(record.customer_name || params.customerName || record.customerName || '')
          setVoltage(params.voltage || 230)
          setCurrent(params.current || 0)
          setPf(params.pf || 1)
          setPhase(params.phase || 'single')
          setCompanyName(record.company_name || params.companyName || '')
          setUnitPrice(params.unitPrice || 5.0)
          setPowerSavingRate(params.powerSavingRate || 10)
          setDeviceCapacity(params.deviceCapacity || 30)
          setProductPrice(params.productPrice || 0)
          setPaymentMonths(params.paymentMonths || 60)
          setAvgMonthlyUsage(params.avgMonthlyUsage || 0)
        }
      } catch (err) {
        console.error('Failed to load calculation', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isOpen, calcID])

  const handleSave = async () => {
    try {
      setSaving(true)

      // Calculate results
      const V = voltage
      const I = current
      const PF = pf
      const apparentPower = phase === 'single' ? V * I : Math.sqrt(3) * V * I
      const realPower = apparentPower * PF
      const reactivePower = Math.sqrt(Math.pow(apparentPower, 2) - Math.pow(realPower, 2))

      const parameters = {
        voltage,
        current,
        pf,
        phase,
        companyName,
        customerName,
        unitPrice,
        powerSavingRate,
        deviceCapacity,
        productPrice,
        paymentMonths,
        avgMonthlyUsage
      }

      const result = {
        apparent: apparentPower,
        real: realPower,
        reactive: reactivePower
      }

      const payload = {
        calcID,
        parameters: JSON.stringify(parameters),
        result: JSON.stringify(result),
        status: data.status || 'completed'
      }

      const res = await fetch('/api/power-calculations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()

      if (json.success) {
        alert('บันทึกสำเร็จ')
        setEditMode(false)
        onSave?.()
      } else {
        alert('บันทึกไม่สำเร็จ: ' + (json.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Save error:', err)
      alert('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 1
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            ⚡ Power Calculator - รายละเอียด
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 8px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : !data ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
              ไม่พบข้อมูล
            </div>
          ) : (
            <>
              {/* Meta Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '24px',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Document No', 'เลขที่เอกสาร')}</div>
                  <div style={{ fontWeight: 600 }}>{data.power_calcuNo || data.calcID}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Created Date', 'วันที่สร้าง')}</div>
                  <div style={{ fontWeight: 600 }}>
                    {new Date(data.created_at).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Company Name', 'ชื่อบริษัท')}</div>
                  <div style={{ fontWeight: 600 }}>{companyName || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Customer Name', 'ชื่อลูกค้า')}</div>
                  <div style={{ fontWeight: 600 }}>{customerName || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Status', 'สถานะ')}</div>
                  <div>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: data.status === 'draft' ? '#fef3c7' : '#dcfce7',
                      color: data.status === 'draft' ? '#92400e' : '#166534'
                    }}>
                      {data.status === 'draft' ? T('Draft', 'ร่าง') : T('Completed', 'เสร็จสมบูรณ์')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calculation Data Header */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{T('📊 Calculation Data', '📊 ข้อมูลการคำนวณ')}</h3>
              </div>

              {/* Form Fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {T('Voltage', 'แรงดัน (Voltage)')}
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      value={voltage}
                      onChange={(e) => setVoltage(Number(e.target.value))}
                      className={styles.input}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px' }}>
                      {voltage} V
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {T('Current', 'กระแส (Current)')}
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      value={current}
                      onChange={(e) => setCurrent(Number(e.target.value))}
                      className={styles.input}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px' }}>
                      {current} A
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {T('Power Factor (PF)', 'ตัวประกอบกำลัง (PF)')}
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      step="0.01"
                      value={pf}
                      onChange={(e) => setPf(Number(e.target.value))}
                      className={styles.input}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px' }}>
                      {pf}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {T('Phase', 'เฟส (Phase)')}
                  </label>
                  {editMode ? (
                    <select
                      value={phase}
                      onChange={(e) => setPhase(e.target.value)}
                      className={styles.input}
                      style={{ width: '100%' }}
                    >
                      <option value="single">{T('Single Phase', 'เฟสเดียว')}</option>
                      <option value="three">{T('3 Phase', '3 เฟส')}</option>
                    </select>
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px' }}>
                      {phase === 'single' ? T('Single Phase', 'เฟสเดียว') : T('3 Phase', '3 เฟส')}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {T('Company Name', 'ชื่อบริษัท')}
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={styles.input}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px' }}>
                      {companyName || '-'}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {T('Customer Name', 'ชื่อลูกค้า')}
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={styles.input}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px' }}>
                      {customerName || '-'}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {T('Unit Price (THB/kWh)', 'ราคาต่อหน่วย (บาท/kWh)')}
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className={styles.input}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px' }}>
                      {unitPrice} {T('THB', 'บาท')}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {T('Power Saving Rate (%)', 'อัตราประหยัดพลังงาน (%)')}
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      value={powerSavingRate}
                      onChange={(e) => setPowerSavingRate(Number(e.target.value))}
                      className={styles.input}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px' }}>
                      {powerSavingRate}%
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {T('Device Capacity (kVAR)', 'ความจุอุปกรณ์ (kVAR)')}
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      value={deviceCapacity}
                      onChange={(e) => setDeviceCapacity(Number(e.target.value))}
                      className={styles.input}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px' }}>
                      {deviceCapacity} kVAR
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {T('Product Price (THB)', 'ราคาสินค้า (บาท)')}
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      value={productPrice}
                      onChange={(e) => setProductPrice(Number(e.target.value))}
                      className={styles.input}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px' }}>
                      {productPrice.toLocaleString()} {T('THB', 'บาท')}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {T('Payment Months', 'ผ่อนชำระ (เดือน)')}
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      value={paymentMonths}
                      onChange={(e) => setPaymentMonths(Number(e.target.value))}
                      className={styles.input}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px' }}>
                      {paymentMonths} {T('months', 'เดือน')}
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    {T('Avg Monthly Usage (kWh)', 'การใช้ไฟเฉลี่ยต่อเดือน (kWh)')}
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      value={avgMonthlyUsage}
                      onChange={(e) => setAvgMonthlyUsage(Number(e.target.value))}
                      className={styles.input}
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <div style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px' }}>
                      {avgMonthlyUsage.toLocaleString()} kWh
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Parameters Section */}
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>{T('📋 Additional Information', '📋 ข้อมูลเพิ่มเติม')}</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  {data.contracted_capacity && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Contracted Capacity', 'กำลังติดตั้ง (Contracted Capacity)')}</div>
                      <div style={{ fontWeight: 600 }}>{Number(data.contracted_capacity).toLocaleString()} kW</div>
                    </div>
                  )}
                  {data.peak_power && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Peak Power', 'กำลังไฟสูงสุด (Peak Power)')}</div>
                      <div style={{ fontWeight: 600 }}>{Number(data.peak_power).toLocaleString()} kW</div>
                    </div>
                  )}
                  {data.device_cost && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Device Cost', 'ค่าติดตั้ง (Device Cost)')}</div>
                      <div style={{ fontWeight: 600 }}>{Number(data.device_cost).toLocaleString()} บาท</div>
                    </div>
                  )}
                  {data.amortize_months && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Amortization Period', 'ระยะเวลาตัดจำหน่าย')}</div>
                      <div style={{ fontWeight: 600 }}>{data.amortize_months} {T('months', 'เดือน')}</div>
                    </div>
                  )}
                  {data.expected_savings_percent && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Expected Savings %', '% การประหยัดที่คาดการณ์')}</div>
                      <div style={{ fontWeight: 600 }}>{data.expected_savings_percent}%</div>
                    </div>
                  )}
                  {data.faucet_method && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Installation Method', 'วิธีติดตั้ง')}</div>
                      <div style={{ fontWeight: 600 }}>{data.faucet_method}</div>
                    </div>
                  )}
                  {data.usage_data_months && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Data Months', 'จำนวนเดือนที่มีข้อมูล')}</div>
                      <div style={{ fontWeight: 600 }}>{data.usage_data_months} {T('months', 'เดือน')}</div>
                    </div>
                  )}
                  {data.emission_factor && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('CO2 Emission Factor', 'ค่า CO2 Emission Factor')}</div>
                      <div style={{ fontWeight: 600 }}>{data.emission_factor}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Electricity Data */}
              {(data.total_annual_kwh || data.january_kwh) && (
                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>{T('📊 12-Month Electricity Data', '📊 ข้อมูลการใช้ไฟฟ้า 12 เดือน')}</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb' }}>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>{T('Month', 'เดือน')}</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>kWh</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>{T('Cost (THB)', 'ค่าใช้จ่าย (บาท)')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['January', 'มกราคม'], ['February', 'กุมภาพันธ์'], ['March', 'มีนาคม'],
                          ['April', 'เมษายน'], ['May', 'พฤษภาคม'], ['June', 'มิถุนายน'],
                          ['July', 'กรกฎาคม'], ['August', 'สิงหาคม'], ['September', 'กันยายน'],
                          ['October', 'ตุลาคม'], ['November', 'พฤศจิกายน'], ['December', 'ธันวาคม']
                        ].map((monthPair, idx) => {
                          const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june',
                                            'july', 'august', 'september', 'october', 'november', 'december']
                          const kwh = data[`${monthKeys[idx]}_kwh`]
                          const cost = data[`${monthKeys[idx]}_cost`]

                          if (!kwh && !cost) return null

                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <td style={{ padding: '10px' }}>{T(monthPair[0], monthPair[1])}</td>
                              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 500 }}>
                                {kwh ? Number(kwh).toLocaleString() : '-'}
                              </td>
                              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 500, color: '#10b981' }}>
                                {cost ? Number(cost).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot style={{ background: '#f9fafb', fontWeight: 600 }}>
                        <tr>
                          <td style={{ padding: '12px', borderTop: '2px solid #e5e7eb' }}>{T('Annual Total', 'รวมทั้งปี')}</td>
                          <td style={{ padding: '12px', textAlign: 'right', borderTop: '2px solid #e5e7eb', color: '#1e40af' }}>
                            {data.total_annual_kwh ? Number(data.total_annual_kwh).toLocaleString() : '-'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', borderTop: '2px solid #e5e7eb', color: '#10b981' }}>
                            {data.total_annual_cost ? Number(data.total_annual_cost).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '12px' }}>{T('Monthly Average', 'เฉลี่ยต่อเดือน')}</td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>
                            {data.average_monthly_kwh ? Number(data.average_monthly_kwh).toLocaleString() : '-'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>
                            {data.average_monthly_cost ? Number(data.average_monthly_cost).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* ROI Calculations */}
              {(data.roi_years || data.annual_savings_baht) && (
                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>{T('💰 ROI Calculation', '💰 การคำนวณ ROI')}</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px'
                  }}>
                    {data.roi_years && (
                      <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                        borderRadius: '8px',
                        border: '2px solid #f59e0b'
                      }}>
                        <div style={{ fontSize: '12px', color: '#78350f', marginBottom: '8px' }}>{T('Payback Period', 'ระยะเวลาคืนทุน')}</div>
                        <div style={{ fontSize: '28px', fontWeight: 700, color: '#92400e' }}>
                          {Number(data.roi_years).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#78350f' }}>{T('years', 'ปี')} ({data.roi_months ? Math.round(Number(data.roi_months)) : '0'} {T('months', 'เดือน')})</div>
                      </div>
                    )}
                    {data.annual_savings_baht && (
                      <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                        borderRadius: '8px',
                        border: '2px solid #10b981'
                      }}>
                        <div style={{ fontSize: '12px', color: '#065f46', marginBottom: '8px' }}>{T('Annual Savings', 'ประหยัดต่อปี')}</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#166534' }}>
                          {Number(data.annual_savings_baht).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </div>
                        <div style={{ fontSize: '12px', color: '#065f46' }}>{T('THB/year', 'บาท/ปี')}</div>
                      </div>
                    )}
                    {data.monthly_payment && (
                      <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                        borderRadius: '8px',
                        border: '2px solid #3b82f6'
                      }}>
                        <div style={{ fontSize: '12px', color: '#1e3a8a', marginBottom: '8px' }}>{T('Monthly Payment', 'ผ่อนชำระต่อเดือน')}</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e40af' }}>
                          {Number(data.monthly_payment).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </div>
                        <div style={{ fontSize: '12px', color: '#1e3a8a' }}>{T('THB/month', 'บาท/เดือน')}</div>
                      </div>
                    )}
                  </div>

                  <div style={{
                    marginTop: '16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    {data.monthly_savings_kwh && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Monthly Savings', 'ประหยัดต่อเดือน')} (kWh)</div>
                        <div style={{ fontWeight: 600, color: '#10b981' }}>{Number(data.monthly_savings_kwh).toLocaleString()} kWh</div>
                      </div>
                    )}
                    {data.monthly_savings_baht && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Monthly Savings', 'ประหยัดต่อเดือน')} ({T('THB', 'บาท')})</div>
                        <div style={{ fontWeight: 600, color: '#10b981' }}>{Number(data.monthly_savings_baht).toLocaleString()} {T('THB', 'บาท')}</div>
                      </div>
                    )}
                    {data.annual_savings_kwh && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Annual Savings', 'ประหยัดต่อปี')} (kWh)</div>
                        <div style={{ fontWeight: 600, color: '#10b981' }}>{Number(data.annual_savings_kwh).toLocaleString()} kWh</div>
                      </div>
                    )}
                    {data.carbon_reduction && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('CO2 Reduction', 'ลดการปล่อย CO2')}</div>
                        <div style={{ fontWeight: 600, color: '#059669' }}>{Number(data.carbon_reduction).toFixed(2)} {T('tons/year', 'ตัน/ปี')}</div>
                      </div>
                    )}
                    {data.breakeven_year && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('Breakeven Year', 'ปีที่คืนทุน')}</div>
                        <div style={{ fontWeight: 600 }}>{T('Year', 'ปีที่')} {data.breakeven_year}</div>
                      </div>
                    )}
                    {data.cumulative_10year_savings && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{T('10-Year Cumulative Profit', 'กำไรสะสม 10 ปี')}</div>
                        <div style={{ fontWeight: 600, color: '#10b981' }}>
                          {Number(data.cumulative_10year_savings).toLocaleString(undefined, {maximumFractionDigits: 0})} {T('THB', 'บาท')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Results */}
              {data.result && (() => {
                const result = typeof data.result === 'string' ? JSON.parse(data.result) : data.result
                return (
                  <div style={{ marginTop: '32px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>{T('⚡ Calculation Results', '⚡ ผลการคำนวณ')}</h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '16px'
                    }}>
                      <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                        borderRadius: '8px',
                        border: '2px solid #3b82f6',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{T('Apparent Power', 'กำลังไฟฟ้าปรากฏ')}</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e40af' }}>
                          {result.apparent?.toFixed(2) || 0}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>VA</div>
                      </div>
                      <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                        borderRadius: '8px',
                        border: '2px solid #10b981',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{T('Real Power', 'กำลังไฟฟ้าจริง')}</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#166534' }}>
                          {result.real?.toFixed(2) || 0}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>W</div>
                      </div>
                      <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #fefce8, #fef3c7)',
                        borderRadius: '8px',
                        border: '2px solid #f59e0b',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{T('Reactive Power', 'กำลังไฟฟ้ารีแอกทีฟ')}</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#92400e' }}>
                          {result.reactive?.toFixed(2) || 0}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>VAR</div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          position: 'sticky',
          bottom: 0,
          background: 'white'
        }}>
          <button
            onClick={onClose}
            className={styles.btnOutline}
            style={{ padding: '8px 20px' }}
          >
            {T('Close', 'ปิด')}
          </button>
          {editMode && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={styles.btnPrimary}
              style={{ padding: '8px 20px' }}
            >
              {saving ? T('Saving...', 'กำลังบันทึก...') : T('💾 Save', '💾 บันทึก')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
