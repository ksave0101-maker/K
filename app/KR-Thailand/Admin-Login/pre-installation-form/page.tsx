"use client"

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

function PreInstallationFormContent() {
  const searchParams = useSearchParams()
  const editFormID = searchParams?.get('formID') || ''
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerOptions, setCustomerOptions] = useState<any[]>([])
  const [customerLoading, setCustomerLoading] = useState(false)
  const router = useRouter()
  const [locale, setLocale] = useState<'en' | 'th'>('en')
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)

  // Section 1: Site Classification
  const [siteClassification, setSiteClassification] = useState({
    facilityType: '',
    facilityTypeOther: '',
    operatingHoursPattern: '',
    powerFactorCharacteristic: '',
    harmonicCharacteristic: ''
  })

  // Section 2: Basic Information of Distribution Panel
  const [mainBreaker, setMainBreaker] = useState({ value: '', unit: 'A', note: '' })
  const [peakPower, setPeakPower] = useState({ value: '', unit: 'kW', note: '' })
  const [phaseType, setPhaseType] = useState({ value: '3Φ', voltage: '400V / 230V' })
  const [faucetMethod, setFaucetMethod] = useState('')
  const [transformerCapacity, setTransformerCapacity] = useState('')
  const [cableSize, setCableSize] = useState('')
  const [installationLocation, setInstallationLocation] = useState('')

  // Section 4: Electrical Parameter Measurement
  const [phaseData, setPhaseData] = useState({
    rs: { voltage: '', pf: '', phaseNeutral: 'L1Φ-N', voltageN: '', currentLabel: 'L1*', current: '' },
    st: { voltage: '', pf: '', phaseNeutral: 'L2Φ-N', voltageN: '', currentLabel: 'L3Φ', current: '' },
    tr: { voltage: '', pf: '', phaseNeutral: 'L3Φ-N', voltageN: '', currentLabel: 'N', current: '' }
  })
  const [harmonicAnalysis, setHarmonicAnalysis] = useState({ thdValue: '', notes: '' })
  const [voltageDrop, setVoltageDrop] = useState('')

  // Section 6: Installation Area Assessment
  const [conditions, setConditions] = useState({
    installationSite: { available: false, note: '' },
    cableDirection: { bottomLeft: false, topLeft: false, bottomRight: false, topRight: false },
    cableTrayWork: { checked: false },
    circuitBreakerPanel: { checked: false },
    busbarFabrication: { checked: false },
    craneArrangement: { checked: false },
    forkliftArrangement: { checked: false },
    other: { checked: false, note: '' },
    temperature: '',
    humidity: '',
    dustLevel: '',
    waterExposure: '',
    vibration: ''
  })

  // Section 3: Load Analysis
  const [loadInspection, setLoadInspection] = useState({
    typeAndProportion: '',
    producedProducts: '',
    inverterAvrUsed: '',
    resistiveHeaters: '',
    resistiveLamps: '',
    inductiveMotors: '',
    inductivePumps: '',
    inductiveAC: '',
    inductiveCompressors: '',
    nonLinearInverters: '',
    nonLinearVFDs: '',
    nonLinearUPS: '',
    nonLinearSMPS: ''
  })

  // Section 5: Load Profile Analysis
  const [loadProfile, setLoadProfile] = useState({
    operatingPattern: '',
    peakLoadPeriods: '',
    measurementTool: '',
    recordingPeriod: ''
  })

  // Special Notes
  const [specialNotes, setSpecialNotes] = useState({
    siteConsiderations: '',
    usageFrequency: '',
    maxCurrentUnderLoad: ''
  })

  // Section 7: Economic Feasibility Analysis
  const [economic, setEconomic] = useState({
    averageLoad: '',
    operatingHours: '',
    monthlyElectricityCost: '',
    energyLoss: '',
    estimatedSavingsPct: '',
    paybackPeriod: ''
  })

  // Section 8: Equipment Sizing Summary
  const [equipmentSizing, setEquipmentSizing] = useState({
    actualLoadPercent: '',
    operatingCurrent: '',
    powerFactor: '',
    maximumDemand: '',
    averageLoad: '',
    phaseImbalanceCondition: '',
    recommendedKSaverSize: '',
    sizingNotes: ''
  })

  // Customer info
  const [customerName, setCustomerName] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'th') setLocale('th')
    } catch {}
    setMounted(true)

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

  const L = (en: string, th: string) => (mounted ? locale : 'en') === 'th' ? th : en

  // Load existing form data when editing
  useEffect(() => {
    if (!editFormID) return
    ;(async () => {
      try {
        const res = await fetch(`/api/pre-installation?id=${encodeURIComponent(editFormID)}`)
        const j = await res.json()
        if (!res.ok || !j?.success || !j.form) return
        const form = j.form

        setCustomerName(form.customer_name || '')
        setCustomerSearch(form.customer_name || '')
        setSiteAddress(form.site_address || '')

        let cl: any = {}
        try { cl = typeof form.checklist === 'string' ? JSON.parse(form.checklist) : (form.checklist || {}) } catch {}

        if (cl.siteClassification) setSiteClassification(cl.siteClassification)
        if (cl.basicInfo?.mainBreaker) setMainBreaker(cl.basicInfo.mainBreaker)
        if (cl.basicInfo?.peakPower) setPeakPower(cl.basicInfo.peakPower)
        if (cl.basicInfo?.phaseType) setPhaseType(cl.basicInfo.phaseType)
        if (cl.basicInfo?.faucetMethod !== undefined) setFaucetMethod(cl.basicInfo.faucetMethod)
        if (cl.basicInfo?.transformerCapacity !== undefined) setTransformerCapacity(cl.basicInfo.transformerCapacity)
        if (cl.basicInfo?.cableSize !== undefined) setCableSize(cl.basicInfo.cableSize)
        if (cl.basicInfo?.installationLocation !== undefined) setInstallationLocation(cl.basicInfo.installationLocation)
        if (cl.phaseData) setPhaseData(cl.phaseData)
        if (cl.harmonicAnalysis) setHarmonicAnalysis(cl.harmonicAnalysis)
        if (cl.voltageDrop !== undefined) setVoltageDrop(cl.voltageDrop)
        if (cl.conditions) setConditions(cl.conditions)
        if (cl.loadInspection) setLoadInspection(cl.loadInspection)
        if (cl.loadProfile) setLoadProfile(cl.loadProfile)
        if (cl.specialNotes) setSpecialNotes(cl.specialNotes)
        if (cl.economic) setEconomic(cl.economic)
        if (cl.equipmentSizing) setEquipmentSizing(cl.equipmentSizing)
      } catch (err) {
        console.error('Failed to load form for edit:', err)
      }
    })()
  }, [editFormID])

  const handleSave = async () => {
    setSaving(true)
    try {
      const checklist = {
        siteClassification,
        basicInfo: { mainBreaker, peakPower, phaseType, faucetMethod, transformerCapacity, cableSize, installationLocation },
        phaseData,
        harmonicAnalysis,
        voltageDrop,
        conditions,
        loadInspection,
        loadProfile,
        specialNotes,
        economic,
        equipmentSizing
      }

      const isEdit = Boolean(editFormID)
      const payload: any = isEdit
        ? { formID: editFormID, site_address: siteAddress, checklist, notes: '', photos: [], status: 'pending' }
        : {
            customer_name: customerName,
            site_address: siteAddress,
            contact_phone: contactPhone,
            inspection_date: inspectionDate,
            checklist,
            notes: '',
            photos: [],
            status: 'pending',
            created_by: (typeof window !== 'undefined' && localStorage.getItem('k_system_admin_user'))
              ? JSON.parse(localStorage.getItem('k_system_admin_user') || '{}').username || 'system'
              : 'system'
          }

      const res = await fetch('/api/pre-installation', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const j = await res.json()

      if (res.ok && j.success) {
        alert(isEdit
          ? L('Updated successfully!', 'อัปเดตข้อมูลเรียบร้อย!')
          : L('Pre-installation form saved successfully!', 'บันทึกแบบฟอร์มก่อนการติดตั้งเรียบร้อย!')
        )
        router.push('/KR-Thailand/Admin-Login/pre-installation/list')
      } else {
        alert(L('Failed to save', 'บันทึกไม่สำเร็จ') + ': ' + (j.error || ''))
      }
    } catch (err) {
      console.error('Save error:', err)
      alert(L('Server error', 'เกิดข้อผิดพลาด'))
    } finally {
      setSaving(false)
    }
  }

  const sectionHeaderStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #1e64af 0%, #255899 100%)',
    color: '#fff',
    padding: '10px 16px',
    fontWeight: 700,
    fontSize: 14
  }

  const greenHeaderStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
    color: '#fff',
    padding: '10px 16px',
    fontWeight: 700,
    fontSize: 14
  }

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    border: '2px solid #255899',
    fontSize: 13
  }

  const greenTableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    border: '2px solid #2e7d32',
    fontSize: 13
  }

  const thStyle: React.CSSProperties = {
    border: '1px solid #255899',
    padding: '8px 12px',
    background: '#e3f2fd',
    fontWeight: 600,
    textAlign: 'left'
  }

  const greenThStyle: React.CSSProperties = {
    border: '1px solid #2e7d32',
    padding: '8px 12px',
    background: '#e8f5e9',
    fontWeight: 600,
    textAlign: 'left'
  }

  const tdStyle: React.CSSProperties = {
    border: '1px solid #255899',
    padding: '8px 12px'
  }

  const greenTdStyle: React.CSSProperties = {
    border: '1px solid #2e7d32',
    padding: '8px 12px'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: 4,
    fontSize: 13
  }

  const yellowBg: React.CSSProperties = { background: '#fffde7' }
  const redText: React.CSSProperties = { color: '#d32f2f', fontWeight: 600 }

  const FACILITY_TYPES = [
    { en: 'Industrial Factory', th: 'โรงงานอุตสาหกรรม' },
    { en: 'Office Building', th: 'อาคารสำนักงาน' },
    { en: 'Hotel', th: 'โรงแรม' },
    { en: 'Hospital', th: 'โรงพยาบาล' },
    { en: 'Shopping Mall', th: 'ห้างสรรพสินค้า' },
    { en: 'Pumping Station', th: 'สถานีสูบน้ำ' },
    { en: 'Production Line', th: 'สายการผลิต' },
    { en: 'Other', th: 'อื่นๆ' }
  ]

  const radioRow = (opts: string[], name: string, val: string, onChange: (v: string) => void) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {opts.map(opt => (
        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12 }}>
          <input type="radio" name={name} checked={val === opt} onChange={() => onChange(opt)} />
          {opt}
        </label>
      ))}
    </div>
  )

  return (
    <AdminLayout title="Pre-installation Checklist" titleTh="แบบฟอร์มก่อนการติดตั้ง">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 12 }}>
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            {editFormID
              ? L(`Edit Pre-Installation #${editFormID}`, `แก้ไขแบบฟอร์มก่อนติดตั้ง #${editFormID}`)
              : L('Pre-Installation Checklist', 'รายการตรวจสอบก่อนการติดตั้ง')
            }
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Pre-installation site survey checklist', 'แบบฟอร์มตรวจสอบก่อนการติดตั้ง')}
          </p>
        </div>

        <div className={styles.cardBody}>
          {/* Customer Info */}
          <div style={{ marginBottom: 20 }}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Customer/Company Name', 'ชื่อลูกค้า/บริษัท')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className={styles.formInput}
                    value={customerSearch}
                    onChange={async e => {
                      setCustomerSearch(e.target.value)
                      setCustomerName(e.target.value)
                      if (e.target.value.length > 1) {
                        setCustomerLoading(true)
                        try {
                          const res = await fetch(`/api/customers?q=${encodeURIComponent(e.target.value)}`)
                          const j = await res.json()
                          if (j && (j.customers || j.rows)) setCustomerOptions(j.customers || j.rows)
                          else setCustomerOptions([])
                        } catch { setCustomerOptions([]) }
                        setCustomerLoading(false)
                      } else {
                        setCustomerOptions([])
                      }
                    }}
                    placeholder={L('Customer/Company Name', 'ชื่อลูกค้า/บริษัท')}
                    autoComplete="off"
                  />
                  {customerLoading && <div style={{ position: 'absolute', right: 8, top: 10, fontSize: 12, color: '#888' }}>...</div>}
                  {customerOptions.length > 0 && (
                    <div style={{ position: 'absolute', left: 0, right: 0, top: 38, background: '#fff', border: '1px solid #eee', zIndex: 10, maxHeight: 180, overflowY: 'auto', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      {customerOptions.map(cus => (
                        <div key={cus.cusID} style={{ padding: 8, cursor: 'pointer', borderBottom: '1px solid #f3f3f3' }}
                          onClick={() => {
                            setCustomerName(cus.fullname)
                            setCustomerSearch(cus.fullname)
                            setContactPhone(cus.phone || '')
                            setSiteAddress(cus.address || '')
                            setCustomerOptions([])
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{cus.fullname}</div>
                          <div style={{ fontSize: 13, color: '#666' }}>{cus.company || ''} {cus.phone ? ' | ' + cus.phone : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Inspection Date', 'วันที่ตรวจสอบ')}</label>
                <input type="date" className={styles.formInput} value={inspectionDate} onChange={e => setInspectionDate(e.target.value)} />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Site Address', 'ที่อยู่สถานที่')}</label>
                <input className={styles.formInput} value={siteAddress} onChange={e => setSiteAddress(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Contact Phone', 'เบอร์โทรติดต่อ')}</label>
                <input className={styles.formInput} value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ===== SECTION 1: Site Classification ===== */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ 1. {L('Site Classification', 'การจำแนกประเภทสถานที่')}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '32%' }}>{L('Item', 'รายการ')}</th>
                  <th style={thStyle}>{L('Detail', 'รายละเอียด')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Facility Type', 'ประเภทสถานที่')}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {FACILITY_TYPES.map(ft => (
                        <label key={ft.en} style={{
                          display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                          padding: '4px 10px', borderRadius: 4, fontSize: 12,
                          border: siteClassification.facilityType === ft.en ? '1.5px solid #1e64af' : '1px solid #ddd',
                          background: siteClassification.facilityType === ft.en ? '#e3f2fd' : '#fff'
                        }}>
                          <input type="radio" name="facilityType" value={ft.en}
                            checked={siteClassification.facilityType === ft.en}
                            onChange={e => setSiteClassification({ ...siteClassification, facilityType: e.target.value })}
                            style={{ margin: 0 }} />
                          {L(ft.en, ft.th)}
                        </label>
                      ))}
                    </div>
                    {siteClassification.facilityType === 'Other' && (
                      <input style={{ ...inputStyle, marginTop: 6 }}
                        placeholder={L('Specify other facility type', 'ระบุประเภทสถานที่อื่นๆ')}
                        value={siteClassification.facilityTypeOther}
                        onChange={e => setSiteClassification({ ...siteClassification, facilityTypeOther: e.target.value })} />
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Operating Hours Pattern', 'รูปแบบชั่วโมงการทำงาน')}</td>
                  <td style={tdStyle}>
                    {radioRow(
                      [L('24-hour operation','ทำงาน 24 ชม.'), L('Daytime only','เฉพาะกลางวัน'), L('Shift-based','เป็นกะ'), L('Seasonal','ตามฤดูกาล')],
                      'opHoursPattern',
                      siteClassification.operatingHoursPattern,
                      v => setSiteClassification({ ...siteClassification, operatingHoursPattern: v })
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Power Factor Characteristic', 'ลักษณะ Power Factor')}</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={siteClassification.powerFactorCharacteristic}
                      onChange={e => setSiteClassification({ ...siteClassification, powerFactorCharacteristic: e.target.value })}
                      placeholder={L('e.g., High inductive (motors/pumps), Capacitive, Mixed', 'เช่น Inductive สูง (มอเตอร์/ปั๊ม), Capacitive, ผสม')} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Harmonic Characteristic', 'ลักษณะ Harmonic')}</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={siteClassification.harmonicCharacteristic}
                      onChange={e => setSiteClassification({ ...siteClassification, harmonicCharacteristic: e.target.value })}
                      placeholder={L('e.g., High harmonic (inverters/VFDs), Low harmonic', 'เช่น Harmonic สูง (อินเวอร์เตอร์/VFD), ต่ำ')} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===== SECTION 2: Power Source Analysis ===== */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ 2. {L('Power Source Analysis / Basic Information of Distribution Panel', 'การวิเคราะห์แหล่งจ่ายไฟ / ข้อมูลพื้นฐานของตู้จ่ายไฟ')}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '30%' }}>{L('Item', 'รายการ')}</th>
                  <th style={{ ...thStyle, width: '35%', textAlign: 'center' }}>{L('Detail', 'รายละเอียด')}</th>
                  <th style={{ ...thStyle, width: '35%' }}>{L('Note', 'หมายเหตุ')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Main Breaker', 'เมนเบรกเกอร์')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <input type="number" style={{ ...inputStyle, width: 80, textAlign: 'right' }} value={mainBreaker.value} onChange={e => setMainBreaker({ ...mainBreaker, value: e.target.value })} />
                      <span style={redText}>A</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <input style={inputStyle} placeholder="MCCB/ACB" value={mainBreaker.note} onChange={e => setMainBreaker({ ...mainBreaker, note: e.target.value })} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Transformer Capacity', 'ขนาดหม้อแปลง')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <input type="number" style={{ ...inputStyle, width: 80, textAlign: 'right' }} value={transformerCapacity} onChange={e => setTransformerCapacity(e.target.value)} placeholder="1000" />
                      <span style={redText}>kVA</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Peak Power', 'กำลังสูงสุด')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <input type="number" style={{ ...inputStyle, width: 80, textAlign: 'right' }} value={peakPower.value} onChange={e => setPeakPower({ ...peakPower, value: e.target.value })} />
                      <span style={redText}>kW</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Single/Three Phase', 'เฟสเดียว/สามเฟส')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <select style={{ ...inputStyle, width: 80 }} value={phaseType.value} onChange={e => setPhaseType({ ...phaseType, value: e.target.value })}>
                        <option value="1Φ">1Φ</option>
                        <option value="3Φ">3Φ</option>
                      </select>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <input style={inputStyle} placeholder="400V / 230V" value={phaseType.voltage} onChange={e => setPhaseType({ ...phaseType, voltage: e.target.value })} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Electric Faucet Method', 'วิธีการต่อไฟ')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <select style={{ ...inputStyle, width: 120 }} value={faucetMethod} onChange={e => setFaucetMethod(e.target.value)}>
                      <option value="">{L('-- Select --', '-- เลือก --')}</option>
                      <option value="1Φ2W">1Φ2W</option>
                      <option value="3Φ3W">3Φ3W</option>
                      <option value="3Φ4W">3Φ4W</option>
                    </select>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Cable Size', 'ขนาดสายไฟ')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input style={inputStyle} value={cableSize} onChange={e => setCableSize(e.target.value)} placeholder={L('e.g., 4×185 mm²', 'เช่น 4×185 mm²')} />
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Installation Location', 'ตำแหน่งติดตั้ง')}</td>
                  <td style={tdStyle} colSpan={2}>
                    <input style={inputStyle} value={installationLocation} onChange={e => setInstallationLocation(e.target.value)}
                      placeholder={L('e.g., MDB Room / Outdoor / Indoor substation', 'เช่น ห้อง MDB / กลางแจ้ง / Substation ภายใน')} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===== SECTION 3: Load Analysis ===== */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ 3. {L('Load Analysis', 'การวิเคราะห์โหลด')}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '22%' }}>{L('Load Type', 'ประเภทโหลด')}</th>
                  <th style={{ ...thStyle, width: '28%' }}>{L('Equipment', 'อุปกรณ์')}</th>
                  <th style={{ ...thStyle, width: '22%', textAlign: 'center' }}>{L('Proportion (%)', 'สัดส่วน (%)')}</th>
                  <th style={thStyle}>{L('Note', 'หมายเหตุ')}</th>
                </tr>
              </thead>
              <tbody>
                {/* Resistive */}
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg, fontWeight: 600 }} rowSpan={2}>{L('Resistive Load', 'โหลดเชิงต้านทาน')}</td>
                  <td style={tdStyle}>{L('Heaters', 'เครื่องทำความร้อน')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 70, textAlign: 'right' }} value={loadInspection.resistiveHeaters} onChange={e => setLoadInspection({ ...loadInspection, resistiveHeaters: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={tdStyle}>{L('Incandescent / Fluorescent Lamps', 'หลอดไฟ')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 70, textAlign: 'right' }} value={loadInspection.resistiveLamps} onChange={e => setLoadInspection({ ...loadInspection, resistiveLamps: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                {/* Inductive */}
                <tr>
                  <td style={{ ...tdStyle, background: '#fff8e1', fontWeight: 600 }} rowSpan={4}>{L('Inductive Load', 'โหลดเชิงเหนี่ยวนำ')}</td>
                  <td style={tdStyle}>{L('Motors', 'มอเตอร์')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 70, textAlign: 'right' }} value={loadInspection.inductiveMotors} onChange={e => setLoadInspection({ ...loadInspection, inductiveMotors: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={tdStyle}>{L('Pumps', 'ปั๊ม')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 70, textAlign: 'right' }} value={loadInspection.inductivePumps} onChange={e => setLoadInspection({ ...loadInspection, inductivePumps: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={tdStyle}>{L('Air Conditioners', 'เครื่องปรับอากาศ')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 70, textAlign: 'right' }} value={loadInspection.inductiveAC} onChange={e => setLoadInspection({ ...loadInspection, inductiveAC: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={tdStyle}>{L('Compressors', 'คอมเพรสเซอร์')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 70, textAlign: 'right' }} value={loadInspection.inductiveCompressors} onChange={e => setLoadInspection({ ...loadInspection, inductiveCompressors: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                {/* Non-linear */}
                <tr>
                  <td style={{ ...tdStyle, background: '#fce4ec', fontWeight: 600 }} rowSpan={4}>{L('Non-linear Load', 'โหลดไม่เชิงเส้น')}</td>
                  <td style={tdStyle}>{L('Inverters', 'อินเวอร์เตอร์')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 70, textAlign: 'right' }} value={loadInspection.nonLinearInverters} onChange={e => setLoadInspection({ ...loadInspection, nonLinearInverters: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={tdStyle}>{L('VFDs (Variable Frequency Drives)', 'VFD อินเวอร์เตอร์ปรับความถี่')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 70, textAlign: 'right' }} value={loadInspection.nonLinearVFDs} onChange={e => setLoadInspection({ ...loadInspection, nonLinearVFDs: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={tdStyle}>{L('UPS Systems', 'ระบบ UPS')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 70, textAlign: 'right' }} value={loadInspection.nonLinearUPS} onChange={e => setLoadInspection({ ...loadInspection, nonLinearUPS: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={tdStyle}>{L('SMPS Equipment', 'อุปกรณ์ SMPS')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 70, textAlign: 'right' }} value={loadInspection.nonLinearSMPS} onChange={e => setLoadInspection({ ...loadInspection, nonLinearSMPS: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                {/* Summary rows */}
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }} colSpan={2}>{L('Type and Proportion Summary', 'สรุปประเภทและสัดส่วนโหลด')}</td>
                  <td style={tdStyle} colSpan={2}>
                    <input style={inputStyle} value={loadInspection.typeAndProportion} onChange={e => setLoadInspection({ ...loadInspection, typeAndProportion: e.target.value })}
                      placeholder={L('e.g., Motor 60%, Lighting 20%, AC 20%', 'เช่น มอเตอร์ 60%, แสงสว่าง 20%, แอร์ 20%')} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }} colSpan={2}>{L('Types of Produced Products', 'ประเภทผลิตภัณฑ์ที่ผลิต')}</td>
                  <td style={tdStyle} colSpan={2}>
                    <input style={inputStyle} value={loadInspection.producedProducts} onChange={e => setLoadInspection({ ...loadInspection, producedProducts: e.target.value })} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }} colSpan={2}>{L('Whether Inverter/AVR are Used', 'มีการใช้ Inverter/AVR หรือไม่')}</td>
                  <td style={tdStyle} colSpan={2}>
                    <input style={inputStyle} value={loadInspection.inverterAvrUsed} onChange={e => setLoadInspection({ ...loadInspection, inverterAvrUsed: e.target.value })}
                      placeholder={L('e.g., 30% Inverter drives on conveyor motors', 'เช่น 30% อินเวอร์เตอร์บนมอเตอร์คอนเวเยอร์')} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===== SECTION 4: Electrical Parameter Measurement ===== */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ 4. {L('Electrical Parameter Measurement', 'การวัดค่าพารามิเตอร์ไฟฟ้า')}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle} rowSpan={2}></th>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={2}>{L('Voltage', 'แรงดัน')}</th>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={2}></th>
                  <th style={{ ...thStyle, textAlign: 'center', background: '#c8e6c9' }} colSpan={2}>{L('Current (A)', 'กระแส (A)')}</th>
                </tr>
                <tr>
                  <th style={{ ...thStyle, textAlign: 'center' }}>{L('Line-to-Line', 'ระหว่างเส้น')}</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>{L('Voltage / PF', 'แรงดัน / PF')}</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>{L('Phase to Neutral', 'เฟสถึงนิวทรัล')}</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>{L('Voltage', 'แรงดัน')}</th>
                  <th style={{ ...thStyle, textAlign: 'center', background: '#c8e6c9' }}></th>
                  <th style={{ ...thStyle, textAlign: 'center', background: '#c8e6c9' }}></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg, fontWeight: 600 }}>R-S</td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.rs.voltage} onChange={e => setPhaseData({ ...phaseData, rs: { ...phaseData.rs, voltage: e.target.value } })} placeholder="380" />
                  </td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.rs.pf} onChange={e => setPhaseData({ ...phaseData, rs: { ...phaseData.rs, pf: e.target.value } })} placeholder="0.86" />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#1565c0' }}>L1Φ-N</td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.rs.voltageN} onChange={e => setPhaseData({ ...phaseData, rs: { ...phaseData.rs, voltageN: e.target.value } })} placeholder="220" />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#1565c0' }}>L1*</td>
                  <td style={{ ...tdStyle, background: '#e8f5e9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input style={{ ...inputStyle, textAlign: 'right', fontWeight: 600, color: '#2e7d32' }} value={phaseData.rs.current} onChange={e => setPhaseData({ ...phaseData, rs: { ...phaseData.rs, current: e.target.value } })} placeholder="352" />
                      <span style={{ color: '#2e7d32', fontWeight: 600 }}>A</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg, fontWeight: 600 }}>S-T</td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.st.voltage} onChange={e => setPhaseData({ ...phaseData, st: { ...phaseData.st, voltage: e.target.value } })} placeholder="380" />
                  </td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.st.pf} onChange={e => setPhaseData({ ...phaseData, st: { ...phaseData.st, pf: e.target.value } })} placeholder="0.89" />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#1565c0' }}>L2Φ-N</td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.st.voltageN} onChange={e => setPhaseData({ ...phaseData, st: { ...phaseData.st, voltageN: e.target.value } })} placeholder="230" />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#1565c0' }}>L3Φ</td>
                  <td style={{ ...tdStyle, background: '#e8f5e9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input style={{ ...inputStyle, textAlign: 'right', fontWeight: 600, color: '#2e7d32' }} value={phaseData.st.current} onChange={e => setPhaseData({ ...phaseData, st: { ...phaseData.st, current: e.target.value } })} placeholder="400" />
                      <span style={{ color: '#2e7d32', fontWeight: 600 }}>A</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg, fontWeight: 600 }}>T-R</td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.tr.voltage} onChange={e => setPhaseData({ ...phaseData, tr: { ...phaseData.tr, voltage: e.target.value } })} placeholder="380" />
                  </td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.tr.pf} onChange={e => setPhaseData({ ...phaseData, tr: { ...phaseData.tr, pf: e.target.value } })} placeholder="0.88" />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#1565c0' }}>L3Φ-N</td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.tr.voltageN} onChange={e => setPhaseData({ ...phaseData, tr: { ...phaseData.tr, voltageN: e.target.value } })} placeholder="225" />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#1565c0' }}>N</td>
                  <td style={{ ...tdStyle, background: '#e8f5e9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input style={{ ...inputStyle, textAlign: 'right', fontWeight: 600, color: '#2e7d32' }} value={phaseData.tr.current} onChange={e => setPhaseData({ ...phaseData, tr: { ...phaseData.tr, current: e.target.value } })} placeholder="150" />
                      <span style={{ color: '#2e7d32', fontWeight: 600 }}>A</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Voltage Drop & Harmonic */}
            <table style={{ ...tableStyle, marginTop: 6 }}>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg, width: '32%' }}>{L('Voltage Drop / Fluctuation', 'แรงดันตก / แรงดันกระเพื่อม')}</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={voltageDrop} onChange={e => setVoltageDrop(e.target.value)}
                      placeholder={L('e.g., Drop 5% during motor start, Stable', 'เช่น ตก 5% ขณะมอเตอร์สตาร์ท, คงที่')} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Harmonic Analysis (THD %)', 'การวิเคราะห์ฮาร์โมนิก (THD %)')}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="number" style={{ ...inputStyle, width: 90 }} value={harmonicAnalysis.thdValue}
                        onChange={e => setHarmonicAnalysis({ ...harmonicAnalysis, thdValue: e.target.value })} placeholder="THD" />
                      <span style={{ color: '#555', fontSize: 12 }}>%</span>
                      <input style={{ ...inputStyle, flex: 1 }} value={harmonicAnalysis.notes}
                        onChange={e => setHarmonicAnalysis({ ...harmonicAnalysis, notes: e.target.value })}
                        placeholder={L('e.g., High from VFDs – caution for capacitor bank', 'เช่น Harmonic สูงจาก VFD ระวังธนาคารคาปาซิเตอร์')} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===== SECTION 5: Load Profile Analysis ===== */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ 5. {L('Load Profile Analysis', 'การวิเคราะห์โปรไฟล์โหลด')}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '32%' }}>{L('Item', 'รายการ')}</th>
                  <th style={thStyle}>{L('Detail', 'รายละเอียด')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Operating Pattern', 'รูปแบบการใช้งาน')}</td>
                  <td style={tdStyle}>
                    {radioRow(
                      [L('24-hour operation','ทำงาน 24 ชม.'), L('Daytime only','เฉพาะกลางวัน'), L('Peak load periods','มีช่วง Peak โหลด')],
                      'loadProfileOp',
                      loadProfile.operatingPattern,
                      v => setLoadProfile({ ...loadProfile, operatingPattern: v })
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Peak Load Periods', 'ช่วงโหลดสูงสุด')}</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={loadProfile.peakLoadPeriods}
                      onChange={e => setLoadProfile({ ...loadProfile, peakLoadPeriods: e.target.value })}
                      placeholder={L('e.g., 08:00–12:00 and 13:00–17:00', 'เช่น 08:00–12:00 และ 13:00–17:00')} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Measurement Tool', 'เครื่องมือวัด')}</td>
                  <td style={tdStyle}>
                    {radioRow(
                      [L('Data Logger','Data Logger'), L('Power Analyzer','Power Analyzer'), L('Clamp Meter','แคลมป์มิเตอร์')],
                      'measurementTool',
                      loadProfile.measurementTool,
                      v => setLoadProfile({ ...loadProfile, measurementTool: v })
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Recording Period', 'ช่วงเวลาบันทึก')}</td>
                  <td style={tdStyle}>
                    {radioRow(
                      [L('24 hours','24 ชั่วโมง'), L('7 days','7 วัน'), L('30 days','30 วัน')],
                      'recordingPeriod',
                      loadProfile.recordingPeriod,
                      v => setLoadProfile({ ...loadProfile, recordingPeriod: v })
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===== SECTION 6: Installation Area Assessment ===== */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ 6. {L('Installation Area Assessment', 'การประเมินพื้นที่ติดตั้ง')}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={5}>{L('Space Availability & Environmental Conditions', 'พื้นที่และสภาพแวดล้อม')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg, width: '30%' }}>{L('Installation Site Space', 'พื้นที่ติดตั้ง')}</td>
                  <td style={{ ...tdStyle }} colSpan={4}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{L('Ventilation / maintenance clearance:', 'ระยะระบายอากาศ / บำรุงรักษา:')}</span>
                      <input style={{ ...inputStyle, flex: 1 }} value={conditions.installationSite.note}
                        onChange={e => setConditions({ ...conditions, installationSite: { ...conditions.installationSite, note: e.target.value } })}
                        placeholder={L('e.g., 600mm clearance front, adequate ventilation', 'เช่น ระยะด้านหน้า 600mm, ระบายอากาศเพียงพอ')} />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Direction of Cable Entry/Exit', 'ทิศทางสายเคเบิลเข้า-ออก')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <input type="checkbox" checked={conditions.cableDirection.bottomLeft} onChange={e => setConditions({ ...conditions, cableDirection: { ...conditions.cableDirection, bottomLeft: e.target.checked } })} />
                      {L('Bottom Left', 'ซ้ายล่าง')}
                    </label>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <input type="checkbox" checked={conditions.cableDirection.topLeft} onChange={e => setConditions({ ...conditions, cableDirection: { ...conditions.cableDirection, topLeft: e.target.checked } })} />
                      {L('Top Left', 'ซ้ายบน')}
                    </label>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <input type="checkbox" checked={conditions.cableDirection.bottomRight} onChange={e => setConditions({ ...conditions, cableDirection: { ...conditions.cableDirection, bottomRight: e.target.checked } })} />
                      {L('Bottom Right', 'ขวาล่าง')}
                    </label>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <input type="checkbox" checked={conditions.cableDirection.topRight} onChange={e => setConditions({ ...conditions, cableDirection: { ...conditions.cableDirection, topRight: e.target.checked } })} />
                      {L('Top Right', 'ขวาบน')}
                    </label>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Cable Tray Work', 'งานรางสายเคเบิล')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }} colSpan={4}>
                    <input type="checkbox" checked={conditions.cableTrayWork.checked} onChange={e => setConditions({ ...conditions, cableTrayWork: { checked: e.target.checked } })} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Circuit Breaker Panel Installation', 'งานติดตั้งตู้เบรกเกอร์')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }} colSpan={4}>
                    <input type="checkbox" checked={conditions.circuitBreakerPanel.checked} onChange={e => setConditions({ ...conditions, circuitBreakerPanel: { checked: e.target.checked } })} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Busbar Fabrication', 'งานบัสบาร์')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }} colSpan={4}>
                    <input type="checkbox" checked={conditions.busbarFabrication.checked} onChange={e => setConditions({ ...conditions, busbarFabrication: { checked: e.target.checked } })} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Crane Arrangement', 'การจัดเตรียมเครน')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }} colSpan={4}>
                    <input type="checkbox" checked={conditions.craneArrangement.checked} onChange={e => setConditions({ ...conditions, craneArrangement: { checked: e.target.checked } })} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Forklift Arrangement', 'การจัดเตรียมรถโฟล์คลิฟท์')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }} colSpan={4}>
                    <input type="checkbox" checked={conditions.forkliftArrangement.checked} onChange={e => setConditions({ ...conditions, forkliftArrangement: { checked: e.target.checked } })} />
                  </td>
                </tr>
                {/* Environmental conditions */}
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Temperature', 'อุณหภูมิ')}</td>
                  <td style={tdStyle} colSpan={4}>
                    <input style={inputStyle} value={conditions.temperature}
                      onChange={e => setConditions({ ...conditions, temperature: e.target.value })}
                      placeholder={L('e.g., 25–35°C, High heat near furnace', 'เช่น 25–35°C, ร้อนสูงใกล้เตาหลอม')} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Humidity', 'ความชื้น')}</td>
                  <td style={tdStyle} colSpan={4}>
                    <input style={inputStyle} value={conditions.humidity}
                      onChange={e => setConditions({ ...conditions, humidity: e.target.value })}
                      placeholder={L('e.g., High humidity, condensation risk', 'เช่น ความชื้นสูง มีความเสี่ยงน้ำกลั่นตัว')} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Dust Level', 'ระดับฝุ่น')}</td>
                  <td style={tdStyle} colSpan={4}>
                    {radioRow(
                      [L('Low','ต่ำ'), L('Medium','ปานกลาง'), L('High','สูง')],
                      'dustLevel', conditions.dustLevel,
                      v => setConditions({ ...conditions, dustLevel: v })
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Water / Moisture Exposure', 'การสัมผัสน้ำ/ความชื้น')}</td>
                  <td style={tdStyle} colSpan={4}>
                    {radioRow(
                      [L('None','ไม่มี'), L('Low','ต่ำ'), L('High risk','ความเสี่ยงสูง')],
                      'waterExposure', conditions.waterExposure,
                      v => setConditions({ ...conditions, waterExposure: v })
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Vibration', 'การสั่นสะเทือน')}</td>
                  <td style={tdStyle} colSpan={4}>
                    {radioRow(
                      [L('None','ไม่มี'), L('Low','ต่ำ'), L('High','สูง')],
                      'vibration', conditions.vibration,
                      v => setConditions({ ...conditions, vibration: v })
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Other', 'อื่นๆ')}</td>
                  <td style={{ ...tdStyle }} colSpan={4}>
                    <input style={inputStyle} value={conditions.other.note}
                      onChange={e => setConditions({ ...conditions, other: { ...conditions.other, note: e.target.value } })} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===== SECTION 7: Economic Feasibility Analysis ===== */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ 7. {L('Economic Feasibility Analysis', 'การวิเคราะห์ความเป็นไปได้ทางเศรษฐกิจ')}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '36%' }}>{L('Item', 'รายการ')}</th>
                  <th style={{ ...thStyle, width: '30%', textAlign: 'center' }}>{L('Value', 'ค่า')}</th>
                  <th style={thStyle}>{L('Note', 'หมายเหตุ')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Average Load', 'โหลดเฉลี่ย')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 100, textAlign: 'right' }} value={economic.averageLoad} onChange={e => setEconomic({ ...economic, averageLoad: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>kW</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Operating Hours', 'ชั่วโมงการทำงาน')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 100, textAlign: 'right' }} value={economic.operatingHours} onChange={e => setEconomic({ ...economic, operatingHours: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>{L('hrs/month', 'ชม./เดือน')}</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Monthly Electricity Cost', 'ค่าไฟฟ้ารายเดือน')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 100, textAlign: 'right' }} value={economic.monthlyElectricityCost} onChange={e => setEconomic({ ...economic, monthlyElectricityCost: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>{L('Baht/month', 'บาท/เดือน')}</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Energy Losses', 'การสูญเสียพลังงาน')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 100, textAlign: 'right' }} value={economic.energyLoss} onChange={e => setEconomic({ ...economic, energyLoss: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Estimated Energy Savings', 'การประหยัดพลังงานที่คาดว่าได้')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 100, textAlign: 'right' }} value={economic.estimatedSavingsPct} onChange={e => setEconomic({ ...economic, estimatedSavingsPct: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Estimated Payback Period', 'ระยะเวลาคืนทุนโดยประมาณ')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 100, textAlign: 'right' }} value={economic.paybackPeriod} onChange={e => setEconomic({ ...economic, paybackPeriod: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>{L('months', 'เดือน')}</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Special Notes */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ {L('Special Notes', 'หมายเหตุพิเศษ')}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '40%' }}>{L('Considerations', 'ข้อพิจารณา')}</th>
                  <th style={thStyle}>{L('Detail', 'รายละเอียด')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Special Notes & Key Considerations', 'หมายเหตุพิเศษและข้อพิจารณาสำคัญ')}</td>
                  <td style={tdStyle}>
                    <textarea style={{ ...inputStyle, minHeight: 60 }} value={specialNotes.siteConsiderations}
                      onChange={e => setSpecialNotes({ ...specialNotes, siteConsiderations: e.target.value })} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Daily Usage Time / Monthly Frequency', 'เวลาใช้งานรายวัน / ความถี่รายเดือน')}</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={specialNotes.usageFrequency}
                      onChange={e => setSpecialNotes({ ...specialNotes, usageFrequency: e.target.value })}
                      placeholder={L('e.g., 8 hrs/day, 25 days/month', 'เช่น 8 ชม./วัน, 25 วัน/เดือน')} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Maximum Current Under Load', 'กระแสสูงสุดภายใต้โหลด')}</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={specialNotes.maxCurrentUnderLoad}
                      onChange={e => setSpecialNotes({ ...specialNotes, maxCurrentUnderLoad: e.target.value })} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===== SECTION 8: Equipment Sizing Summary ===== */}
          <div style={{ marginBottom: 20 }}>
            <div style={greenHeaderStyle}>
              ■ 8. {L('Equipment Sizing Summary (K-Saver Selection)', 'สรุปการเลือกขนาดอุปกรณ์ (การเลือก K-Saver)')}
            </div>
            <table style={greenTableStyle}>
              <thead>
                <tr>
                  <th style={{ ...greenThStyle, width: '40%' }}>{L('Parameter', 'พารามิเตอร์')}</th>
                  <th style={{ ...greenThStyle, textAlign: 'center' }}>{L('Value', 'ค่า')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...greenTdStyle, ...yellowBg }}>{L('Actual Load Percentage', 'เปอร์เซ็นต์โหลดจริง')}</td>
                  <td style={{ ...greenTdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 100, textAlign: 'right' }} value={equipmentSizing.actualLoadPercent}
                        onChange={e => setEquipmentSizing({ ...equipmentSizing, actualLoadPercent: e.target.value })} placeholder="20" />
                      <span style={{ fontSize: 12, color: '#555' }}>%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...greenTdStyle, ...yellowBg }}>{L('Operating Current', 'กระแสใช้งาน')}</td>
                  <td style={{ ...greenTdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 100, textAlign: 'right' }} value={equipmentSizing.operatingCurrent}
                        onChange={e => setEquipmentSizing({ ...equipmentSizing, operatingCurrent: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>A</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...greenTdStyle, ...yellowBg }}>{L('Power Factor (PF)', 'Power Factor (PF)')}</td>
                  <td style={{ ...greenTdStyle, textAlign: 'center' }}>
                    <input type="number" style={{ ...inputStyle, width: 100, textAlign: 'center' }} value={equipmentSizing.powerFactor}
                      onChange={e => setEquipmentSizing({ ...equipmentSizing, powerFactor: e.target.value })}
                      placeholder="0.85" step="0.01" min="0" max="1" />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...greenTdStyle, ...yellowBg }}>{L('Maximum Demand', 'ความต้องการสูงสุด')}</td>
                  <td style={{ ...greenTdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 100, textAlign: 'right' }} value={equipmentSizing.maximumDemand}
                        onChange={e => setEquipmentSizing({ ...equipmentSizing, maximumDemand: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>kW</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...greenTdStyle, ...yellowBg }}>{L('Average Load', 'โหลดเฉลี่ย')}</td>
                  <td style={{ ...greenTdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" style={{ ...inputStyle, width: 100, textAlign: 'right' }} value={equipmentSizing.averageLoad}
                        onChange={e => setEquipmentSizing({ ...equipmentSizing, averageLoad: e.target.value })} />
                      <span style={{ fontSize: 12, color: '#555' }}>kW</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...greenTdStyle, ...yellowBg }}>{L('Phase Imbalance Condition', 'สภาวะความไม่สมดุลเฟส')}</td>
                  <td style={greenTdStyle}>
                    <input style={inputStyle} value={equipmentSizing.phaseImbalanceCondition}
                      onChange={e => setEquipmentSizing({ ...equipmentSizing, phaseImbalanceCondition: e.target.value })}
                      placeholder={L('e.g., R=80A S=45A T=30A → Imbalanced', 'เช่น R=80A S=45A T=30A → ไม่สมดุล')} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...greenTdStyle, background: '#c8e6c9', fontWeight: 700, fontSize: 14 }}>
                    {L('Recommended K-Saver Size', 'ขนาด K-Saver ที่แนะนำ')}
                  </td>
                  <td style={{ ...greenTdStyle, background: '#e8f5e9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <input type="number" style={{ ...inputStyle, width: 100, textAlign: 'right', fontWeight: 700, fontSize: 15 }}
                        value={equipmentSizing.recommendedKSaverSize}
                        onChange={e => setEquipmentSizing({ ...equipmentSizing, recommendedKSaverSize: e.target.value })} placeholder="30" />
                      <span style={{ color: '#2e7d32', fontWeight: 700, fontSize: 14 }}>kVA</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...greenTdStyle, ...yellowBg }}>{L('Sizing Notes', 'หมายเหตุการเลือกขนาด')}</td>
                  <td style={greenTdStyle}>
                    <textarea style={{ ...inputStyle, minHeight: 60 }} value={equipmentSizing.sizingNotes}
                      onChange={e => setEquipmentSizing({ ...equipmentSizing, sizingNotes: e.target.value })}
                      placeholder={L(
                        'e.g., 2400 kVA transformer at 20% load → 30–50 kVA K-Saver recommended',
                        'เช่น หม้อแปลง 2400 kVA ที่โหลด 20% → แนะนำ K-Saver 30–50 kVA'
                      )} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Note */}
          <div style={{ padding: 12, background: '#fff3e0', borderRadius: 4, marginBottom: 20, fontSize: 12, color: '#e65100' }}>
            * {L('Please check the amperage when the load of the sub circuit breaker is fully activated', 'กรุณาตรวจสอบค่าแอมป์เมื่อโหลดของเบรกเกอร์ย่อยทำงานเต็มที่')}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleSave} disabled={saving} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {saving
                ? L('Saving...', 'กำลังบันทึก...')
                : editFormID
                  ? L('Update Checklist', 'อัปเดตรายการตรวจสอบ')
                  : L('Save Checklist', 'บันทึกรายการตรวจสอบ')
              }
            </button>
            <button onClick={() => router.back()} className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLarge}`}>
              {L('Cancel', 'ยกเลิก')}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function PreInstallationFormPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <PreInstallationFormContent />
    </Suspense>
  )
}
