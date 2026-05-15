"use client"

import React, { useEffect, useState, useRef } from 'react'
import AdminLayout from '../components/AdminLayout'
import CreatedBy from '../components/CreatedBy'
import { useRouter } from 'next/navigation'
import styles from '../admin-theme.module.css'

type Item = {
  desc: string
  qty: number
  unit: string
  remark: string
}

type Customer = {
  name: string
  address: string
  phone: string
  contactPerson: string
}

type Shipping = {
  address: string
  receiverName: string
  receiverPhone: string
}

const COMPANY_INFO = {
  name: 'K Energy Save Co., Ltd.',
  nameTh: 'บริษัท เค เอนเนอร์ยี่ เซฟ จำกัด',
  address: '84 Chaloem Phrakiat Rama 9 Soi 34\nNong Bon, Prawet\nBangkok 10250, Thailand',
  addressTh: '',
  phone: '+66 2 080 8916',
  email: 'info@kenergy-save.com'
}

export default function DeliveryNotePage() {
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  const [deliveryNo, setDeliveryNo] = useState('')
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().split('T')[0])
  const [customer, setCustomer] = useState<Customer>({ name: '', address: '', phone: '', contactPerson: '' })
  const [shipping, setShipping] = useState<Shipping>({ address: '', receiverName: '', receiverPhone: '' })
  const [sameAsCustomer, setSameAsCustomer] = useState(true)
  const [items, setItems] = useState<Item[]>([{ desc: '', qty: 1, unit: 'ชิ้น', remark: '' }])
  const [deliveryPerson, setDeliveryPerson] = useState('')
  const [vehicleNo, setVehicleNo] = useState('')
  const [notes, setNotes] = useState('')
  const [refOrderNo, setRefOrderNo] = useState('')
  const [quoID, setQuoID] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [showQuoModal, setShowQuoModal] = useState(false)
  const [quotations, setQuotations] = useState<any[] | null>(null)
  const [quoSearch, setQuoSearch] = useState('')
  const [quoLoading, setQuoLoading] = useState(false)

  const [locale, setLocale] = useState<'en'|'th'>('th')

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

  useEffect(() => {
    // Load customers list
    ;(async () => {
      try {
        const res = await fetch('/api/customers')
        const j = await res.json()
        if (j && j.success && Array.isArray(j.customers)) {
          setCustomers(j.customers)
        }
      } catch (err) {
        console.error('Failed to load customers:', err)
      }
    })()
  }, [])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  // Load initial delivery note number
  useEffect(() => {
    refreshDeliveryNo()
  }, [])

  const units = [
    { value: 'ชิ้น', label: L('Piece', 'ชิ้น') },
    { value: 'เครื่อง', label: L('Unit', 'เครื่อง') },
    { value: 'ชุด', label: L('Set', 'ชุด') },
    { value: 'กล่อง', label: L('Box', 'กล่อง') },
    { value: 'ลัง', label: L('Crate', 'ลัง') },
    { value: 'ม้วน', label: L('Roll', 'ม้วน') },
    { value: 'แผ่น', label: L('Sheet', 'แผ่น') },
    { value: 'อื่นๆ', label: L('Other', 'อื่นๆ') }
  ]

  function addItem() { setItems([...items, { desc: '', qty: 1, unit: 'ชิ้น', remark: '' }]) }
  function updateItem(i: number, key: keyof Item, value: any) {
    const copy = [...items]
    if (key === 'qty') {
      copy[i][key] = Number(value) || 0
    } else {
      copy[i][key] = value
    }
    setItems(copy)
  }
  function removeItem(i: number) {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== i))
    }
  }

  function fallbackDeliveryNo() {
    const today = new Date()
    const yyyy = String(today.getFullYear())
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    setDeliveryNo(`DN-${yyyy}${mm}${dd}-0001`)
    setDeliveryDate(today.toISOString().split('T')[0])
  }

  async function refreshDeliveryNo() {
    try {
      const res = await fetch('/api/delivery-seq')
      const j = await res.json().catch(() => null)
      if (res.ok && j?.success && j.formatted) {
        setDeliveryNo(j.formatted)
        setDeliveryDate(new Date().toISOString().split('T')[0])
      } else {
        fallbackDeliveryNo()
      }
    } catch {
      fallbackDeliveryNo()
    }
  }

  function handleCustomerSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const cusId = e.target.value
    if (!cusId) {
      setCustomer({ name: '', address: '', phone: '', contactPerson: '' })
      return
    }
    const cus = customers.find(c => String(c.cusID || c.id) === cusId)
    if (cus) {
      setCustomer({
        name: cus.fullname || cus.name || '',
        address: cus.address || '',
        phone: cus.phone || cus.tel || '',
        contactPerson: cus.contact_person || ''
      })
      if (sameAsCustomer) {
        setShipping({
          address: cus.address || '',
          receiverName: cus.fullname || cus.name || '',
          receiverPhone: cus.phone || cus.tel || ''
        })
      }
    }
  }

  useEffect(() => {
    if (sameAsCustomer) {
      setShipping({
        address: customer.address,
        receiverName: customer.contactPerson || customer.name,
        receiverPhone: customer.phone
      })
    }
  }, [sameAsCustomer, customer])

  async function openQuoSearch() {
    setShowQuoModal(true)
    if (quotations !== null) return
    setQuoLoading(true)
    try {
      const res = await fetch('/api/quotations?limit=100')
      const j = await res.json().catch(() => null)
      setQuotations(res.ok && j?.success ? (j.rows || []) : [])
    } catch { setQuotations([]) }
    finally { setQuoLoading(false) }
  }

  function closeQuoSearch() { setShowQuoModal(false); setQuoSearch('') }

  async function selectQuotation(quo: any) {
    setQuoID(quo.quoteID || null)
    setRefOrderNo(quo.quoteNo || '')
    if (quo.customer_name) {
      setCustomer(prev => ({
        ...prev,
        name: quo.customer_name || prev.name,
        phone: quo.customer_phone || prev.phone,
      }))
    }
    if (quo.cusID) {
      try {
        const res = await fetch(`/api/customers?id=${quo.cusID}`)
        const j = await res.json().catch(() => null)
        if (res.ok && j?.success && j.customer) {
          const cu = j.customer
          setCustomer({
            name: cu.fullname || cu.name || quo.customer_name || '',
            address: cu.address || '',
            phone: cu.phone || cu.tel || quo.customer_phone || '',
            contactPerson: cu.contact_person || ''
          })
        }
      } catch { /* use quo data already set */ }
    }
    closeQuoSearch()
  }

  function handleReset() {
    if (!confirm(L('Reset all form fields?', 'ล้างข้อมูลทั้งหมดเพื่อกรอกใหม่?'))) return
    setDeliveryNo('')
    setDeliveryDate(new Date().toISOString().split('T')[0])
    setCustomer({ name: '', address: '', phone: '', contactPerson: '' })
    setShipping({ address: '', receiverName: '', receiverPhone: '' })
    setSameAsCustomer(true)
    setItems([{ desc: '', qty: 1, unit: 'ชิ้น', remark: '' }])
    setDeliveryPerson('')
    setVehicleNo('')
    setNotes('')
    setRefOrderNo('')
    setQuoID(null)
    refreshDeliveryNo()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!deliveryNo) {
      alert(L('Please generate Delivery Note number', 'กรุณาสร้างเลขที่ใบจัดส่ง'))
      return
    }
    if (!quoID) {
      alert(L('Please select a Quotation', 'กรุณาเลือกใบเสนอราคาก่อนบันทึก'))
      return
    }
    if (!customer.name) {
      alert(L('Please select or enter customer', 'กรุณาเลือกหรือกรอกข้อมูลลูกค้า'))
      return
    }
    setLoading(true)
    try {
      const userRaw = typeof window !== 'undefined' ? localStorage.getItem('k_system_admin_user') : null
      let createdBy = 'thailand admin'
      try { if (userRaw) { const u = JSON.parse(userRaw); createdBy = u?.name || u?.fullname || u?.username || String(u?.userId || createdBy) } } catch(_) {}

      const payload = {
        deliveryNo,
        deliveryDate,
        customer,
        shipping,
        items,
        deliveryPerson,
        vehicleNo,
        notes,
        refOrderNo,
        quoID: quoID || null,
        created_by: createdBy
      }

      const res = await fetch('/api/delivery-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const j = await res.json().catch(() => null)
      if (!res.ok || !j || !j.success) {
        console.error('Failed to save delivery note', j)
        alert(L('Failed to save delivery note', 'ไม่สามารถบันทึกใบจัดส่งได้'))
        setLoading(false)
        return
      }

      alert(L('Delivery note saved', 'บันทึกใบจัดส่งสำเร็จ'))
      router.push('/KR-Thailand/Admin-Login/delivery-note/list')
    } catch (err) {
      console.error('Save error', err)
      alert(L('Failed to save delivery note', 'ไม่สามารถบันทึกใบจัดส่งได้'))
    } finally {
      setLoading(false)
    }
  }

  const shippingAddress = sameAsCustomer ? customer.address : shipping.address
  const receiverName = sameAsCustomer ? (customer.contactPerson || customer.name) : shipping.receiverName
  const receiverPhone = sameAsCustomer ? customer.phone : shipping.receiverPhone

  return (
    <AdminLayout title="Installation & Delivery" titleTh="ติดตั้งและจัดส่ง">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            {L('Installation & Delivery', 'ติดตั้งและจัดส่ง')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Installation and delivery of products', 'การติดตั้งและจัดส่งสินค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <CreatedBy />
          <form onSubmit={handleSave}>
            {/* Delivery Note Number & Date */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Delivery Note No.', 'เลขที่ใบจัดส่ง')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={deliveryNo}
                    onChange={e => setDeliveryNo(e.target.value)}
                    className={styles.formInput}
                    placeholder="DN-20260124-0001"
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="button" className={styles.btnOutline} onClick={refreshDeliveryNo}>
                    {L('Refresh', 'รีเฟรช')}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Delivery Date', 'วันที่จัดส่ง')}</label>
                <input
                  type="date"
                  value={deliveryDate}
                  readOnly
                  title={L('Fixed to today', 'ตั้งเป็นวันที่ปัจจุบัน')}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Ref. Quotation', 'อ้างอิงใบเสนอราคา')} <span style={{ color: '#dc2626' }}>*</span></label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={refOrderNo}
                    readOnly
                    className={styles.formInput}
                    placeholder={L('Select a quotation...', 'เลือกใบเสนอราคา...')}
                    style={{ flex: 1, background: '#f9fafb', cursor: 'pointer', borderColor: !quoID ? '#fca5a5' : undefined }}
                    onClick={openQuoSearch}
                  />
                  {quoID && (
                    <button type="button" onClick={() => { setQuoID(null); setRefOrderNo('') }}
                      style={{ padding: '6px 10px', background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', color: '#6b7280', fontSize: 14 }}>✕</button>
                  )}
                  <button type="button" className={styles.btnOutline} onClick={openQuoSearch}>
                    {L('Search', 'ค้นหา')}
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Selection */}
            <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>
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
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    className={styles.formInput}
                    placeholder={L('Customer name', 'ชื่อลูกค้า')}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Contact Person', 'ผู้ติดต่อ')}</label>
                  <input
                    value={customer.contactPerson}
                    onChange={e => setCustomer({ ...customer, contactPerson: e.target.value })}
                    className={styles.formInput}
                    placeholder={L('Contact person name', 'ชื่อผู้ติดต่อ')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Phone', 'โทรศัพท์')}</label>
                  <input
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    className={styles.formInput}
                    placeholder="02-080-8916"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label className={styles.formLabel}>{L('Address', 'ที่อยู่')}</label>
                  <input
                    value={customer.address}
                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    className={styles.formInput}
                    placeholder={L('Customer address', 'ที่อยู่ลูกค้า')}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div style={{ marginTop: 16, padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                  {L('Shipping Address', 'ที่อยู่จัดส่ง')}
                </h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sameAsCustomer}
                    onChange={e => setSameAsCustomer(e.target.checked)}
                  />
                  <span style={{ fontSize: 14 }}>{L('Same as customer address', 'เหมือนที่อยู่ลูกค้า')}</span>
                </label>
              </div>
              {!sameAsCustomer && (
                <>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{L('Receiver Name', 'ชื่อผู้รับ')}</label>
                      <input
                        value={shipping.receiverName}
                        onChange={e => setShipping({ ...shipping, receiverName: e.target.value })}
                        className={styles.formInput}
                        placeholder={L('Receiver name', 'ชื่อผู้รับสินค้า')}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{L('Receiver Phone', 'เบอร์ผู้รับ')}</label>
                      <input
                        value={shipping.receiverPhone}
                        onChange={e => setShipping({ ...shipping, receiverPhone: e.target.value })}
                        className={styles.formInput}
                        placeholder="08x-xxx-xxxx"
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup} style={{ flex: 2 }}>
                      <label className={styles.formLabel}>{L('Shipping Address', 'ที่อยู่จัดส่ง')}</label>
                      <input
                        value={shipping.address}
                        onChange={e => setShipping({ ...shipping, address: e.target.value })}
                        className={styles.formInput}
                        placeholder={L('Full shipping address', 'ที่อยู่จัดส่งเต็ม')}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Delivery Info */}
            <div style={{ marginTop: 16, padding: 16, background: '#fef3c7', borderRadius: 8 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>
                {L('Delivery Information', 'ข้อมูลการจัดส่ง')}
              </h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Delivery Person', 'ผู้จัดส่ง/คนขับ')}</label>
                  <input
                    value={deliveryPerson}
                    onChange={e => setDeliveryPerson(e.target.value)}
                    className={styles.formInput}
                    placeholder={L('Driver name', 'ชื่อคนขับ/ผู้จัดส่ง')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Vehicle No.', 'ทะเบียนรถ')}</label>
                  <input
                    value={vehicleNo}
                    onChange={e => setVehicleNo(e.target.value)}
                    className={styles.formInput}
                    placeholder={L('License plate', 'ทะเบียนรถ')}
                  />
                </div>
              </div>
            </div>

            {/* Quotation search modal */}
            {showQuoModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <div style={{ width: '90%', maxWidth: 800, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{L('Select Quotation', 'เลือกใบเสนอราคา')}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        placeholder={L('Search by quote no or customer', 'ค้นหาเลขที่หรือชื่อลูกค้า')}
                        value={quoSearch}
                        onChange={e => setQuoSearch(e.target.value)}
                        autoFocus
                        style={{ padding: '7px 12px', width: 280, border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 14 }}
                      />
                      <button onClick={closeQuoSearch} style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 16 }}>✕</button>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflow: 'auto' }}>
                    {quoLoading && <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>{L('Loading...', 'กำลังโหลด...')}</div>}
                    {!quoLoading && quotations && quotations.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>{L('No quotations found', 'ไม่พบใบเสนอราคา')}</div>}
                    {!quoLoading && quotations && quotations.length > 0 && (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>{L('Quote No.', 'เลขที่')}</th>
                            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>{L('Date', 'วันที่')}</th>
                            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>{L('Customer', 'ลูกค้า')}</th>
                            <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>{L('Total', 'ยอดรวม')}</th>
                            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>{L('Status', 'สถานะ')}</th>
                            <th style={{ padding: '10px 14px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {quotations.filter(q => {
                            if (!quoSearch) return true
                            const s = quoSearch.toLowerCase()
                            return String(q.quoteNo || '').toLowerCase().includes(s) || String(q.customer_name || '').toLowerCase().includes(s)
                          }).map((q: any) => (
                            <tr key={q.quoteID} style={{ borderBottom: '1px solid #f3f4f6' }} onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1d4ed8' }}>{q.quoteNo || '-'}</td>
                              <td style={{ padding: '10px 14px' }}>{q.quoteDate ? new Date(q.quoteDate).toLocaleDateString('th-TH') : '-'}</td>
                              <td style={{ padding: '10px 14px' }}>{q.customer_name || '-'}</td>
                              <td style={{ padding: '10px 14px', textAlign: 'right' }}>{Number(q.total || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                              <td style={{ padding: '10px 14px' }}><span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, background: q.status === 'approved' ? '#dcfce7' : '#f1f5f9', color: q.status === 'approved' ? '#166534' : '#64748b' }}>{q.status || 'draft'}</span></td>
                              <td style={{ padding: '10px 14px' }}>
                                <button onClick={() => selectQuotation(q)} className={styles.btn} style={{ padding: '6px 14px', fontSize: 13 }}>{L('Select', 'เลือก')}</button>
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

            {/* Items */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className={styles.formLabel}>{L('Items to Deliver', 'รายการสินค้าที่จัดส่ง')}</label>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>{L('Description', 'รายละเอียด')}</th>
                    <th style={{ width: 100 }}>{L('Qty', 'จำนวน')}</th>
                    <th style={{ width: 120 }}>{L('Unit', 'หน่วย')}</th>
                    <th style={{ width: 200 }}>{L('Remark', 'หมายเหตุ')}</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'center' }}>{i + 1}</td>
                      <td>
                        <input
                          value={it.desc}
                          onChange={e => updateItem(i, 'desc', e.target.value)}
                          className={styles.formInput}
                          placeholder={L('Item description', 'รายละเอียดสินค้า')}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={e => updateItem(i, 'qty', e.target.value)}
                          className={styles.formInput}
                          style={{ textAlign: 'center' }}
                        />
                      </td>
                      <td>
                        <select
                          value={it.unit}
                          onChange={e => updateItem(i, 'unit', e.target.value)}
                          className={styles.formSelect}
                        >
                          {units.map(u => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          value={it.remark}
                          onChange={e => updateItem(i, 'remark', e.target.value)}
                          className={styles.formInput}
                          placeholder={L('Note', 'หมายเหตุ')}
                        />
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
              <button type="button" onClick={addItem} className={styles.btnOutline} style={{ marginTop: 8 }}>
                + {L('Add Item', 'เพิ่มรายการ')}
              </button>
            </div>

            {/* Notes */}
            <div style={{ marginTop: 16 }}>
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
            <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                </svg>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
              </button>
              <button type="button" onClick={handleReset} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                {L('Reset', 'ล้างข้อมูล')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Hidden Print Template */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="delivery-note" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 20, top: 20 }}>
            <img src="/k-energy-save-logo.jpg" alt="K Energy Save" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 4, border: '1px solid #ddd' }} />
          </div>
          <div className="header">
            <h1>{L('DELIVERY NOTE', 'ใบจัดส่งสินค้า')}</h1>
            <div className="company">{locale === 'th' ? COMPANY_INFO.nameTh : COMPANY_INFO.name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{locale === 'th' ? COMPANY_INFO.addressTh : COMPANY_INFO.address}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{L('Phone', 'โทร')}: {COMPANY_INFO.phone}</div>
          </div>

          <div className="doc-info">
            <div>
              <strong>{L('Delivery Note No.', 'เลขที่ใบจัดส่ง')}:</strong> {deliveryNo}
            </div>
            <div>
              <strong>{L('Date', 'วันที่')}:</strong> {deliveryDate}
            </div>
            {refOrderNo && (
              <div>
                <strong>{L('Ref. Order', 'อ้างอิงใบสั่งซื้อ')}:</strong> {refOrderNo}
              </div>
            )}
          </div>

          <div className="info-row">
            <div className="info-box">
              <h3>{L('Customer', 'ลูกค้า')}</h3>
              <p><strong>{customer.name || '-'}</strong></p>
              <p>{customer.address || '-'}</p>
              <p>{L('Phone', 'โทร')}: {customer.phone || '-'}</p>
              {customer.contactPerson && <p>{L('Contact', 'ผู้ติดต่อ')}: {customer.contactPerson}</p>}
            </div>
            <div className="info-box">
              <h3>{L('Ship To', 'จัดส่งถึง')}</h3>
              <p><strong>{receiverName || '-'}</strong></p>
              <p>{shippingAddress || '-'}</p>
              <p>{L('Phone', 'โทร')}: {receiverPhone || '-'}</p>
            </div>
          </div>

          {(deliveryPerson || vehicleNo) && (
            <div style={{ marginBottom: 16, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
              {deliveryPerson && <span><strong>{L('Driver', 'ผู้จัดส่ง')}:</strong> {deliveryPerson} &nbsp;&nbsp;</span>}
              {vehicleNo && <span><strong>{L('Vehicle', 'ทะเบียนรถ')}:</strong> {vehicleNo}</span>}
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th className="text-center" style={{ width: 50 }}>#</th>
                <th>{L('Description', 'รายละเอียด')}</th>
                <th className="text-center" style={{ width: 80 }}>{L('Qty', 'จำนวน')}</th>
                <th className="text-center" style={{ width: 80 }}>{L('Unit', 'หน่วย')}</th>
                <th>{L('Remark', 'หมายเหตุ')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td className="text-center">{i + 1}</td>
                  <td>{it.desc || '-'}</td>
                  <td className="text-center">{it.qty}</td>
                  <td className="text-center">{it.unit}</td>
                  <td>{it.remark || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {notes && (
            <div className="notes">
              <strong>{L('Notes', 'หมายเหตุ')}:</strong> {notes}
            </div>
          )}

          <div className="footer">
            <div className="signature-box">
              <div className="signature-line">{L('Delivered By', 'ผู้จัดส่ง')}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>{deliveryPerson || '...................'}</div>
            </div>
            <div className="signature-box">
              <div className="signature-line">{L('Received By', 'ผู้รับสินค้า')}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>{L('Date', 'วันที่')}: ____/____/______</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
