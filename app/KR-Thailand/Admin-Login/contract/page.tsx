"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import CreatedBy from '../components/CreatedBy'
import styles from '../admin-theme.module.css'

type PaymentInstallment = {
  installmentNo: number
  dueDate: string
  amount: number
  status: 'pending' | 'paid'
}

export default function ContractPage() {
  const router = useRouter()

  const [locale, setLocale] = useState<'en'|'th'>(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'th' ? 'th' : 'en'
    } catch { return 'th' }
  })

  useEffect(() => {
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

  const L = (en: string, th: string) => locale === 'th' ? th : en

  const getAuthHeaders = (): Record<string, string> => {
    try {
      const t = localStorage.getItem('k_system_admin_token') || ''
      return t ? { Authorization: `Bearer ${t}` } : {}
    } catch {
      return {}
    }
  }

  const refreshContractNo = () => {
    const now = new Date()
    const yy = String(now.getFullYear()).slice(-2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const rand = String(Math.floor(Math.random() * 9000) + 1000)
    setContractNo(`CT-${yy}${mm}${dd}-${rand}`)
  }

  // Form state
  const [contractNo, setContractNo] = useState('')
  const [contractDate, setContractDate] = useState(() => new Date().toISOString().split('T')[0])
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  // Sales order import
  const [salesOrders, setSalesOrders] = useState<any[]>([])
  const [loadingSalesOrders, setLoadingSalesOrders] = useState(false)
  const [selectedSOId, setSelectedSOId] = useState<string>('')

  // Pre-installation import
  const [showPreInstModal, setShowPreInstModal] = useState(false)
  const [preInstList, setPreInstList] = useState<any[]>([])
  const [preInstLoading, setPreInstLoading] = useState(false)
  const [usedPreInstIds, setUsedPreInstIds] = useState<Set<number>>(new Set())

  // Contract content
  const [contractContent, setContractContent] = useState('')
  const [contractDuration, setContractDuration] = useState<number>(12)
  const [durationUnit, setDurationUnit] = useState<'days' | 'months' | 'years'>('months')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')

  // Payment terms
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [installmentCount, setInstallmentCount] = useState<number>(1)
  const [installmentAmount, setInstallmentAmount] = useState<number>(0)
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentInstallment[]>([])

  // Warranty & maintenance
  const [warrantyPeriod, setWarrantyPeriod] = useState<number>(12)
  const [warrantyUnit, setWarrantyUnit] = useState<'days' | 'months' | 'years'>('months')
  const [maintenanceScope, setMaintenanceScope] = useState('')

  // Notes
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Track imported pre-installation ID
  const [importedPreInstID, setImportedPreInstID] = useState<number | null>(null)

  // Load initial data
  useEffect(() => {
    refreshContractNo()
    loadCustomers()
  }, [])

  // Calculate end date when start date or duration changes
  useEffect(() => {
    if (startDate && contractDuration) {
      const start = new Date(startDate)
      let end = new Date(start)

      if (durationUnit === 'days') {
        end.setDate(end.getDate() + contractDuration)
      } else if (durationUnit === 'months') {
        end.setMonth(end.getMonth() + contractDuration)
      } else if (durationUnit === 'years') {
        end.setFullYear(end.getFullYear() + contractDuration)
      }

      setEndDate(end.toISOString().split('T')[0])
    }
  }, [startDate, contractDuration, durationUnit])

  // Calculate installment amount when total or count changes
  useEffect(() => {
    if (totalAmount > 0 && installmentCount > 0) {
      setInstallmentAmount(Math.round((totalAmount / installmentCount) * 100) / 100)
    }
  }, [totalAmount, installmentCount])

  // Generate payment schedule when installment changes
  useEffect(() => {
    if (installmentCount > 0 && installmentAmount > 0 && startDate) {
      const schedule: PaymentInstallment[] = []
      const start = new Date(startDate)

      for (let i = 0; i < installmentCount; i++) {
        const dueDate = new Date(start)
        dueDate.setMonth(dueDate.getMonth() + i)

        schedule.push({
          installmentNo: i + 1,
          dueDate: dueDate.toISOString().split('T')[0],
          amount: i === installmentCount - 1
            ? Math.round((totalAmount - (installmentAmount * (installmentCount - 1))) * 100) / 100
            : installmentAmount,
          status: 'pending'
        })
      }

      setPaymentSchedule(schedule)
    }
  }, [installmentCount, installmentAmount, startDate, totalAmount])

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/customers', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && j.success && Array.isArray(j.customers)) {
        setCustomers(j.customers)
      }
    } catch (err) {
      console.error('Failed to load customers:', err)
    }
  }

  const loadSalesOrders = async () => {
    setLoadingSalesOrders(true)
    try {
      const res = await fetch('/api/sales-orders', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && j.success && Array.isArray(j.orders)) {
        setSalesOrders(j.orders)
      }
    } catch (err) {
      console.error('Failed to load sales orders:', err)
    } finally {
      setLoadingSalesOrders(false)
    }
  }

  const importSalesOrder = async () => {
    if (!selectedSOId) {
      alert(L('Please select a sales order to import', 'กรุณาเลือกใบสั่งขายที่จะนำเข้า'))
      return
    }

    // Try to find in already loaded list first
    const so = salesOrders.find(s => String(s.orderID || s.orderNo) === String(selectedSOId))
    let order: any = so
    if (!order) {
      try {
        const res = await fetch(`/api/sales-orders/${selectedSOId}`, { headers: getAuthHeaders() })
        const j = await res.json()
        if (j && j.success) order = j.order
      } catch (err) {
        console.error('Failed to fetch sales order:', err)
      }
    }

    if (!order) {
      alert(L('Failed to import sales order', 'นำเข้าใบสั่งขายไม่สำเร็จ'))
      return
    }

    setCustomerName(order.customer_name || order.customer || '')
    setCustomerPhone(order.customer_phone || order.phone || '')
    setCustomerAddress(order.customer_address || order.address || order.site_address || '')
    setTotalAmount(Number(order.total_amount || order.amount || 0))
    if (order.preInstID || order.pre_inst_id) setImportedPreInstID(Number(order.preInstID || order.pre_inst_id))
    // Prefill contract content if the order carries pre-installation data
    if (order.preInstallation || order.pre_inst || order.pre_inst_no) {
      setContractContent(generateLegalContent(order.preInstallation || order.pre_inst || order))
    }

    window.dispatchEvent(new CustomEvent('k-system-toast', { detail: { message: L('Sales order imported', 'นำเข้าใบสั่งขายแล้ว'), type: 'success' } }))
  }

  // Load pre-installations (excluding those already used in contracts)
  const loadPreInstallations = async () => {
    setPreInstLoading(true)
    try {
      // First, get contracts to find used pre-installation IDs
      const contractsRes = await fetch('/api/contracts', { headers: getAuthHeaders() })
      const contractsJson = await contractsRes.json()
      const usedIds = new Set<number>()
      if (contractsJson && contractsJson.success && Array.isArray(contractsJson.contracts)) {
        contractsJson.contracts.forEach((c: any) => {
          if (c.preInstID) usedIds.add(Number(c.preInstID))
          if (c.pre_inst_id) usedIds.add(Number(c.pre_inst_id))
        })
      }
      setUsedPreInstIds(usedIds)

      // Then get pre-installations
      const res = await fetch('/api/pre-installation', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && j.success && Array.isArray(j.preInstallations)) {
        // Filter out already used
        const available = j.preInstallations.filter((pi: any) => {
          const id = pi.preInstID || pi.id
          return !usedIds.has(Number(id))
        })
        setPreInstList(available)
      }
    } catch (err) {
      console.error('Failed to load pre-installations:', err)
    } finally {
      setPreInstLoading(false)
    }
  }

  // Select a pre-installation and import into contract form
  const selectPreInstallation = (pi: any) => {
    try {
      const preInstNo = pi.preInstNo || pi.pre_inst_no || ''
      setImportedPreInstID(Number(pi.preInstID || pi.id || null))
      setCustomerName(pi.customer_name || pi.customerName || '')
      setCustomerPhone(pi.phone || pi.tel || '')
      setCustomerAddress(pi.site_address || pi.siteAddress || pi.site_name || '')
      // Prefill contract content based on pre-installation
      setContractContent(generateLegalContent(pi))
    } catch (e) {
      console.error('selectPreInstallation error', e)
    } finally {
      setShowPreInstModal(false)
    }
  }

  // Generate comprehensive legal contract content
  const generateLegalContent = (pi: any) => {
    const customerName = pi.customer_name || pi.customerName || '[ชื่อลูกค้า]'
    const siteName = pi.site_name || pi.siteName || '[สถานที่ติดตั้ง]'
    const siteAddress = pi.site_address || pi.siteAddress || '[ที่อยู่]'
    const systemSize = pi.system_size || pi.systemSize || '[กำลังไฟฟ้า]'
    const preInstNo = pi.preInstNo || pi.pre_inst_no || ''

    if (locale === 'th') {
      return `สัญญาซื้อขายและติดตั้งระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์
อ้างอิงเอกสารสำรวจ: ${preInstNo}

บทนำ
คู่สัญญาตกลงตามรายละเอียดต่อไปนี้โดยมีเจตนาให้เกิดผลผูกพันตามกฎหมาย

1. คู่สัญญา
ผู้ขาย: บริษัท เคเซฟ เอนเนอร์จี จำกัด
ผู้ซื้อ: ${customerName}
สถานที่ติดตั้ง: ${siteName}
ที่อยู่: ${siteAddress}

2. คำนิยาม
คำที่ใช้ในสัญญานี้มีความหมายตามที่กำหนดไว้ต่อไปนี้ เว้นแต่บริบทจะระบุไว้เป็นอย่างอื่น:
- "สินค้า" หมายถึง อุปกรณ์ระบบพลังงานแสงอาทิตย์ทั้งหมดที่ระบุในสัญญานี้
- "การติดตั้ง" หมายถึง งานติดตั้ง ทดสอบ และส่งมอบระบบให้แก่ผู้ซื้อ

3. วัตถุประสงค์ของสัญญา
ผู้ขายตกลงจำหน่ายและติดตั้งระบบพลังงานแสงอาทิตย์ขนาด ${systemSize} พร้อมอุปกรณ์ที่เกี่ยวข้อง และผู้ซื้อยอมชำระค่าตามที่ระบุ

4. ราคาและการชำระเงิน
- ราคารวมภาษีมูลค่าเพิ่ม (ถ้ามี)
- การชำระเป็นไปตามตารางงวดที่แนบท้ายสัญญานี้
- การโอนสิทธิและความรับผิดชอบแก่ผู้ซื้อจะเกิดขึ้นเมื่อผู้ขายได้รับยอดชำระตามที่ระบุ

5. การส่งมอบและการติดตั้ง
- ผู้ขายต้องติดตั้งและทดสอบระบบภายในระยะเวลาที่กำหนดนับจากวันชำระเงินงวดแรก
- ผู้ซื้อต้องจัดเตรียมสถานที่ให้พร้อมและรับผิดชอบต่อการขออนุญาตที่จำเป็นทั้งหมด

6. การรับประกันและข้อจำกัดความรับผิด
- การรับประกันชิ้นส่วนและงานติดตั้งเป็นไปตามที่ระบุ โดยทั่วไป: แผงโซลาร์ 25 ปี (ประสิทธิภาพ), อินเวอร์เตอร์ 5-10 ปี, งานติดตั้ง 2 ปี
- การรับประกันไม่ครอบคลุมความเสียหายจากภัยธรรมชาติ ภัยสงคราม การใช้งานผิดประเภท หรืองานที่ไม่ได้รับอนุญาต
- ความรับผิดชอบทั้งหมดของผู้ขายในสัญญานี้จำกัดเพียงการชดเชยความเสียหายโดยตรงที่เกิดขึ้นจริงและไม่เกินมูลค่ารวมของสัญญา ข้อยกเว้นสำหรับการละเมิดโดยเจตนาหรือการประพฤติผิดอย่างร้ายแรงตามกฎหมาย

7. การยกเลิกและการบอกเลิกสัญญา
- หากผู้ซื้อยกเลิกโดยไม่มีเหตุอันสมควร ผู้ขายมีสิทธิเรียกค่าเสียหายตามที่กำหนดในสัญญาหรือหักค่าดำเนินการ
- หากผู้ขายฝ่าฝืนเงื่อนไขสำคัญและไม่สามารถแก้ไขภายในระยะเวลาเหมาะสม ผู้ซื้อมีสิทธิยกเลิกและเรียกค่าสินไหมทดแทน

8. กรณีไม่อาจปฏิบัติ (Force Majeure)
- คู่สัญญาไม่ต้องรับผิดหากไม่สามารถปฏิบัติตามภาระหน้าที่อันเนื่องมาจากเหตุสุดวิสัย เช่น ภัยธรรมชาติ สงคราม เครื่องจักรเสียหายที่ไม่อาจควบคุมได้ เป็นต้น โดยต้องแจ้งฝ่ายตรงข้ามเป็นลายลักษณ์อักษรภายในระยะเวลาที่เหมาะสม

9. การคุ้มครองข้อมูลและความลับ
- คู่สัญญาตกลงรักษาข้อมูลความลับที่ได้รับจากอีกฝ่ายและไม่เปิดเผยต่อบุคคลภายนอก เว้นแต่จำเป็นตามกฎหมาย

10. การโอนสิทธิและหน้าที่
- ห้ามโอนหรือมอบหมายสิทธิหรือภาระผูกพันภายใต้สัญญานี้ให้บุคคลภายนอกโดยไม่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากอีกฝ่าย

11. กฎหมายที่ใช้บังคับและการระงับข้อพิพาท
- สัญญานี้อยู่ภายใต้กฎหมายไทย
- ข้อพิพาทให้พยายามไกล่เกลี่ย หากไม่สำเร็จ ให้ยื่นต่อศาลไทยที่มีเขตอำนาจ

12. ข้อกำหนดทั่วไป
- สัญญานี้เป็นข้อตกลงฉบับสมบูรณ์ระหว่างคู่สัญญา
- หากข้อใดข้อหนึ่งเป็นโมฆะหรือยกเว้นได้ ข้อที่เหลือยังคงมีผลบังคับ

ลงชื่อ

ผู้ขาย: ______________________    วันที่: __________
ผู้ซื้อ: ______________________    วันที่: __________
`
    } else {
      return `SOLAR POWER SYSTEM PURCHASE AND INSTALLATION AGREEMENT
Reference: ${preInstNo}

INTRODUCTION
The Parties enter into this Agreement to set out the terms and conditions under which the Seller will supply and install the Solar Power System described herein.

1. PARTIES
Seller: K-Save Energy Co., Ltd.
Buyer: ${customerName}
Installation Site: ${siteName}
Address: ${siteAddress}

2. DEFINITIONS
Capitalized terms used in this Agreement shall have the meanings set out in this Agreement. "Goods" means the solar equipment described; "Works" means the installation, testing and commissioning works.

3. SCOPE
The Seller shall supply and install a solar power generation system of ${systemSize} and related equipment and services as described.

4. PRICE AND PAYMENT
4.1 The Price is inclusive of VAT unless stated otherwise.
4.2 Payment shall be made in accordance with the installment schedule attached to this Agreement.
4.3 Title and risk transfer provisions are as set out in this Agreement and applicable law.

5. DELIVERY AND INSTALLATION
The Seller shall deliver and complete installation within the agreed timeframe, subject to Buyer’s site readiness and obtaining necessary permits.

6. WARRANTY AND LIMITATION OF LIABILITY
6.1 Warranties are provided as specified: Panels – 25-year performance warranty; Inverter – 5-10 years; Installation workmanship – 2 years.
6.2 The Seller’s aggregate liability under or in connection with this Agreement shall be limited to direct damages and in no event shall exceed the total contract price, except for liability resulting from fraud, willful misconduct or gross negligence.

7. TERMINATION
Either Party may terminate this Agreement for material breach if the breach is not remedied within a reasonable period after notice. Buyer cancellation may incur fees as specified herein.

8. FORCE MAJEURE
Neither Party shall be liable for failure to perform any obligation if prevented by force majeure; the affected Party shall notify the other promptly.

9. CONFIDENTIALITY
Each Party shall keep confidential any confidential information disclosed by the other and shall not disclose it to third parties without prior written consent unless required by law.

10. ASSIGNMENT
Neither Party may assign its rights or obligations under this Agreement without the prior written consent of the other Party.

11. GOVERNING LAW AND DISPUTE RESOLUTION
This Agreement shall be governed by the laws of Thailand. Disputes shall be resolved through amicable negotiation and, failing that, by the competent Thai courts.

12. GENERAL
This Agreement constitutes the entire agreement between the Parties. If any provision is held invalid, the remaining provisions shall remain in full force and effect.

IN WITNESS WHEREOF the parties have executed this Agreement:

Seller: ______________________    Date: __________
Buyer: ______________________    Date: __________
`
    }
  }

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cusId = e.target.value
    if (!cusId) {
      setSelectedCustomer(null)
      setCustomerName('')
      setCustomerPhone('')
      setCustomerAddress('')
      return
    }
    const cus = customers.find(c => String(c.cusID || c.id) === cusId)
    if (cus) {
      setSelectedCustomer(cus)
      setCustomerName(cus.fullname || cus.name || '')
      setCustomerPhone(cus.phone || cus.tel || '')
      setCustomerAddress(cus.address || '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contractNo) {
      alert(L('Please enter contract number', 'กรุณากรอกเลขที่สัญญา'))
      return
    }
    if (!customerName) {
      alert(L('Please select or enter customer', 'กรุณาเลือกหรือกรอกข้อมูลลูกค้า'))
      return
    }

    setLoading(true)
    const payload = {
      contractNo,
      contractDate,
      cusID: selectedCustomer?.cusID || selectedCustomer?.id || null,
      customerName,
      customerPhone,
      customerAddress,
      contractContent,
      contractDuration,
      durationUnit,
      startDate,
      endDate,
      totalAmount,
      installmentCount,
      installmentAmount,
      paymentSchedule,
      warrantyPeriod,
      warrantyUnit,
      maintenanceScope,
      notes,
      preInstID: importedPreInstID,
      createdBy: localStorage.getItem('k_system_admin_user') || 'thailand admin'
    }

    try {
      const headers: any = { 'Content-Type': 'application/json', ...getAuthHeaders() }
      const res = await fetch('/api/contracts', { method: 'POST', headers, body: JSON.stringify(payload) })
      const j = await res.json()
      if (j && j.success) {
        window.dispatchEvent(new CustomEvent('k-system-toast', { detail: { message: L('Contract saved!', 'บันทึกสัญญาแล้ว!'), type: 'success' } }))
        router.push('/KR-Thailand/Admin-Login/contract/list')
      } else {
        alert(L('Save failed', 'บันทึกไม่สำเร็จ') + ': ' + (j?.error || ''))
      }
    } catch (err) {
      console.error(err)
      alert(L('Network error', 'เกิดข้อผิดพลาด'))
    } finally {
      setLoading(false)
    }
  }

  const fmtCurrency = (n: number) => n.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <AdminLayout title="Contract" titleTh="สัญญาซื้อ-ขาย">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M12 18v-6"/>
              <path d="M9 15l3 3 3-3"/>
            </svg>
            {L('Create Sales Contract', 'สร้างสัญญาซื้อ-ขาย')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Create sales and purchase contract for customers', 'สร้างสัญญาซื้อขายสำหรับลูกค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <CreatedBy />
          <form onSubmit={handleSubmit}>
            {/* Import Section */}
            <div style={{ marginBottom: 20, padding: 16, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
              <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: 12 }}>{L('Import from:', 'นำเข้าจาก:')}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                <button type="button" onClick={() => { loadPreInstallations(); setShowPreInstModal(true) }} className={styles.btnOutline} style={{ padding: '10px 16px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  </svg>
                  {L('Import from Pre-installation', 'นำเข้าจากแบบก่อนติดตั้ง')}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" onClick={loadSalesOrders} className={styles.btnOutline}>
                  {loadingSalesOrders ? L('Loading...', 'กำลังโหลด...') : L('Load Sales Orders', 'โหลดใบสั่งขาย')}
                </button>
                <select value={selectedSOId} onChange={(e) => setSelectedSOId(e.target.value)} className={styles.formInput} style={{ width: 260 }}>
                  <option value="">{L('Select a sales order', 'เลือกใบสั่งขาย')}</option>
                  {salesOrders.map((s: any) => (
                    <option key={s.orderID || s.orderNo} value={s.orderID || s.orderNo}>
                      {`${s.orderNo} — ${s.customer_name || s.customer || ''}`}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={importSalesOrder} className={`${styles.btn} ${styles.btnPrimary}`}>
                  {L('Import', 'นำเข้า')}
                </button>
              </div>
            </div>
            {/* Contract Number & Date */}
            <div className={styles.formRow} style={{ marginBottom: 20 }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Contract No.', 'เลขที่สัญญา')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={contractNo}
                    onChange={e => setContractNo(e.target.value)}
                    className={styles.formInput}
                    placeholder="CT-260124-0001"
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={refreshContractNo} className={styles.btnOutline}>
                    {L('Refresh', 'รีเฟรช')}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Contract Date', 'วันที่ทำสัญญา')}</label>
                <input
                  type="date"
                  value={contractDate}
                  readOnly
                  title={L('Fixed to today', 'ตั้งเป็นวันที่ปัจจุบัน')}
                  className={styles.formInput}
                />
              </div>
            </div>

            {/* Customer Information */}
            <div style={{ marginBottom: 20, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>
                {L('Customer Information', 'ข้อมูลลูกค้า')}
              </h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Select Customer', 'เลือกลูกค้า')}</label>
                  <select onChange={handleCustomerSelect} className={styles.formSelect}>
                    <option value="">{L('-- Select or enter manually --', '-- เลือกหรือกรอกเอง --')}</option>
                    {customers.map(c => (
                      <option key={c.cusID || c.id} value={c.cusID || c.id}>
                        {c.fullname || c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {L('Customer Name', 'ชื่อลูกค้า')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className={styles.formInput}
                    placeholder={L('Customer name', 'ชื่อลูกค้า')}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Phone', 'โทรศัพท์')}</label>
                  <input
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className={styles.formInput}
                    placeholder="08x-xxx-xxxx"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label className={styles.formLabel}>{L('Address', 'ที่อยู่')}</label>
                  <input
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    className={styles.formInput}
                    placeholder={L('Customer address', 'ที่อยู่ลูกค้า')}
                  />
                </div>
              </div>
            </div>

            {/* Contract Content */}
            <div style={{ marginBottom: 20, padding: 16, background: '#eff6ff', borderRadius: 8 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>
                {L('Contract Terms', 'เนื้อหาสัญญา')}
              </h3>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Contract Content / Terms', 'เนื้อหาสัญญาที่กำหนด')}</label>
                <textarea
                  value={contractContent}
                  onChange={e => setContractContent(e.target.value)}
                  className={styles.formInput}
                  rows={5}
                  placeholder={L('Enter contract terms and conditions...', 'ระบุเงื่อนไขและข้อกำหนดของสัญญา...')}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Contract Duration', 'ระยะเวลาสัญญา')}</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      min={1}
                      value={contractDuration}
                      onChange={e => setContractDuration(Number(e.target.value) || 1)}
                      className={styles.formInput}
                      style={{ width: 100 }}
                    />
                    <select
                      value={durationUnit}
                      onChange={e => setDurationUnit(e.target.value as any)}
                      className={styles.formSelect}
                      style={{ width: 120 }}
                    >
                      <option value="days">{L('Days', 'วัน')}</option>
                      <option value="months">{L('Months', 'เดือน')}</option>
                      <option value="years">{L('Years', 'ปี')}</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Start Date', 'วันที่เริ่มต้น')}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('End Date', 'วันที่สิ้นสุด')}</label>
                  <input
                    type="date"
                    value={endDate}
                    readOnly
                    className={styles.formInput}
                    style={{ background: '#f1f5f9' }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div style={{ marginBottom: 20, padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>
                {L('Payment Terms', 'กำหนดชำระเงิน')}
              </h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Total Amount', 'ยอดรวมทั้งหมด')} (฿)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={totalAmount}
                    onChange={e => setTotalAmount(Number(e.target.value) || 0)}
                    className={styles.formInput}
                    style={{ textAlign: 'right' }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Number of Installments', 'จำนวนงวด')}</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={installmentCount}
                    onChange={e => setInstallmentCount(Number(e.target.value) || 1)}
                    className={styles.formInput}
                    style={{ textAlign: 'center' }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Amount per Installment', 'งวดละ')} (฿)</label>
                  <input
                    type="number"
                    value={installmentAmount}
                    readOnly
                    className={styles.formInput}
                    style={{ textAlign: 'right', background: '#f1f5f9' }}
                  />
                </div>
              </div>

              {/* Payment Schedule Preview */}
              {paymentSchedule.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <label className={styles.formLabel}>{L('Payment Schedule', 'ตารางการชำระเงิน')}</label>
                  <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                    <table className={styles.table} style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: 80 }}>{L('No.', 'งวดที่')}</th>
                          <th>{L('Due Date', 'กำหนดชำระ')}</th>
                          <th style={{ textAlign: 'right' }}>{L('Amount', 'จำนวนเงิน')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentSchedule.map((p, i) => (
                          <tr key={i}>
                            <td style={{ textAlign: 'center' }}>{p.installmentNo}</td>
                            <td>{p.dueDate}</td>
                            <td style={{ textAlign: 'right' }}>{fmtCurrency(p.amount)} ฿</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Warranty & Maintenance */}
            <div style={{ marginBottom: 20, padding: 16, background: '#fef3c7', borderRadius: 8 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>
                {L('Warranty & Maintenance', 'การประกันและบำรุงรักษา')}
              </h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Warranty Period', 'ระยะเวลาประกัน')}</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      value={warrantyPeriod}
                      onChange={e => setWarrantyPeriod(Number(e.target.value) || 0)}
                      className={styles.formInput}
                      style={{ width: 100 }}
                    />
                    <select
                      value={warrantyUnit}
                      onChange={e => setWarrantyUnit(e.target.value as any)}
                      className={styles.formSelect}
                      style={{ width: 120 }}
                    >
                      <option value="days">{L('Days', 'วัน')}</option>
                      <option value="months">{L('Months', 'เดือน')}</option>
                      <option value="years">{L('Years', 'ปี')}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Maintenance Scope', 'ขอบเขตการดูแล')}</label>
                <textarea
                  value={maintenanceScope}
                  onChange={e => setMaintenanceScope(e.target.value)}
                  className={styles.formInput}
                  rows={3}
                  placeholder={L('Describe the scope of maintenance and support...', 'ระบุขอบเขตการดูแลและบำรุงรักษา...')}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <label className={styles.formLabel}>{L('Notes / Remarks', 'หมายเหตุ')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={styles.formInput}
                rows={3}
                placeholder={L('Additional notes...', 'หมายเหตุเพิ่มเติม...')}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <button
                type="submit"
                disabled={loading}
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                </svg>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save Contract', 'บันทึกสัญญา')}
              </button>
              <button
                type="button"
                onClick={() => router.push('/KR-Thailand/Admin-Login/contract/list')}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                {L('Cancel', 'ยกเลิก')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Pre-installation Selection Modal */}
      {showPreInstModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowPreInstModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: 800,
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                  {L('Select Pre-installation', 'เลือกแบบก่อนติดตั้ง')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>
                  {L('Only showing records not yet used in contracts', 'แสดงเฉพาะรายการที่ยังไม่ถูกใช้ทำสัญญา')}
                </p>
              </div>
              <button onClick={() => setShowPreInstModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 24, color: '#666'
              }}>&times;</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px' }}>
              {preInstLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                  {L('Loading...', 'กำลังโหลด...')}
                </div>
              ) : preInstList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                  {L('No available pre-installations (all used or none exist)', 'ไม่มีแบบก่อนติดตั้งที่พร้อมใช้งาน (ถูกใช้หมดแล้วหรือยังไม่มี)')}
                </div>
              ) : (
                <table className={styles.table} style={{ fontSize: 14 }}>
                  <thead>
                    <tr>
                      <th>{L('Pre-Inst No.', 'เลขที่')}</th>
                      <th>{L('Customer', 'ลูกค้า')}</th>
                      <th>{L('Site', 'สถานที่')}</th>
                      <th>{L('System Size', 'ขนาดระบบ')}</th>
                      <th>{L('Survey Date', 'วันที่สำรวจ')}</th>
                      <th style={{ width: 100 }}>{L('Action', 'เลือก')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preInstList.map((pi: any) => (
                      <tr key={pi.preInstID || pi.id}>
                        <td style={{ fontWeight: 600 }}>{pi.preInstNo || pi.pre_inst_no || '-'}</td>
                        <td>{pi.customer_name || pi.customerName || '-'}</td>
                        <td>{pi.site_name || pi.siteName || '-'}</td>
                        <td>{pi.system_size || pi.systemSize || '-'}</td>
                        <td>{pi.survey_date ? new Date(pi.survey_date).toLocaleDateString('th-TH') : '-'}</td>
                        <td>
                          <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            style={{ padding: '6px 12px', fontSize: 13 }}
                            onClick={() => selectPreInstallation(pi)}
                          >
                            {L('Select', 'เลือก')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
