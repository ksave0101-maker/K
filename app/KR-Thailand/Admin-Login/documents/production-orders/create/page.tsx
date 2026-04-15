"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'
import ProductSearchModal from './ProductSearchModal'

type LocaleChangeDetail = string | { locale?: 'en' | 'th' }

type ProductCatalogItem = {
  sku?: string
  name?: string
  unit?: string
  MCB?: string
  Weight?: string
  'Capacity (kVA)'?: string
  'Size (WxLxH) cm.'?: string
}

export default function CreateProductionOrderPage() {
  const router = useRouter()

  const [pdoNo, setPdoNo] = useState('')
  const [refreshingPdoNo, setRefreshingPdoNo] = useState(false)
  const [pdoDate, setPdoDate] = useState(() => new Date().toISOString().split('T')[0])
  const [productCode, setProductCode] = useState('')
  const [productName, setProductName] = useState('')
  const [quantityOrdered, setQuantityOrdered] = useState(1)
  const [unit, setUnit] = useState('pcs')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('normal')
  const [productionLine, setProductionLine] = useState('')
  const [shift, setShift] = useState('morning')
  const [supervisor, setSupervisor] = useState('')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)

  // Sales Order import
  const [showSalesOrderModal, setShowSalesOrderModal] = useState(false)
  const [salesOrderList, setSalesOrderList] = useState<any[]>([])
  const [salesOrderLoading, setSalesOrderLoading] = useState(false)
  const [salesOrderID, setSalesOrderID] = useState<number | null>(null)
  const [importedFromRef, setImportedFromRef] = useState<string>('')
  const [soCustomer, setSoCustomer] = useState<{ name: string; taxId: string; phone: string; address: string; deliveryDate: string } | null>(null)

  const [createdByName, setCreatedByName] = useState('')
  const [locale, setLocale] = useState<'en'|'th'>('th')

  useEffect(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l as 'en'|'th')

      // Load user info - try multiple possible keys and fields
      let userName = ''
      try {
        const userStr = localStorage.getItem('k_system_admin_user') || localStorage.getItem('admin_user') || localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          userName = user?.fullName || user?.name || user?.username || user?.email || ''
        }
      } catch (e) {
        console.error('Error loading user info:', e)
      }

      // If still no name, try to get from other sources
      if (!userName) {
        userName = localStorage.getItem('admin_name') || localStorage.getItem('user_name') || ''
      }

      setCreatedByName(userName || 'Admin')
    } catch {}

    const handler = (e: Event) => {
      const d = (e as CustomEvent<LocaleChangeDetail>).detail
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

  useEffect(() => {
    refreshPdoNo()
  }, [])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  async function refreshPdoNo() {
    setRefreshingPdoNo(true)
    try {
      const res = await fetch('/api/documents/generate-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pdo' })
      })
      const j = await res.json()
      if (res.ok && j.success && j.docNo) {
        setPdoNo(j.docNo)
      } else {
        throw new Error(j.error || 'Failed to generate PDO number')
      }
      setPdoDate(new Date().toISOString().split('T')[0])
    } catch (err) {
      console.error('Failed to get PDO number:', err)
      const now = new Date()
      const yyyy = String(now.getFullYear())
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      setPdoNo(`PDOTH${yyyy}${mm}${dd}-00001`)
    } finally {
      setRefreshingPdoNo(false)
    }
  }

  // Handle product selection from catalog
  function handleProductSelect(product: ProductCatalogItem) {
    setProductCode(product.sku || '')
    setProductName(product.name || '')
    setUnit(product.unit || 'pcs')

    // Add product specs to notes
    const specs = []
    if (product['Capacity (kVA)']) specs.push(`Model: ${product['Capacity (kVA)']}`)
    if (product.MCB) specs.push(`MCB: ${product.MCB}`)
    if (product['Size (WxLxH) cm.']) specs.push(`Size: ${product['Size (WxLxH) cm.']}`)
    if (product.Weight) specs.push(`Weight: ${product.Weight}`)

    if (specs.length > 0) {
      setNotes(specs.join(' | '))
    }
  }

  function validate() {
    const errs: string[] = []

    if (!productName) errs.push(L('Product name is required', 'กรุณาระบุชื่อสินค้า'))
    if (quantityOrdered <= 0) errs.push(L('Quantity ordered must be > 0', 'จำนวนสั่งผลิตต้อง > 0'))
    if (!startDate) errs.push(L('Start date is required', 'กรุณาระบุวันเริ่มต้น'))
    if (!dueDate) errs.push(L('Due date is required', 'กรุณาระบุวันครบกำหนด'))
    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      errs.push(L('Due date must be >= start date', 'วันครบกำหนดต้อง >= วันเริ่มต้น'))
    }
    if (!productionLine) errs.push(L('Production line is required', 'กรุณาระบุสายการผลิต'))
    if (!supervisor) errs.push(L('Supervisor is required', 'กรุณาระบุหัวหน้างาน'))

    setErrors(errs)
    return errs.length === 0
  }

  // Load sales orders list
  async function loadSalesOrderList() {
    setShowSalesOrderModal(true)
    setSalesOrderLoading(true)
    try {
      const res = await fetch('/api/sales-orders?limit=100')
      const j = await res.json()
      if (j && j.success && Array.isArray(j.orders)) {
        setSalesOrderList(j.orders)
      }
    } catch (err) {
      console.error('Failed to load sales orders', err)
    } finally {
      setSalesOrderLoading(false)
    }
  }

  // Select sales order and import data
  async function selectSalesOrder(order: any) {
    try {
      const res = await fetch(`/api/sales-orders?id=${order.orderID}`)
      const j = await res.json()
      if (!res.ok || !j.success) {
        alert(L('Sales order not found', 'ไม่พบใบสั่งขาย'))
        return
      }

      const so = j.order
      const items = so.items || []

      // Import product info from first item (or combine all items)
      if (items.length > 0) {
        const firstItem = items[0]
        setProductCode(firstItem.product_code || firstItem.sku || '')
        setProductName(firstItem.product_name || firstItem.name || '')
        setQuantityOrdered(Number(firstItem.quantity || 1))
        setUnit(firstItem.unit || 'pcs')
      }

      // Set imported reference
      const refNo = so.orderNo || `SO-${String(so.orderID).padStart(6, '0')}`
      setImportedFromRef(L('Sales Order: ', 'ใบสั่งขาย: ') + refNo)
      setSalesOrderID(so.orderID)

      // Store customer info from SO
      setSoCustomer({
        name: so.customer_name || '-',
        taxId: so.customer_tax_id || so.taxId || '-',
        phone: so.customer_phone || so.phone || '-',
        address: so.customer_address || so.address || '-',
        deliveryDate: so.delivery_date || so.deliveryDate || ''
      })

      setShowSalesOrderModal(false)
    } catch (err) {
      console.error(err)
      alert(L('Failed to fetch sales order', 'เกิดข้อผิดพลาดขณะดึงข้อมูลใบสั่งขาย'))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('k_system_admin_user') || '{}')
      const created_by = user?.username || user?.name || 'system'

      const payload = {
        pdoNo,
        pdoDate,
        product_code: productCode,
        product_name: productName,
        quantity_ordered: quantityOrdered,
        unit,
        start_date: startDate,
        due_date: dueDate,
        priority,
        production_line: productionLine,
        shift,
        supervisor,
        notes,
        created_by,
        sales_orderID: salesOrderID
      }

      const res = await fetch('/api/production-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Production order created successfully', 'สร้างใบสั่งผลิตสำเร็จ') })
        setTimeout(() => router.push('/KR-Thailand/Admin-Login/documents/production-orders'), 900)
      } else {
        setMessageBar({ type: 'error', text: L('Failed: ', 'ล้มเหลว: ') + (j.error || 'Unknown error') })
      }
    } catch (err) {
      console.error(err)
      setMessageBar({ type: 'error', text: L('Error occurred', 'เกิดข้อผิดพลาด') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Create Production Order" titleTh="สร้างใบสั่งผลิต">
      {messageBar && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: 8,
          color: messageBar.type === 'error' ? '#7f1d1d' : '#064e3b',
          background: messageBar.type === 'error' ? '#fee2e2' : '#ecfdf5',
          border: messageBar.type === 'error' ? '1px solid #fca5a5' : '1px solid #86efac'
        }}>
          {messageBar.text}
        </div>
      )}

      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            {L('Create Production Order', 'สร้างใบสั่งผลิต')}
          </h2>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('PDO No.', 'เลขที่ PDO')}</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={pdoNo || L('Auto-generated', 'สร้างอัตโนมัติ')}
                    disabled
                    className={styles.formInput}
                    style={{ background: '#f5f5f5' }}
                  />
                  <button
                    type="button"
                    className={`${styles.btnOutline} ${styles.btnRefresh}`}
                    onClick={refreshPdoNo}
                    disabled={refreshingPdoNo || loading}
                  >
                    {refreshingPdoNo ? L('Refreshing...', 'กำลังรีเฟรช...') : L('Refresh', 'รีเฟรช')}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input type="date" value={pdoDate} readOnly className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Created By', 'ผู้สร้าง')}</label>
                <input type="text" value={createdByName} disabled className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
            </div>

            {/* Import from Sales Order */}
            <div style={{ marginBottom: 16, padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#0369a1' }}>{L('Import from:', 'นำเข้าจาก:')}</span>
                <button
                  type="button"
                  className={styles.btnOutline}
                  style={{ padding: '8px 12px' }}
                  onClick={loadSalesOrderList}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                  </svg>
                  {L('Import from Sales Order', 'นำเข้าจากใบสั่งขาย')}
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
              {soCustomer && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#c2410c', marginBottom: 8 }}>
                    {L('Customer Information (from SO)', 'ข้อมูลลูกค้า (จากใบสั่งขาย)')}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 13 }}>
                    <div><span style={{ color: '#78350f', fontWeight: 600 }}>{L('Customer: ', 'ลูกค้า: ')}</span><span>{soCustomer.name}</span></div>
                    <div><span style={{ color: '#78350f', fontWeight: 600 }}>{L('Tax ID: ', 'เลขผู้เสียภาษี: ')}</span><span>{soCustomer.taxId}</span></div>
                    <div><span style={{ color: '#78350f', fontWeight: 600 }}>{L('Phone: ', 'โทรศัพท์: ')}</span><span>{soCustomer.phone}</span></div>
                    {soCustomer.deliveryDate && (
                      <div><span style={{ color: '#78350f', fontWeight: 600 }}>{L('Delivery Date: ', 'วันที่จัดส่ง: ')}</span><span>{new Date(soCustomer.deliveryDate).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}</span></div>
                    )}
                    <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#78350f', fontWeight: 600 }}>{L('Address: ', 'ที่อยู่: ')}</span><span>{soCustomer.address}</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Selection from Catalog */}
            <div style={{ marginTop: 24, marginBottom: 16, padding: 12, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color: '#065f46' }}>
                  🔍 {L('Select product from catalog (model/specs)', 'เลือกสินค้าจากแคตตาล็อก (โมเดล/รุ่น)')}
                </span>
                <button
                  type="button"
                  onClick={() => setShowProductModal(true)}
                  className={styles.btnSecondary}
                  style={{ padding: '8px 16px' }}
                >
                  {L('Search Catalog', 'ค้นหาแคตตาล็อก')}
                </button>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Product Code', 'รหัสสินค้า')}</label>
                <input type="text" value={productCode} onChange={e => setProductCode(e.target.value)} className={styles.formInput} placeholder={L('Product code', 'รหัสสินค้า')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Product Name', 'ชื่อสินค้า')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className={styles.formInput} placeholder={L('Product to produce', 'สินค้าที่จะผลิต')} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Quantity Ordered', 'จำนวนสั่งผลิต')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="number" value={quantityOrdered} onChange={e => setQuantityOrdered(Number(e.target.value))} className={styles.formInput} min="0.01" step="0.01" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Unit', 'หน่วย')}</label>
                <input type="text" value={unit} onChange={e => setUnit(e.target.value)} className={styles.formInput} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Start Date', 'วันเริ่มต้น')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Due Date', 'วันครบกำหนด')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Priority', 'ความสำคัญ')}</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className={styles.formInput}>
                  <option value="low">{L('Low', 'ต่ำ')}</option>
                  <option value="normal">{L('Normal', 'ปกติ')}</option>
                  <option value="high">{L('High', 'สูง')}</option>
                  <option value="urgent">{L('Urgent', 'ด่วน')}</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Production Line', 'สายการผลิต')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={productionLine} onChange={e => setProductionLine(e.target.value)} className={styles.formInput} placeholder={L('Production line name', 'ชื่อสายการผลิต')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Shift', 'กะ')}</label>
                <select value={shift} onChange={e => setShift(e.target.value)} className={styles.formInput}>
                  <option value="morning">{L('Morning', 'เช้า')}</option>
                  <option value="afternoon">{L('Afternoon', 'บ่าย')}</option>
                  <option value="night">{L('Night', 'ดึก')}</option>
                  <option value="all_day">{L('All Day', 'ทั้งวัน')}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Supervisor', 'หัวหน้างาน')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} className={styles.formInput} placeholder={L('Supervisor name', 'ชื่อหัวหน้างาน')} />
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: 30 }}>
              <label className={styles.formLabel}>{L('Notes', 'หมายเหตุ')}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className={styles.formInput} rows={2} placeholder={L('Additional notes...', 'หมายเหตุเพิ่มเติม...')} />
            </div>

            {errors.length > 0 && (
              <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5', color: '#7f1d1d' }}>
                {errors.map((err, idx) => (<div key={idx}>• {err}</div>))}
              </div>
            )}

            <div className={styles.formRow} style={{ justifyContent: 'space-between', marginTop: 30 }}>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
              </button>
              <button type="button" onClick={() => router.back()} className={styles.btnOutline}>{L('Cancel', 'ยกเลิก')}</button>
            </div>
          </form>
        </div>
      </div>

      <ProductSearchModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSelect={handleProductSelect}
        locale={locale}
      />

      {/* Sales Order Import Modal */}
      {showSalesOrderModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', borderRadius: 12, padding: 24,
            maxWidth: 800, width: '90%', maxHeight: '80vh', overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {L('Select Sales Order', 'เลือกใบสั่งขาย')}
              </h3>
              <button
                onClick={() => setShowSalesOrderModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', padding: 4 }}
              >×</button>
            </div>

            {salesOrderLoading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                {L('Loading...', 'กำลังโหลด...')}
              </div>
            ) : salesOrderList.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                {L('No sales orders found', 'ไม่พบใบสั่งขาย')}
              </div>
            ) : (
              <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                        {L('Order No.', 'เลขที่ใบสั่งขาย')}
                      </th>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                        {L('Customer', 'ลูกค้า')}
                      </th>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                        {L('Date', 'วันที่')}
                      </th>
                      <th style={{ padding: 12, textAlign: 'right', borderBottom: '2px solid #ddd' }}>
                        {L('Total', 'ยอดรวม')}
                      </th>
                      <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #ddd' }}>
                        {L('Action', 'เลือก')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesOrderList.map((so: any) => (
                      <tr key={so.orderID} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 12 }}>{so.orderNo}</td>
                        <td style={{ padding: 12 }}>{so.customer_name || '-'}</td>
                        <td style={{ padding: 12 }}>
                          {so.order_date ? new Date(so.order_date).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ padding: 12, textAlign: 'right' }}>
                          {Number(so.priceTotal || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <button
                            onClick={() => selectSalesOrder(so)}
                            className={styles.btnPrimary}
                            style={{ padding: '6px 16px', fontSize: 13 }}
                          >
                            {L('Select', 'เลือก')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
