"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

export default function PreInstallationFormPage() {
    const [customerSearch, setCustomerSearch] = useState('')
    const [customerOptions, setCustomerOptions] = useState<any[]>([])
    const [customerLoading, setCustomerLoading] = useState(false)
  const router = useRouter()
  const [locale, setLocale] = useState<'en' | 'th'>('en')
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)

  // Basic Information of the Distribution Panel
  const [mainBreaker, setMainBreaker] = useState({ value: '', unit: 'A', note: '' })
  const [peakPower, setPeakPower] = useState({ value: '', unit: 'kW', note: '' })
  const [phaseType, setPhaseType] = useState({ value: '3Φ', voltage: '400V / 230V' })
  const [faucetMethod, setFaucetMethod] = useState('')

  // Voltage and current values for each phase
  const [phaseData, setPhaseData] = useState({
    rs: { voltage: '', pf: '', phaseNeutral: 'L1Φ-N', voltageN: '', currentLabel: 'L1*', current: '' },
    st: { voltage: '', pf: '', phaseNeutral: 'L2Φ-N', voltageN: '', currentLabel: 'L3Φ', current: '' },
    tr: { voltage: '', pf: '', phaseNeutral: 'L3Φ-N', voltageN: '', currentLabel: 'N', current: '' }
  })

  // Surrounding conditions checkboxes
  const [conditions, setConditions] = useState({
    installationSite: { available: false, note: '' },
    cableDirection: { bottomLeft: false, topLeft: false, bottomRight: false, topRight: false },
    cableTrayWork: { checked: false },
    circuitBreakerPanel: { checked: false },
    busbarFabrication: { checked: false },
    craneArrangement: { checked: false },
    forkliftArrangement: { checked: false },
    other: { checked: false, note: '' }
  })

  // Site Load Checkpoints
  const [loadInspection, setLoadInspection] = useState({
    typeAndProportion: '',
    producedProducts: '',
    inverterAvrUsed: ''
  })

  // Special Notes
  const [specialNotes, setSpecialNotes] = useState({
    siteConsiderations: '',
    usageFrequency: '',
    maxCurrentUnderLoad: ''
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

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        customer_name: customerName,
        site_address: siteAddress,
        contact_phone: contactPhone,
        inspection_date: inspectionDate,
        checklist: {
          basicInfo: { mainBreaker, peakPower, phaseType, faucetMethod },
          phaseData,
          conditions,
          loadInspection,
          specialNotes
        },
        // เพิ่มฟิลด์ที่เกี่ยวข้องกับเลขที่รันและข้อมูลอื่นๆ
        notes: '',
        photos: [],
        status: 'pending',
        created_by: (typeof window !== 'undefined' && localStorage.getItem('k_system_admin_user')) ? JSON.parse(localStorage.getItem('k_system_admin_user') || '{}').username || 'system' : 'system'
      }

      const res = await fetch('/api/pre-installation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const j = await res.json()

      if (res.ok && j.success) {
        alert(L('Pre-installation form saved successfully!', 'บันทึกแบบฟอร์มก่อนการติดตั้งเรียบร้อย!'))
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

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    border: '2px solid #255899',
    fontSize: 13
  }

  const thStyle: React.CSSProperties = {
    border: '1px solid #255899',
    padding: '8px 12px',
    background: '#e3f2fd',
    fontWeight: 600,
    textAlign: 'left'
  }

  const tdStyle: React.CSSProperties = {
    border: '1px solid #255899',
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

  return (
    <AdminLayout title="Pre-installation Checklist" titleTh="แบบฟอร์มก่อนการติดตั้ง">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 12 }}>
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            {L('Checklist', 'รายการตรวจสอบ')}
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

          {/* Section 1: Basic Information of Distribution Panel */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ {L('Basic Information of the Distribution Panel', 'ข้อมูลพื้นฐานของตู้จ่ายไฟ')}
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
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Peak power', 'กำลังสูงสุด')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <input type="number" style={{ ...inputStyle, width: 80, textAlign: 'right' }} value={peakPower.value} onChange={e => setPeakPower({ ...peakPower, value: e.target.value })} />
                      <span style={redText}>kW</span>
                    </div>
                  </td>
                  <td style={tdStyle}></td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Single/Three phase', 'เฟสเดียว/สามเฟส')}</td>
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
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Electric faucet method', 'วิธีการต่อไฟ')}</td>
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
              </tbody>
            </table>
          </div>

          {/* Section 2: Voltage and current values */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ {L('Voltage and current values for each phase', 'ค่าแรงดันและกระแสไฟฟ้าแต่ละเฟส')}
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
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.rs.pf} onChange={e => setPhaseData({ ...phaseData, rs: { ...phaseData.rs, pf: e.target.value } })} placeholder="86" />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#1565c0' }}>L1Φ-N</td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.rs.voltageN} onChange={e => setPhaseData({ ...phaseData, rs: { ...phaseData.rs, voltageN: e.target.value } })} placeholder="220" />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#1565c0' }}>L1*</td>
                  <td style={{ ...tdStyle, background: '#e8f5e9' }}>
                    <input style={{ ...inputStyle, textAlign: 'right', fontWeight: 600, color: '#2e7d32' }} value={phaseData.rs.current} onChange={e => setPhaseData({ ...phaseData, rs: { ...phaseData.rs, current: e.target.value } })} placeholder="352" /> <span style={{ color: '#2e7d32', fontWeight: 600 }}>A</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg, fontWeight: 600 }}>S-T</td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.st.voltage} onChange={e => setPhaseData({ ...phaseData, st: { ...phaseData.st, voltage: e.target.value } })} placeholder="380" />
                  </td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.st.pf} onChange={e => setPhaseData({ ...phaseData, st: { ...phaseData.st, pf: e.target.value } })} placeholder="89" />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#1565c0' }}>L2Φ-N</td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.st.voltageN} onChange={e => setPhaseData({ ...phaseData, st: { ...phaseData.st, voltageN: e.target.value } })} placeholder="230" />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#1565c0' }}>L3Φ</td>
                  <td style={{ ...tdStyle, background: '#e8f5e9' }}>
                    <input style={{ ...inputStyle, textAlign: 'right', fontWeight: 600, color: '#2e7d32' }} value={phaseData.st.current} onChange={e => setPhaseData({ ...phaseData, st: { ...phaseData.st, current: e.target.value } })} placeholder="400" /> <span style={{ color: '#2e7d32', fontWeight: 600 }}>A</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg, fontWeight: 600 }}>T-R</td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.tr.voltage} onChange={e => setPhaseData({ ...phaseData, tr: { ...phaseData.tr, voltage: e.target.value } })} placeholder="380" />
                  </td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.tr.pf} onChange={e => setPhaseData({ ...phaseData, tr: { ...phaseData.tr, pf: e.target.value } })} placeholder="88" />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#1565c0' }}>L3Φ-N</td>
                  <td style={tdStyle}>
                    <input style={{ ...inputStyle, textAlign: 'right' }} value={phaseData.tr.voltageN} onChange={e => setPhaseData({ ...phaseData, tr: { ...phaseData.tr, voltageN: e.target.value } })} placeholder="225" />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#1565c0' }}>N</td>
                  <td style={{ ...tdStyle, background: '#e8f5e9' }}>
                    <input style={{ ...inputStyle, textAlign: 'right', fontWeight: 600, color: '#2e7d32' }} value={phaseData.tr.current} onChange={e => setPhaseData({ ...phaseData, tr: { ...phaseData.tr, current: e.target.value } })} placeholder="150" /> <span style={{ color: '#2e7d32', fontWeight: 600 }}>A</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Check the surrounding conditions */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ {L('Check the surrounding conditions', 'ตรวจสอบสภาพแวดล้อม')}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign: 'center' }} colSpan={5}>{L('Dependent on On-site Conditions', 'ขึ้นอยู่กับสภาพหน้างาน')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg, width: '30%' }}>{L('Installation Site', 'พื้นที่ติดตั้ง')}</td>
                  <td style={{ ...tdStyle }} colSpan={4}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{L('Available Space Around the Panel: yes, no', 'พื้นที่ว่างรอบตู้: ใช่, ไม่')}</span>
                      <input style={{ ...inputStyle, flex: 1 }} value={conditions.installationSite.note} onChange={e => setConditions({ ...conditions, installationSite: { ...conditions.installationSite, note: e.target.value } })} />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Direction of Cable Entry and Exit', 'ทิศทางสายเคเบิลเข้า-ออก')}</td>
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
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Other', 'อื่นๆ')}</td>
                  <td style={{ ...tdStyle }} colSpan={4}>
                    <input style={inputStyle} value={conditions.other.note} onChange={e => setConditions({ ...conditions, other: { ...conditions.other, note: e.target.value } })} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Site Load Checkpoints */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ {L('Site Load Checkpoints', 'จุดตรวจสอบโหลดหน้างาน')}
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '40%' }} colSpan={2}>{L('Load Inspection', 'การตรวจสอบโหลด')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Type and Proportion of Load', 'ประเภทและสัดส่วนของโหลด')}</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={loadInspection.typeAndProportion} onChange={e => setLoadInspection({ ...loadInspection, typeAndProportion: e.target.value })} placeholder={L('e.g., Motor 60%, Lighting 20%', 'เช่น มอเตอร์ 60%, แสงสว่าง 20%')} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Types of Produced Products', 'ประเภทผลิตภัณฑ์ที่ผลิต')}</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={loadInspection.producedProducts} onChange={e => setLoadInspection({ ...loadInspection, producedProducts: e.target.value })} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Whether Inverter/AVR are Used', 'มีการใช้ Inverter/AVR หรือไม่')}</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={loadInspection.inverterAvrUsed} onChange={e => setLoadInspection({ ...loadInspection, inverterAvrUsed: e.target.value })} placeholder={L('e.g., 30% Inverter', 'เช่น 30% อินเวอร์เตอร์')} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 5: Special Notes */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionHeaderStyle}>
              ■ {L('Special Notes During Product Manufacturing', 'หมายเหตุพิเศษระหว่างการผลิต')}
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
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Special Notes & Site and Key Considerations', 'หมายเหตุพิเศษและข้อพิจารณาสำคัญ')}</td>
                  <td style={tdStyle}>
                    <textarea style={{ ...inputStyle, minHeight: 60 }} value={specialNotes.siteConsiderations} onChange={e => setSpecialNotes({ ...specialNotes, siteConsiderations: e.target.value })} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Daily Usage Time / Monthly Usage Frequency', 'เวลาใช้งานรายวัน / ความถี่ใช้งานรายเดือน')}</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={specialNotes.usageFrequency} onChange={e => setSpecialNotes({ ...specialNotes, usageFrequency: e.target.value })} placeholder={L('e.g., 8 hrs/day, 25 days/month', 'เช่น 8 ชม./วัน, 25 วัน/เดือน')} />
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, ...yellowBg }}>{L('Maximum current under load', 'กระแสสูงสุดภายใต้โหลด')}</td>
                  <td style={tdStyle}>
                    <input style={inputStyle} value={specialNotes.maxCurrentUnderLoad} onChange={e => setSpecialNotes({ ...specialNotes, maxCurrentUnderLoad: e.target.value })} />
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
              {saving ? L('Saving...', 'กำลังบันทึก...') : L('Save Checklist', 'บันทึกรายการตรวจสอบ')}
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
