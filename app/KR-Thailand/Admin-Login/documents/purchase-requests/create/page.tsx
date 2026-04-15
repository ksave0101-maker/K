"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

type ItemType = {
  product_code: string
  product_name: string
  quantity: number
  unit: string
  estimated_price: number
}

export default function CreatePurchaseRequestPage() {
  const router = useRouter()

  const [prNo, setPrNo] = useState('')
  const [prDate, setPrDate] = useState(() => new Date().toISOString().split('T')[0])
  const [generatingPrNo, setGeneratingPrNo] = useState(false)
  const [requesterName, setRequesterName] = useState('')
  const [department, setDepartment] = useState('')
  const [purpose, setPurpose] = useState('')
  const [requiredDate, setRequiredDate] = useState('')
  const [notes, setNotes] = useState('')

  const [items, setItems] = useState<ItemType[]>([{ product_code: '', product_name: '', quantity: 1, unit: 'pcs', estimated_price: 0 }])
  const [totalCost, setTotalCost] = useState(0)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [locale, setLocale] = useState<'en'|'th'>('th')
  const [mounted, setMounted] = useState(false)

  // Supplier and product selection
  const [supplierId, setSupplierId] = useState<number | undefined>()
  const [supplierName, setSupplierName] = useState('')
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [showSupplierList, setShowSupplierList] = useState(false)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  useEffect(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l as 'en'|'th')
    } catch {}

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

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.estimated_price), 0)
    setTotalCost(total)
  }, [items])

  // Generate PR number
  const generatePRNumber = async () => {
    setGeneratingPrNo(true)
    try {
      const res = await fetch('/api/documents/generate-pr-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.success && data.prNo) {
        setPrNo(data.prNo)
        console.log('✅ Generated PR number:', data.prNo)
      } else {
        const errorMsg = L('Failed to generate PR number: ', 'ไม่สามารถสร้างเลขที่ PR: ') + (data.error || 'Unknown error')
        console.error(errorMsg)
        alert(errorMsg)
        // ลองสร้างรูปแบบที่ถูกต้องด้วย Date
        const now = new Date()
        const yyyy = now.getFullYear()
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const dd = String(now.getDate()).padStart(2, '0')
        const fallbackNo = `PR-${yyyy}${mm}${dd}-TEMP`
        setPrNo(fallbackNo)
      }
    } catch (err: any) {
      const errorMsg = L('Error generating PR number: ', 'เกิดข้อผิดพลาดในการสร้างเลขที่ PR: ') + (err.message || String(err))
      console.error(errorMsg, err)
      alert(errorMsg)
      // ลองสร้างรูปแบบที่ถูกต้องด้วย Date
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const fallbackNo = `PR-${yyyy}${mm}${dd}-TEMP`
      setPrNo(fallbackNo)
    } finally {
      setGeneratingPrNo(false)
    }
  }

  // Load all suppliers on mount and generate PR number
  useEffect(() => {
    setMounted(true)

    async function loadAllSuppliers() {
      try {
        const res = await fetch('/api/accounting/suppliers')
        const data = await res.json()
        if (data.ok && data.data) {
          setSuppliers(data.data)
        }
      } catch (err) {
        console.error('Failed to load suppliers:', err)
      }
    }
    loadAllSuppliers()
    generatePRNumber()
  }, [])

  function addItem() {
    setItems([...items, { product_code: '', product_name: '', quantity: 1, unit: 'pcs', estimated_price: 0 }])
  }

  function updateItem(i: number, key: keyof ItemType, value: any) {
    const copy = [...items]
    if (key === 'product_code' || key === 'product_name' || key === 'unit') {
      copy[i][key] = value
    } else {
      copy[i][key] = Number(value)
    }
    setItems(copy)
  }

  function removeItem(i: number) {
    if (items.length === 1) return
    setItems(items.filter((_, idx) => idx !== i))
  }

  // Load products from supplier
  async function handleLoadProducts() {
    if (!supplierId) {
      alert(L('Please select a supplier first', 'กรุณาเลือกซัพพลายเออร์ก่อน'))
      return
    }

    setLoadingProducts(true)
    try {
      const res = await fetch(`/api/accounting/products?supplier_id=${supplierId}`)
      const data = await res.json()

      if (data.ok && data.products) {
        setAvailableProducts(data.products)
        setShowProductDialog(true)
        setSelectedProducts([])
      } else {
        alert(L('Failed to load products', 'โหลดสินค้าไม่สำเร็จ'))
      }
    } catch (err) {
      console.error(err)
      alert(L('Error loading products', 'เกิดข้อผิดพลาดในการโหลดสินค้า'))
    } finally {
      setLoadingProducts(false)
    }
  }

  // Add selected products to items list
  function handleAddSelectedProducts() {
    const productsToAdd = availableProducts.filter((_, idx) => selectedProducts.includes(idx))

    const newItems = productsToAdd.map(product => ({
      product_code: product.code || '',
      product_name: product.name_th || product.name_en || '',
      quantity: 1,
      unit: product.unit || 'pcs',
      estimated_price: product.cost_price || 0
    }))

    // Replace first empty item or append
    if (items.length === 1 && !items[0].product_name) {
      setItems(newItems)
    } else {
      setItems([...items, ...newItems])
    }

    setShowProductDialog(false)
    setSelectedProducts([])
  }

  // Toggle product selection
  function toggleProductSelection(idx: number) {
    if (selectedProducts.includes(idx)) {
      setSelectedProducts(selectedProducts.filter(i => i !== idx))
    } else {
      setSelectedProducts([...selectedProducts, idx])
    }
  }

  function validate() {
    const errs: string[] = []

    if (!requesterName) errs.push(L('Requester name is required', 'กรุณาระบุชื่อผู้ขอซื้อ'))
    if (!department) errs.push(L('Department is required', 'กรุณาระบุแผนก'))
    if (!requiredDate) errs.push(L('Required date is required', 'กรุณาระบุวันที่ต้องการ'))
    if (!purpose.trim()) errs.push(L('Reason and necessity for purchase is required', 'กรุณาระบุเหตุผลการขอซื้อและความจำเป็น'))

    if (requiredDate && new Date(requiredDate) < new Date(prDate)) {
      errs.push(L('Required date must be >= request date', 'วันที่ต้องการต้อง >= วันที่ขอซื้อ'))
    }

    if (items.length === 0) errs.push(L('At least 1 item required', 'ต้องมีอย่างน้อย 1 รายการ'))

    items.forEach((item, idx) => {
      if (!item.product_name) errs.push(L(`Item ${idx + 1} needs product name`, `รายการที่ ${idx + 1} ต้องมีชื่อสินค้า`))
      if (item.quantity <= 0) errs.push(L(`Item ${idx + 1} quantity must be > 0`, `รายการที่ ${idx + 1} จำนวนต้อง > 0`))
    })

    setErrors(errs)
    return errs.length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('k_system_admin_user') || '{}')
      const created_by = user?.username || user?.name || 'system'

      const payload = {
        prDate,
        requester_name: requesterName,
        requested_by: requesterName,
        department,
        purpose,
        required_date: requiredDate,
        supplier_id: supplierId,
        supplier_name: supplierName,
        items: items.map(item => ({
          product_code: item.product_code,
          product_name: item.product_name,
          quantity: item.quantity,
          unit: item.unit,
          estimated_price: item.estimated_price,
          total_price: item.quantity * item.estimated_price
        })),
        notes,
        branch: 'thailand',
        created_by
      }

      const res = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Purchase request created successfully', 'สร้างใบขอซื้อสำเร็จ') })
        setTimeout(() => router.push('/KR-Thailand/Admin-Login/documents/purchase-requests'), 900)
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

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <AdminLayout title="Create Purchase Request" titleTh="สร้างใบขอซื้อ">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, color: '#6b7280' }}>กำลังโหลด...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Create Purchase Request" titleTh="สร้างใบขอซื้อ">
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            {L('Create Purchase Request', 'สร้างใบขอซื้อ')}
          </h2>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('PR No.', 'เลขที่ PR')}</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    value={generatingPrNo ? L('Generating...', 'กำลังสร้าง...') : (prNo || L('Loading...', 'กำลังโหลด...'))}
                    disabled
                    className={styles.formInput}
                    style={{ background: '#f5f5f5', flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={generatePRNumber}
                    disabled={generatingPrNo}
                    style={{
                      padding: '8px 16px',
                      background: generatingPrNo ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: generatingPrNo ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    onMouseEnter={(e) => {
                      if (!generatingPrNo) e.currentTarget.style.background = '#2563eb'
                    }}
                    onMouseLeave={(e) => {
                      if (!generatingPrNo) e.currentTarget.style.background = '#3b82f6'
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{generatingPrNo ? '⏳' : '🔄'}</span>
                    <span>{L('Refresh', 'รันใหม่')}</span>
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input type="date" value={prDate} readOnly className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Requester Name', 'ชื่อผู้ขอซื้อ')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={requesterName} onChange={e => setRequesterName(e.target.value)} className={styles.formInput} placeholder={L('Enter requester name', 'กรอกชื่อผู้ขอซื้อ')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Department', 'แผนก')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className={styles.formInput} placeholder={L('Enter department', 'กรอกแผนก')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Required Date', 'วันที่ต้องการ')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="date" value={requiredDate} onChange={e => setRequiredDate(e.target.value)} className={styles.formInput} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Reason and Necessity for Purchase', 'เหตุผลการขอซื้อและความจำเป็น')} <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                className={styles.formInput}
                rows={3}
                placeholder={L('Please explain the reason and business necessity for this purchase', 'กรุณาระบุเหตุผลการขอซื้อและความจำเป็นของการใช้งาน')}
              />
            </div>

            {/* Supplier Selection */}
            <div style={{ marginTop: 20, padding: 16, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', position: 'relative' }}>
                  <label className={styles.formLabel} style={{ marginBottom: 6 }}>{L('Supplier', 'ซัพพลายเออร์')}</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => {
                      const search = e.target.value
                      setSupplierName(search)

                      // Clear selection if input is cleared
                      if (!search) {
                        setSupplierId(undefined)
                      }

                      // Show list when typing
                      setShowSupplierList(true)
                    }}
                    onFocus={() => {
                      // Show supplier list immediately when focused
                      setShowSupplierList(true)
                    }}
                    onBlur={() => {
                      // Delay hiding to allow click on dropdown
                      setTimeout(() => setShowSupplierList(false), 200)
                    }}
                    className={styles.formInput}
                    placeholder={L('Click to select supplier...', 'คลิกเพื่อเลือกซัพพลายเออร์...')}
                  />

                  {/* Supplier Dropdown */}
                  {showSupplierList && (() => {
                    // Filter suppliers based on search text
                    const filtered = suppliers.filter(s => {
                      if (!supplierName) return true
                      const searchLower = supplierName.toLowerCase()
                      const nameTh = (s.name_th || '').toLowerCase()
                      const nameEn = (s.name_en || '').toLowerCase()
                      const taxId = (s.tax_id || '').toLowerCase()
                      const code = (s.code || '').toLowerCase()
                      return nameTh.includes(searchLower) ||
                             nameEn.includes(searchLower) ||
                             taxId.includes(searchLower) ||
                             code.includes(searchLower)
                    }).slice(0, 15) // Limit to 15 results

                    if (filtered.length === 0) return null

                    return (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        marginTop: 4,
                        maxHeight: 300,
                        overflowY: 'auto',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        zIndex: 100
                      }}>
                        {filtered.map((supplier) => (
                          <div
                            key={supplier.id}
                            onClick={() => {
                              setSupplierId(supplier.id)
                              setSupplierName(supplier.name_th || supplier.name_en || '')
                              setShowSupplierList(false)
                            }}
                            style={{
                              padding: '10px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f3f4f6',
                              fontSize: 14
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                          >
                            <div style={{ fontWeight: 600 }}>{supplier.name_th || supplier.name_en}</div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, display: 'flex', gap: 12 }}>
                              {supplier.code && <span>{L('Code:', 'รหัส:')} {supplier.code}</span>}
                              {supplier.tax_id && <span>{L('Tax ID:', 'เลขผู้เสียภาษี:')} {supplier.tax_id}</span>}
                            </div>
                            {supplier.product_type && (
                              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                                {supplier.product_type}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
                <button
                  type="button"
                  onClick={handleLoadProducts}
                  disabled={!supplierId || loadingProducts}
                  className={styles.btnPrimary}
                  style={{
                    padding: '10px 20px',
                    opacity: (!supplierId || loadingProducts) ? 0.5 : 1,
                    cursor: (!supplierId || loadingProducts) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loadingProducts ? L('Loading...', 'กำลังโหลด...') : L('🔍 Load Products', '🔍 ดึงข้อมูลสินค้า')}
                </button>
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: '#0369a1' }}>
                💡 {L('Select a supplier to load their products', 'เลือกซัพพลายเออร์เพื่อดึงรายการสินค้า')}
              </div>
            </div>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>{L('Items', 'รายการสินค้า')}</h3>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>{L('Product Code', 'รหัสสินค้า')}</th>
                    <th style={{ width: '30%' }}>{L('Product Name', 'ชื่อสินค้า')}</th>
                    <th style={{ width: '12%' }}>{L('Quantity', 'จำนวน')}</th>
                    <th style={{ width: '10%' }}>{L('Unit', 'หน่วย')}</th>
                    <th style={{ width: '13%' }}>{L('Est. Price', 'ราคาประมาณ')}</th>
                    <th style={{ width: '15%' }}>{L('Total', 'รวม')}</th>
                    <th style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td><input type="text" value={item.product_code} onChange={e => updateItem(i, 'product_code', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="text" value={item.product_name} onChange={e => updateItem(i, 'product_name', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className={styles.formInput} min="0.01" step="0.01" style={{ width: '100%' }} /></td>
                      <td><input type="text" value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="number" value={item.estimated_price} onChange={e => updateItem(i, 'estimated_price', e.target.value)} className={styles.formInput} min="0" step="0.01" style={{ width: '100%' }} /></td>
                      <td style={{ textAlign: 'right', padding: '14px 16px' }}>{(item.quantity * item.estimated_price).toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1} className={styles.btnDanger} style={{ padding: '6px 12px', fontSize: '14px' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addItem} className={styles.btnSecondary} style={{ marginTop: 10 }}>+ {L('Add Item', 'เพิ่มรายการ')}</button>

            <div style={{ marginTop: 20, padding: 15, background: '#f9fafb', borderRadius: 8, textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {L('Total Estimated Cost', 'ราคาประมาณการรวม')}: <span style={{ fontSize: 18, color: '#0ea5e9' }}>{totalCost.toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: 20 }}>
              <label className={styles.formLabel}>{L('Supplier Comparison Information', 'ข้อมูลการเปรียบเทียบซัพพลายเออร์')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={styles.formInput}
                rows={3}
                placeholder={L(
                  'Please provide supplier comparison details from multiple companies',
                  'ระบุข้อมูลการเปรียบเทียบ เช็คซัพพลายเออ หลายๆ บริษัท'
                )}
              />
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

      {/* Product Selection Dialog */}
      {showProductDialog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            maxWidth: 900,
            width: '100%',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
          }}>
            {/* Dialog Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              borderRadius: '12px 12px 0 0',
              color: '#fff'
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {L('Select Products', 'เลือกสินค้า')} ({availableProducts.length} {L('items', 'รายการ')})
              </h3>
              <button
                onClick={() => setShowProductDialog(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 24,
                  cursor: 'pointer',
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >×</button>
            </div>

            {/* Dialog Body */}
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
              {availableProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                  {L('No products found', 'ไม่พบสินค้า')}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {availableProducts.map((product, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleProductSelection(idx)}
                      style={{
                        padding: 12,
                        border: selectedProducts.includes(idx) ? '2px solid #0ea5e9' : '1px solid #e5e7eb',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: selectedProducts.includes(idx) ? '#f0f9ff' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(idx)}
                        onChange={() => {}}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {product.name_th || product.name_en}
                        </div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>
                          {L('Code:', 'รหัส:')} {product.code} | {L('Unit:', 'หน่วย:')} {product.unit} | {L('Price:', 'ราคา:')} {product.cost_price?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <button
                onClick={() => setShowProductDialog(false)}
                className={styles.btnOutline}
              >
                {L('Cancel', 'ยกเลิก')}
              </button>
              <button
                onClick={handleAddSelectedProducts}
                disabled={selectedProducts.length === 0}
                className={styles.btnPrimary}
                style={{ opacity: selectedProducts.length === 0 ? 0.5 : 1 }}
              >
                {L('Add Selected', 'เพิ่มที่เลือก')} ({selectedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
