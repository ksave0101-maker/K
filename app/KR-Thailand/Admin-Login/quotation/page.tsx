"use client"

import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import CreatedBy from '../components/CreatedBy'
import { useRouter } from 'next/navigation'
import styles from '../admin-theme.module.css'

type CustomerType = {
  name: string
  phone: string
  address: string
  email?: string | null
  company?: string | null
  tax_id?: string | null
  subject?: string | null
  message?: string | null
  created_by?: string | null
  created_at?: string | null
  // Address components for dynamic formatting
  house_number?: string | null
  moo?: string | null
  tambon?: string | null
  amphoe?: string | null
  province?: string | null
  postcode?: string | null
}

export default function QuotationPage() {
  const router = useRouter()
  const [quoteNo, setQuoteNo] = useState('')
  const [quoteDate, setQuoteDate] = useState(() => new Date().toISOString().split('T')[0])
  const [customer, setCustomer] = useState<CustomerType>({ name: '', phone: '', address: '' })
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [allCustomers, setAllCustomers] = useState<any[]>([])
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [productSearchResults, setProductSearchResults] = useState<any[]>([])
  const [productSearchIndex, setProductSearchIndex] = useState<number | null>(null)
  const [items, setItems] = useState([{ desc: '', qty: 1, price: 0 }])
  const [discount, setDiscount] = useState(0)
  const [taxRate, setTaxRate] = useState(7)
  const [errors, setErrors] = useState<string[]>([])
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 })
  const [loading, setLoading] = useState(false)

  // Pre-installation & Power Calculator modals
  const [showPreInstallModal, setShowPreInstallModal] = useState(false)
  const [preInstallList, setPreInstallList] = useState<any[]>([])
  const [preInstallLoading, setPreInstallLoading] = useState(false)
  const [showPowerCalcModal, setShowPowerCalcModal] = useState(false)
  const [powerCalcList, setPowerCalcList] = useState<any[]>([])
  const [powerCalcLoading, setPowerCalcLoading] = useState(false)
  const [importedFromRef, setImportedFromRef] = useState<string>('')
  const [preInstallFormID, setPreInstallFormID] = useState<number | null>(null)
  const [powerCalcID, setPowerCalcID] = useState<number | null>(null)

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

  // Transliterate Thai text to English (basic romanization)
  const transliterate = (text: string): string => {
    if (!text) return ''

    // Common province/district mappings
    const placeNames: Record<string, string> = {
      'ดอนทราย': 'Don Sai',
      'โพธาราม': 'Photharam',
      'ราชบุรี': 'Ratchaburi',
      'กรุงเทพ': 'Bangkok',
      'กรุงเทพมหานคร': 'Bangkok',
      'เชียงใหม่': 'Chiang Mai',
      'ภูเก็ต': 'Phuket',
      'พัทยา': 'Pattaya',
      'สมุทรปราการ': 'Samut Prakan',
      'นนทบุรี': 'Nonthaburi',
      'ปทุมธานี': 'Pathum Thani',
      'ชลบุรี': 'Chonburi',
      'ระยอง': 'Rayong',
      'นครราชสีมา': 'Nakhon Ratchasima',
      'ขอนแก่น': 'Khon Kaen',
      'อุบลราชธานี': 'Ubon Ratchathani',
      'อุดรธานี': 'Udon Thani',
      'สงขลา': 'Songkhla',
      'นครศรีธรรมราช': 'Nakhon Si Thammarat',
      'สุราษฎร์ธานี': 'Surat Thani'
    }

    return placeNames[text] || text
  }

  // Format address based on current locale
  const formatAddress = (c: CustomerType) => {
    if (locale === 'en') {
      // English format with transliteration
      const parts = [
        c.house_number,
        c.moo ? `Moo ${c.moo}` : '',
        c.tambon ? `T.${transliterate(c.tambon)}` : '',
        c.amphoe ? `A.${transliterate(c.amphoe)}` : '',
        c.province ? transliterate(c.province) : '',
        c.postcode
      ].filter(Boolean).join(' ')
      return parts || c.address || ''
    } else {
      // Thai format
      const parts = [
        c.house_number,
        c.moo ? `หมู่ ${c.moo}` : '',
        c.tambon ? `ต.${c.tambon}` : '',
        c.amphoe ? `อ.${c.amphoe}` : '',
        c.province ? `จ.${c.province}` : '',
        c.postcode
      ].filter(Boolean).join(' ')
      return parts || c.address || ''
    }
  }

  // Load initial quote number
  useEffect(() => {
    refreshQuoteNo()
  }, [])

  // Update address format when locale changes
  useEffect(() => {
    if (customer.house_number || customer.moo || customer.tambon) {
      const formatted = formatAddress(customer)
      if (customer.address !== formatted) {
        setCustomer(prev => ({ ...prev, address: formatted }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  // Load all customers
  useEffect(() => {
    const loadAllCustomers = async () => {
      try {
        const res = await fetch('/api/customers')
        const j = await res.json()
        if (j && Array.isArray(j.customers)) {
          setAllCustomers(j.customers)
        }
      } catch (err) {
        console.error('Failed to load all customers', err)
      }
    }
    loadAllCustomers()
  }, [])

  const refreshQuoteNo = async () => {
    try {
      const res = await fetch('/api/quotation-seq')
      const j = await res.json()
      if (j && j.success && j.formatted) {
        setQuoteNo(j.formatted)
      }
      // Also update date to today
      setQuoteDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      console.error('Failed to get quote number:', err)
      // Fallback to local generation
      const now = new Date()
      const yy = String(now.getFullYear()).slice(-2)
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      setQuoteNo(`QT-${yy}${mm}${dd}-0001`)
    }
  }

  useEffect(() => {
    const subtotal = items.reduce((s, it) => s + it.qty * Number(it.price || 0), 0)
    const discountAmount = (subtotal * Number(discount || 0)) / 100
    const afterDiscount = Math.max(0, subtotal - discountAmount)
    const tax = (afterDiscount * Number(taxRate || 0)) / 100
    setTotals({ subtotal, tax, total: afterDiscount + tax })
  }, [items, discount, taxRate])

  function addItem() {
    setItems([...items, { desc: '', qty: 1, price: 0 }])
  }

  function updateItem(i: number, key: string, value: any) {
    const copy = [...items]
    // @ts-ignore
    copy[i][key] = key === 'desc' ? value : Number(value)
    setItems(copy)
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i))
  }

  function validate() {
    const e: string[] = []
    if (!customer.name) e.push(L('Please enter customer name', 'กรุณาใส่ชื่อลูกค้า'))
    items.forEach((it, idx) => {
      if (!it.desc) e.push(L(`Item ${idx + 1} needs description`, `รายการที่ ${idx + 1} ต้องมีคำอธิบาย`))
      if (it.qty <= 0) e.push(L(`Qty must be > 0 for item ${idx + 1}`, `จำนวนสำหรับรายการ ${idx + 1} ต้องมากกว่า 0`))
    })
    setErrors(e)
    return e.length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const discountAmount = (totals.subtotal * Number(discount || 0)) / 100
      const payload = {
        quoteNo,
        quoteDate,
        customerName: customer.name,
        customerEmail: customer.email || null,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerCompany: customer.company || null,
        customerTaxId: customer.tax_id || null,
        preInstallFormID: preInstallFormID,
        powerCalcID: powerCalcID,
        items: items.map(it => ({
          description: it.desc,
          product_name: it.desc,
          quantity: it.qty,
          unit_price: it.price
        })),
        subtotal: totals.subtotal,
        discountPercent: discount,
        discountAmount: discountAmount,
        vatPercent: taxRate,
        vatAmount: totals.tax,
        total: totals.total
      }
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const j = await res.json()
      if (res.ok && j.success) {
        // Redirect to quotation list after successful save
        router.push('/KR-Thailand/Admin-Login/quotation/list')
      } else {
        alert(L('Failed to save quotation: ' + (j.error || 'Unknown error'), 'ไม่สามารถบันทึกใบเสนอราคา: ' + (j.error || 'ข้อผิดพลาดไม่ทราบสาเหตุ')))
      }
    } catch (err) {
      console.error('Save quotation error:', err)
      alert(L('Error saving quotation', 'เกิดข้อผิดพลาดขณะบันทึกใบเสนอราคา'))
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    if (!showSearch) {
      setShowSearch(true)
      try {
        const res = await fetch('/api/customers')
        const j = await res.json()
        if (j && Array.isArray(j.customers)) setSearchResults(j.customers)
      } catch (err) {
        console.error('Failed to load customers', err)
      }
    } else {
      setShowSearch(false)
    }
  }

  const selectCustomer = async (c: any) => {
    try {
      const res = await fetch(`/api/customers?id=${c.cusID}`)
      const j = await res.json()
      if (j && j.success && j.customer) {
        const cu = j.customer

        // Build formatted address based on current locale
        let addressParts
        if (locale === 'en') {
          addressParts = [
            cu.house_number,
            cu.moo ? `Moo ${cu.moo}` : '',
            cu.tambon ? `T.${transliterate(cu.tambon)}` : '',
            cu.amphoe ? `A.${transliterate(cu.amphoe)}` : '',
            cu.province ? transliterate(cu.province) : '',
            cu.postcode
          ].filter(Boolean).join(' ')
        } else {
          addressParts = [
            cu.house_number,
            cu.moo ? `หมู่ ${cu.moo}` : '',
            cu.tambon ? `ต.${cu.tambon}` : '',
            cu.amphoe ? `อ.${cu.amphoe}` : '',
            cu.province ? `จ.${cu.province}` : '',
            cu.postcode
          ].filter(Boolean).join(' ')
        }

        setCustomer({
          name: cu.fullname || '',
          phone: cu.phone || '',
          address: addressParts || cu.address || '',
          email: cu.email || null,
          company: cu.company || null,
          tax_id: cu.tax_id || null,
          subject: cu.subject || null,
          message: cu.message || null,
          created_by: cu.created_by || null,
          created_at: cu.created_at || null,
          // Store address components for dynamic formatting
          house_number: cu.house_number || null,
          moo: cu.moo || null,
          tambon: cu.tambon || null,
          amphoe: cu.amphoe || null,
          province: cu.province || null,
          postcode: cu.postcode || null
        })
      } else {
        setCustomer({ name: c.fullname || '', phone: c.phone || '', address: c.address || '' })
      }
    } catch (err) {
      console.error('Failed to fetch customer by id', err)
      setCustomer({ name: c.fullname || '', phone: c.phone || '', address: c.address || '' })
    }
    setShowSearch(false)
  }

  const loadProducts = async (index: number) => {
    setProductSearchIndex(index)
    if (!productSearchOpen) {
      setProductSearchOpen(true)
      try {
        const res = await fetch('/api/products')
        const j = await res.json()
        if (j && Array.isArray(j.products)) setProductSearchResults(j.products)
      } catch (err) {
        console.error('Failed to load products', err)
      }
    } else {
      setProductSearchOpen(false)
      setProductSearchIndex(null)
    }
  }

  const searchProducts = async () => {
    try {
      const q = encodeURIComponent(productSearchTerm || '')
      const res = await fetch('/api/products' + (q ? `?q=${q}` : ''))
      const j = await res.json()
      if (j && Array.isArray(j.products)) setProductSearchResults(j.products)
    } catch (err) {
      console.error('Product search failed', err)
    }
  }

  const selectProduct = (p: any) => {
    if (productSearchIndex !== null) {
      updateItem(productSearchIndex, 'desc', `${p.name} (${p.sku})`)
      updateItem(productSearchIndex, 'price', p.price || 0)
    }
    setProductSearchOpen(false)
    setProductSearchIndex(null)
  }

  // Load pre-installation list
  const loadPreInstallList = async () => {
    setShowPreInstallModal(true)
    setPreInstallLoading(true)
    try {
      const res = await fetch('/api/pre-installation')
      const j = await res.json()
      if (j && j.success && Array.isArray(j.forms)) {
        setPreInstallList(j.forms)
      } else if (j && Array.isArray(j.preInstallations)) {
        setPreInstallList(j.preInstallations)
      }
    } catch (err) {
      console.error('Failed to load pre-installation list', err)
    } finally {
      setPreInstallLoading(false)
    }
  }

  // Select pre-installation form
  const selectPreInstall = async (form: any) => {
    try {
      const res = await fetch(`/api/pre-installation?id=${form.formID || form.id}`)
      const j = await res.json()
      if (!res.ok || !j.success) {
        alert(L('Pre-installation form not found', 'ไม่พบแบบฟอร์มก่อนติดตั้ง'))
        return
      }
      const f = j.form
      setCustomer({
        name: f.customer_name || f.site_name || '',
        phone: f.customer_phone || f.contact_phone || '',
        address: f.site_address || f.address || '',
        email: f.customer_email || null,
        company: f.company_name || null
      })
      const newItems: any[] = []
      if (f.recommended_products && Array.isArray(f.recommended_products)) {
        f.recommended_products.forEach((p: any) => {
          newItems.push({
            desc: p.name || p.product_name || p.description || '',
            qty: Number(p.quantity) || 1,
            price: Number(p.price) || Number(p.unit_price) || 0
          })
        })
      }
      if (f.equipment_needed) {
        newItems.push({ desc: L('Equipment: ', 'อุปกรณ์: ') + f.equipment_needed, qty: 1, price: 0 })
      }
      if (newItems.length > 0) setItems(newItems)

      // Save imported reference and FK
      const refNo = f.pre_install_no || f.formNo || `PRE-${String(f.formID).padStart(6, '0')}`
      setImportedFromRef(L('Pre-installation: ', 'ก่อนติดตั้ง: ') + refNo)
      setPreInstallFormID(f.formID || form.formID)
      setPowerCalcID(null) // Clear power calc ID

      setShowPreInstallModal(false)
    } catch (err) {
      console.error(err)
      alert(L('Failed to fetch pre-installation form', 'เกิดข้อผิดพลาดขณะดึงข้อมูลแบบฟอร์ม'))
    }
  }

  // Load power calculation list
  const loadPowerCalcList = async () => {
    setShowPowerCalcModal(true)
    setPowerCalcLoading(true)
    try {
      const res = await fetch('/api/power-calculations')
      const j = await res.json()
      if (j && j.success && Array.isArray(j.calculations)) {
        setPowerCalcList(j.calculations)
      } else if (j && Array.isArray(j.powerCalculations)) {
        setPowerCalcList(j.powerCalculations)
      }
    } catch (err) {
      console.error('Failed to load power calculations', err)
    } finally {
      setPowerCalcLoading(false)
    }
  }

  // Select power calculation
  const selectPowerCalc = async (calc: any) => {
    try {
      const res = await fetch(`/api/power-calculations?id=${calc.calcID || calc.id}`)
      const j = await res.json()
      if (!res.ok || !j.success) {
        alert(L('Power calculation not found', 'ไม่พบใบคำนวณพลังงาน'))
        return
      }
      const c = j.calculation
      if (c.customer_name || c.site_name) {
        setCustomer({
          name: c.customer_name || c.site_name || '',
          phone: c.customer_phone || '',
          address: c.site_address || c.address || '',
          email: c.customer_email || null,
          company: c.company_name || null
        })
      }
      const newItems: any[] = []
      if (c.recommended_system) {
        newItems.push({ desc: L('Recommended System: ', 'ระบบที่แนะนำ: ') + c.recommended_system, qty: 1, price: Number(c.system_price) || 0 })
      }
      if (c.solar_panels) {
        newItems.push({ desc: L('Solar Panels: ', 'แผงโซลาร์: ') + c.solar_panels, qty: Number(c.panel_quantity) || 1, price: Number(c.panel_price) || 0 })
      }
      if (c.inverter) {
        newItems.push({ desc: L('Inverter: ', 'อินเวอร์เตอร์: ') + c.inverter, qty: Number(c.inverter_quantity) || 1, price: Number(c.inverter_price) || 0 })
      }
      if (c.battery) {
        newItems.push({ desc: L('Battery: ', 'แบตเตอรี่: ') + c.battery, qty: Number(c.battery_quantity) || 1, price: Number(c.battery_price) || 0 })
      }
      if (c.installation_fee) {
        newItems.push({ desc: L('Installation Fee', 'ค่าติดตั้ง'), qty: 1, price: Number(c.installation_fee) || 0 })
      }
      if (c.total_power_kw) {
        newItems.push({ desc: L('Total Power: ', 'กำลังไฟรวม: ') + c.total_power_kw + ' kW', qty: 1, price: 0 })
      }
      if (newItems.length > 0) setItems(newItems.filter(it => it.desc))

      // Save imported reference and FK
      const refNo = c.power_calcuNo || c.calcNo || `CALC-${String(c.calcID).padStart(6, '0')}`
      setImportedFromRef(L('Power Calculator: ', 'คำนวณพลังงาน: ') + refNo)
      setPowerCalcID(c.calcID || calc.calcID)
      setPreInstallFormID(null) // Clear pre-install ID

      setShowPowerCalcModal(false)
    } catch (err) {
      console.error(err)
      alert(L('Failed to fetch power calculation', 'เกิดข้อผิดพลาดขณะดึงข้อมูลใบคำนวณ'))
    }
  }

  return (
    <AdminLayout title="Quotation" titleTh="ใบเสนอราคา">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            {L('Create Quotation', 'สร้างใบเสนอราคา')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Generate quotation for customer', 'สร้างใบเสนอราคาสำหรับลูกค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <CreatedBy />
          <form onSubmit={handleSubmit}>
            {/* Quote Number & Date */}
            <div className={styles.formRow} style={{ marginBottom: 16 }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Quote No.', 'เลขที่ใบเสนอราคา')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={quoteNo}
                    onChange={e => setQuoteNo(e.target.value)}
                    className={styles.formInput}
                    placeholder="QT-260124-0001"
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="button" className={styles.btnOutline} onClick={refreshQuoteNo}>
                    {L('Refresh', 'รีเฟรช')}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input
                  type="date"
                  value={quoteDate}
                  readOnly
                  title={L('Fixed to today', 'ตั้งเป็นวันที่ปัจจุบัน')}
                  className={styles.formInput}
                />
              </div>
            </div>

            {/* Import Section */}
            <div style={{ marginBottom: 16, padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#0369a1' }}>{L('Import from:', 'นำเข้าจาก:')}</span>
                <button type="button" className={styles.btnOutline} style={{ padding: '8px 12px' }} onClick={loadPreInstallList}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  </svg>
                  {L('Import from Pre-installation', 'นำเข้าจากแบบฟอร์มก่อนติดตั้ง')}
                </button>
                <button type="button" className={styles.btnOutline} style={{ padding: '8px 12px' }} onClick={loadPowerCalcList}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  {L('Import from Power Calculator', 'นำเข้าจากใบคำนวณพลังงาน')}
                </button>
              </div>
              {importedFromRef && (
                <div style={{ marginTop: 8, padding: 8, background: '#e0f2fe', borderRadius: 6, fontSize: 13, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontWeight: 500 }}>{L('Imported from:', 'นำเข้าจาก:')}</span>
                  <span style={{ fontWeight: 600 }}>{importedFromRef}</span>
                </div>
              )}
            </div>

            {/* Customer Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label className={styles.formLabel} style={{ margin: 0 }}>{L('Customer Information', 'ข้อมูลลูกค้า')}</label>
                <button type="button" onClick={loadCustomers} className={styles.btnOutline}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  {L('Search Customer', 'ค้นหาลูกค้า')}
                </button>
              </div>

              {showSearch && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12, background: '#fff' }}>
                  <input
                    placeholder={L('Search by name or email', 'ค้นหาด้วยชื่อหรืออีเมล')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={styles.formInput}
                    style={{ marginBottom: 8 }}
                  />
                  <div style={{ maxHeight: 200, overflow: 'auto' }}>
                    {(searchResults || []).filter(c => {
                      if (!searchTerm) return true
                      const s = searchTerm.trim().toLowerCase()
                      return ((c.fullname || '').toLowerCase().includes(s) || (c.email || '').toLowerCase().includes(s) || (c.phone || '').toLowerCase().includes(s))
                    }).map((c: any, idx: number) => (
                      <div key={idx} style={{ padding: 8, borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => selectCustomer(c)}>
                        <div style={{ fontWeight: 700 }}>{c.fullname}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{c.email || c.phone}</div>
                      </div>
                    ))}
                    {searchResults.filter(c => {
                      if (!searchTerm) return true
                      const s = searchTerm.toLowerCase()
                      return (c.fullname || c.email || c.phone || '').toLowerCase().includes(s)
                    }).length === 0 && <div style={{ color: '#666', padding: 8 }}>{L('No customers found', 'ไม่พบลูกค้า')}</div>}
                  </div>
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Name', 'ชื่อ')}</label>
                  <input
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    className={styles.formInput}
                    placeholder={L('Customer name', 'ชื่อลูกค้า')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Phone', 'โทรศัพท์')}</label>
                  <input
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    className={styles.formInput}
                    placeholder={L('Phone', 'เบอร์โทร')}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Address', 'ที่อยู่')}</label>
                <textarea
                  value={customer.address}
                  onChange={e => setCustomer({ ...customer, address: e.target.value })}
                  className={styles.formTextarea}
                  rows={2}
                  placeholder={L('Address', 'ที่อยู่')}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Email', 'อีเมล')}</label>
                  <input
                    type="email"
                    value={customer.email || ''}
                    onChange={e => setCustomer({ ...customer, email: e.target.value })}
                    className={styles.formInput}
                    placeholder={L('Email address', 'อีเมล')}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Company', 'บริษัท')}</label>
                <input
                  value={customer.company || ''}
                  onChange={e => setCustomer({ ...customer, company: e.target.value })}
                  className={styles.formInput}
                  placeholder={L('Company name', 'ชื่อบริษัท')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Tax ID', 'เลขผู้เสียภาษี')}</label>
                <input
                  value={customer.tax_id || ''}
                  onChange={e => setCustomer({ ...customer, tax_id: e.target.value })}
                  className={styles.formInput}
                  placeholder={L('Tax ID (13 digits)', 'เลขประจำตัวผู้เสียภาษี (13 หลัก)')}
                  maxLength={13}
                />
              </div>
            </div>

            {/* Items Section */}
            <div style={{ marginBottom: '24px' }}>
              <label className={styles.formLabel}>{L('Product Details', 'รายละเอียดสินค้า')}</label>

              <table className={styles.table} style={{ marginTop: '8px' }}>
                <thead>
                  <tr>
                    <th>{L('Description', 'รายละเอียด')}</th>
                    <th style={{ width: '100px' }}>{L('Qty', 'จำนวน')}</th>
                    <th style={{ width: '140px' }}>{L('Price per unit', 'ราคาต่อหน่วย')}</th>
                    <th style={{ width: '140px' }}>{L('Total', 'รวม')}</th>
                    <th style={{ width: '100px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            placeholder={L('Description', 'รายละเอียด')}
                            value={it.desc}
                            onChange={e => updateItem(i, 'desc', e.target.value)}
                            className={styles.formInput}
                            style={{ flex: 1 }}
                          />
                          <button type="button" onClick={() => loadProducts(i)} className={styles.btnOutline} style={{ padding: '4px 8px' }}>
                            {L('Search', 'ค้นหา')}
                          </button>
                        </div>
                      </td>
                      <td>
                        <input type="number" min={1} value={it.qty} onChange={e => updateItem(i, 'qty', e.target.value)} className={styles.formInput} style={{ textAlign: 'center' }} />
                      </td>
                      <td style={{ textAlign: 'right', padding: '8px', fontWeight: 500 }}>
                        {it.price > 0 ? `${Number(it.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿` : '-'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {(it.qty * it.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                      </td>
                      <td>
                        <button type="button" onClick={() => removeItem(i)} className={styles.btnOutline} style={{ padding: '4px 8px' }}>
                          {L('Remove', 'ลบ')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {productSearchOpen && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginTop: 8, background: '#fff' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      placeholder={L('Search by SKU or name', 'ค้นหา SKU หรือชื่อ')}
                      value={productSearchTerm}
                      onChange={e => setProductSearchTerm(e.target.value)}
                      className={styles.formInput}
                    />
                    <button type="button" onClick={searchProducts} className={styles.btnOutline}>
                      {L('Search', 'ค้นหา')}
                    </button>
                  </div>
                  <div style={{ maxHeight: 220, overflow: 'auto' }}>
                    {productSearchResults.map((p: any, idx: number) => (
                      <div key={idx} style={{ padding: 8, borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => selectProduct(p)}>
                        <div style={{ fontWeight: 700 }}>{p.name} <span style={{ fontSize: 12, color: '#666' }}>[{p.sku}]</span></div>
                        <div style={{ fontSize: 12, color: '#666' }}>{p.description}</div>
                        <div style={{ fontSize: 13, color: '#255899', marginTop: 4, fontWeight: 600 }}>{Number(p.price || 0).toFixed(2)} ฿</div>
                      </div>
                    ))}
                    {productSearchResults.length === 0 && <div style={{ color: '#666', padding: 8 }}>{L('No products found', 'ไม่พบสินค้า')}</div>}
                  </div>
                </div>
              )}

              <button type="button" onClick={addItem} className={styles.btnOutline} style={{ marginTop: 8 }}>
                + {L('Add Item', 'เพิ่มรายการ')}
              </button>
            </div>

            {/* Discount & Summary */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Discount (%)', 'ส่วนลด (%)')}</label>
                <input type="number" min={0} max={100} value={discount} onChange={e => setDiscount(Number(e.target.value))} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('VAT (%)', 'ภาษีมูลค่าเพิ่ม (%)')}</label>
                <input type="number" min={0} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className={styles.formInput} />
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', minWidth: '280px' }}>
                <div style={{ fontWeight: 700, marginBottom: '8px' }}>{L('Summary', 'สรุปยอด')}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 14 }}>
                  <span>{L('Subtotal', 'ยอดรวมย่อย')}:</span>
                  <span>{totals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 14 }}>
                  <span>{L('Discount', 'ส่วนลด')} ({discount}%):</span>
                  <span>-{((totals.subtotal * Number(discount || 0)) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 14 }}>
                  <span>{L('Tax', 'ภาษี')}:</span>
                  <span>{totals.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                  <span>{L('Total', 'รวม')}:</span>
                  <span style={{ color: '#255899' }}>{totals.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span>
                </div>
              </div>
            </div>

            {errors.length > 0 && (
              <div style={{ marginTop: 12, padding: 12, background: '#fee2e2', borderRadius: 8, color: '#b91c1c' }}>
                {errors.map((er, idx) => <div key={idx}>{er}</div>)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '14px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                  </svg>
                  {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save Quotation', 'บันทึกใบเสนอราคา')}
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomer({ name: '', phone: '', address: '' })
                    setItems([{ desc: '', qty: 1, price: 0 }])
                    setDiscount(0)
                    setErrors([])
                  }}
                  className={`${styles.btn} ${styles.btnOutline}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  {L('Reset', 'ล้าง')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Pre-installation Modal */}
      {showPreInstallModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '90%', maxWidth: 600, maxHeight: '80vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{L('Select Pre-installation Form', 'เลือกแบบฟอร์มก่อนติดตั้ง')}</h3>
              <button onClick={() => setShowPreInstallModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <div style={{ padding: 16, maxHeight: 'calc(80vh - 120px)', overflow: 'auto' }}>
              {preInstallLoading ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>{L('Loading...', 'กำลังโหลด...')}</div>
              ) : preInstallList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>{L('No pre-installation forms found', 'ไม่พบแบบฟอร์มก่อนติดตั้ง')}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {preInstallList.map((form, idx) => (
                    <div
                      key={form.formID || idx}
                      onClick={() => selectPreInstall(form)}
                      style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.borderColor = '#0ea5e9' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                    >
                      <div style={{ fontWeight: 600, color: '#0369a1' }}>{form.pre_install_no || form.formNo || `PRE-${String(form.formID).padStart(6, '0')}`}</div>
                      <div style={{ fontSize: 14, color: '#64748b' }}>{form.customer_name || form.site_address || '-'}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        {form.customer_phone ? `📞 ${form.customer_phone}` : ''}
                        {form.customer_phone && form.created_at ? ' • ' : ''}
                        {form.created_at ? new Date(form.created_at).toLocaleDateString('th-TH') : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Power Calculator Modal */}
      {showPowerCalcModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '90%', maxWidth: 600, maxHeight: '80vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{L('Select Power Calculation', 'เลือกใบคำนวณพลังงาน')}</h3>
              <button onClick={() => setShowPowerCalcModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <div style={{ padding: 16, maxHeight: 'calc(80vh - 120px)', overflow: 'auto' }}>
              {powerCalcLoading ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>{L('Loading...', 'กำลังโหลด...')}</div>
              ) : powerCalcList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>{L('No power calculations found', 'ไม่พบใบคำนวณพลังงาน')}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {powerCalcList.map((calc, idx) => (
                    <div
                      key={calc.calcID || idx}
                      onClick={() => selectPowerCalc(calc)}
                      style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fffbeb'; e.currentTarget.style.borderColor = '#f59e0b' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                    >
                      <div style={{ fontWeight: 600, color: '#d97706' }}>{calc.power_calcuNo || calc.calcNo || `CALC-${String(calc.calcID).padStart(6, '0')}`}</div>
                      <div style={{ fontSize: 14, color: '#64748b' }}>{calc.customer_name || calc.company_name || '-'}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        {calc.product_price ? `💰 ${Number(calc.product_price).toLocaleString()} ฿` : ''}
                        {calc.product_price && calc.avg_monthly_usage ? ' • ' : ''}
                        {calc.avg_monthly_usage ? `⚡ ${calc.avg_monthly_usage} kWh/เดือน` : ''}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{calc.created_at ? new Date(calc.created_at).toLocaleDateString('th-TH') : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
