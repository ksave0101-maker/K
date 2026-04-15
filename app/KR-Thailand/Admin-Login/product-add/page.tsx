"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type FormState = {
  sku: string
  name: string
  description: string
  capacity_kva: string
  mcb: string
  size: string
  weight: string
  price: string
  unit: string
  category: string
  stock_qty: string
  is_active: boolean
}

export default function ProductAddPage() {
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

  const [form, setForm] = useState<FormState>({
    sku: '',
    name: '',
    description: '',
    capacity_kva: '',
    mcb: '',
    size: '',
    weight: '',
    price: '',
    unit: 'ชิ้น',
    category: '',
    stock_qty: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [skuStatus, setSkuStatus] = useState<'unchecked'|'checking'|'unique'|'duplicate'>('unchecked')

  // Auto-generate SKU from name
  const generateSku = async () => {
    // Generate SKU in PRD-0001 format by finding existing PRD-xxxx SKUs and incrementing
    try {
      const res = await fetch('/api/products?q=PRD-')
      const j = await res.json().catch(() => null)
      let nextNum = 1
      if (j && j.success && Array.isArray(j.products)) {
        const nums = j.products.map((p: any) => {
          const s = (p.sku || '').toString().toUpperCase()
          const m = s.match(/^PRD-(\d{1,})$/)
          return m ? Number(m[1]) : 0
        }).filter((n: number) => n > 0)
        if (nums.length > 0) {
          nextNum = Math.max(...nums) + 1
        }
      }
      const sku = `PRD-${String(nextNum).padStart(4, '0')}`
      setForm(prev => ({ ...prev, sku }))
      setSkuStatus('unchecked')
      return sku
    } catch (err) {
      console.error('generateSku error', err)
      // fallback simple SKU
      const fallback = `PRD-${Date.now().toString().slice(-4)}`
      setForm(prev => ({ ...prev, sku: fallback }))
      setSkuStatus('unchecked')
      return fallback
    }
  }

  // Ensure PRD- numbers are displayed with 4 digits (PRD-0001)
  const formatSku = (val: string) => {
    if (!val) return val
    const s = val.toString().trim().toUpperCase()
    const m = s.match(/^PRD-(\d+)$/i)
    if (m) return `PRD-${String(Number(m[1])).padStart(4, '0')}`
    return s
  }

  // Check SKU uniqueness against the database via /api/products?q=SKU
  const checkSkuUnique = async (skuToCheck?: string) => {
    const skuVal = skuToCheck || form.sku
    if (!skuVal) {
      alert(L('Please enter or generate an SKU first', 'กรุณากรอกรหัสหรือกดสร้างรหัสก่อน'))
      return
    }
    try {
      setSkuStatus('checking')
      const res = await fetch(`/api/products?q=${encodeURIComponent(skuVal)}`)
      const j = await res.json()
      if (!j || !j.success) {
        // If API error, treat as unchecked
        setSkuStatus('unchecked')
        alert(L('Unable to verify SKU at this time', 'ไม่สามารถตรวจสอบรหัสสินค้าในขณะนี้'))
        return
      }
      const products = j.products || []
      const found = products.find((p: any) => (p.sku || '').toUpperCase() === skuVal.toUpperCase())
      if (found) {
        setSkuStatus('duplicate')
        alert(L('SKU already exists. Choose a different code.', 'รหัสสินค้าอยู่ในระบบแล้ว กรุณาเลือกหรือตั้งค่ารหัสอื่น'))
      } else {
        setSkuStatus('unique')
        alert(L('SKU is available', 'รหัสสินค้าสามารถใช้งานได้'))
      }
    } catch (err) {
      console.error('SKU check error', err)
      setSkuStatus('unchecked')
      alert(L('Error checking SKU', 'เกิดข้อผิดพลาดขณะตรวจสอบรหัส'))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm(prev => ({ ...prev, [name]: checked }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        sku: form.sku || null,
        name: form.name,
        description: form.description || null,
        capacity_kva: form.capacity_kva ? Number(form.capacity_kva) : null,
        mcb: form.mcb || null,
        size: form.size || null,
        weight: form.weight || null,
        price: Number(form.price) || 0,
        unit: form.unit || 'ชิ้น',
        category: form.category || null,
        stock_qty: Number(form.stock_qty) || 0,
        is_active: form.is_active ? 1 : 0
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const j = await res.json()
        if (j && j.success) {
        alert(L('Product added successfully', 'เพิ่มสินค้าสำเร็จ'))
        // Navigate to products listing after save
        router.push('/KR-Thailand/Admin-Login/products')
      } else {
        alert(L('Error:', 'เกิดข้อผิดพลาด:') + ' ' + (j && j.error ? j.error : ''))
      }
    } catch (err) {
      console.error(err)
      alert(L('Server communication error', 'เกิดข้อผิดพลาดขณะติดต่อเซิร์ฟเวอร์'))
    } finally {
      setLoading(false)
    }
  }

  // Price including VAT (7%) for display
  const priceWithVat = (() => {
    const p = Number(form.price)
    if (!p || isNaN(p)) return ''
    return (p * 1.07).toFixed(2)
  })()

  // helpers: format/unformat numbers with thousand separators
  const unformatNumber = (v: string) => {
    if (v === undefined || v === null) return ''
    return String(v).toString().replace(/,/g, '')
  }

  const formatNumber = (v: string | number) => {
    if (v === undefined || v === null || v === '') return ''
    const s = String(v)
    const cleaned = s.replace(/,/g, '')
    const parts = cleaned.split('.')
    const intPart = parts[0]
    const decPart = parts[1]
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas
  }

  const categories = [
    { value: '', label: L('Select Category', 'เลือกหมวดหมู่') },
    { value: 'เซ็นเซอร์', label: L('Sensor', 'เซ็นเซอร์') },
    { value: 'มิเตอร์', label: L('Meter', 'มิเตอร์') },
    { value: 'PLC', label: 'PLC' },
    { value: 'สายเคเบิล', label: L('Cable', 'สายเคเบิล') },
    { value: 'Power Supply', label: 'Power Supply' },
    { value: 'อุปกรณ์ไฟฟ้า', label: L('Electrical Equipment', 'อุปกรณ์ไฟฟ้า') },
    { value: 'energy save', label: L('Energy Save', 'ประหยัดพลังงาน') },
    { value: 'อื่นๆ', label: L('Other', 'อื่นๆ') }
  ]

  const units = [
    { value: 'ชิ้น', label: L('Piece', 'ชิ้น') },
    { value: 'ตัว', label: L('Unit', 'ตัว') },
    { value: 'เมตร', label: L('Meter', 'เมตร') },
    { value: 'ม้วน', label: L('Roll', 'ม้วน') },
    { value: 'กล่อง', label: L('Box', 'กล่อง') },
    { value: 'ชุด', label: L('Set', 'ชุด') },
    { value: 'แพ็ค', label: L('Pack', 'แพ็ค') }
  ]

  return (
    <AdminLayout title="Add Product" titleTh="เพิ่มสินค้าใหม่">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              {L('Add New Product', 'เพิ่มสินค้าใหม่')}
            </h2>
            <p className={styles.cardSubtitle}>
              {L('Fill in all product information', 'กรอกข้อมูลสินค้าให้ครบถ้วน')}
            </p>
          </div>

          <div style={{ marginLeft: '16px' }}>
            <button
              type="button"
              onClick={() => router.back()}
              className={styles.btnOutline}
              style={{ whiteSpace: 'nowrap' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {L('Back', 'ย้อนกลับ')}
            </button>
          </div>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            {/* SKU & Name Row */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('SKU (Product Code)', 'รหัสสินค้า (SKU)')}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    onBlur={e => setForm(prev => ({ ...prev, sku: formatSku((e.target as HTMLInputElement).value) }))}
                    className={styles.formInput}
                    placeholder={L('e.g. PRD-001', 'เช่น PRD-001')}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      let sku = form.sku
                      if (!sku) sku = (await generateSku()) || ''
                      // after generation/check the SKU
                      await checkSkuUnique(sku)
                    }}
                    className={styles.btnOutline}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {skuStatus === 'checking' ? L('Checking...', 'กำลังตรวจสอบ...') : L('Auto Generate & Check', 'สร้างและตรวจสอบ')}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Product Name', 'ชื่อสินค้า')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                  placeholder={L('Enter product name', 'กรอกชื่อสินค้า')}
                />
              </div>
            </div>

            {/* Description */}
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.formLabel}>
                {L('Description', 'รายละเอียดสินค้า')}
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className={styles.formTextarea}
                rows={3}
                placeholder={L('Enter product description...', 'กรอกรายละเอียดสินค้า...')}
              />
            </div>

            {/* Technical Specifications */}
            <div style={{ marginBottom: 20, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 15, fontWeight: 600 }}>{L('Technical Specifications', 'ข้อมูลเชิงเทคนิค')}</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Capacity (kVA)', 'ความจุ (kVA)')}</label>
                  <input
                    type="text"
                    name="capacity_kva"
                    value={formatNumber(form.capacity_kva)}
                    onChange={e => setForm(prev => ({ ...prev, capacity_kva: unformatNumber((e.target as HTMLInputElement).value) }))}
                    className={styles.formInput}
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('MCB', 'ขนาด MCB')}</label>
                  <input
                    type="text"
                    name="mcb"
                    value={form.mcb}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('e.g. 32A, 63A', 'เช่น 32A, 63A')}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Size (WxLxH) cm.', 'ขนาด (กxยxส) ซม.')}</label>
                  <input
                    type="text"
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('e.g. 30x20x15', 'เช่น 30x20x15')}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Weight', 'น้ำหนัก')}</label>
                  <input
                    type="text"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('kg or g', 'กก. หรือ กรัม')}
                  />
                </div>
              </div>
            </div>

            {/* Price, Unit, Category Row */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Price (THB)', 'ราคา (บาท)')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  name="price"
                  value={formatNumber(form.price)}
                  onChange={e => setForm(prev => ({ ...prev, price: unformatNumber((e.target as HTMLInputElement).value) }))}
                  className={styles.formInput}
                  required
                  placeholder="0.00"
                />
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>{L('Price incl. VAT (7%)', 'ราคารวม VAT 7%')}</label>
                  <input type="text" readOnly value={priceWithVat ? `${formatNumber(priceWithVat)} ฿` : ''} className={styles.formInput} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Unit', 'หน่วย')}
                </label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className={styles.formSelect}
                >
                  {units.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Category', 'หมวดหมู่')}
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={styles.formSelect}
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stock & Active Row */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Stock Quantity', 'จำนวนในสต็อก')}
                </label>
                <input
                  type="text"
                  name="stock_qty"
                  value={formatNumber(form.stock_qty)}
                  onChange={e => setForm(prev => ({ ...prev, stock_qty: unformatNumber((e.target as HTMLInputElement).value) }))}
                  className={styles.formInput}
                  placeholder="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Status', 'สถานะ')}
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: form.is_active ? '#dcfce7' : '#fee2e2',
                  borderRadius: '8px',
                  border: `1px solid ${form.is_active ? '#86efac' : '#fca5a5'}`
                }}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span style={{
                    fontWeight: 500,
                    color: form.is_active ? '#166534' : '#991b1b'
                  }}>
                    {form.is_active
                      ? L('Active (Available for sale)', 'เปิดใช้งาน (พร้อมขาย)')
                      : L('Inactive (Not available)', 'ปิดใช้งาน (ไม่พร้อมขาย)')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '14px',
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #f1f5f9',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <button
                  type="submit"
                  disabled={loading || skuStatus === 'duplicate' || skuStatus === 'checking'}
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 180 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                  </svg>
                  {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save Product', 'บันทึกสินค้า')}
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className={`${styles.btn} ${styles.btnOutline}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  {L('Cancel', 'ยกเลิก')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
