"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

export default function CreateWarrantyPage() {
  const router = useRouter()

  // Contract search
  const [contractSearch, setContractSearch] = useState('')
  const [contractResults, setContractResults] = useState<any[]>([])
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const [showContractModal, setShowContractModal] = useState(false)
  const [searchingContracts, setSearchingContracts] = useState(false)

  // Document fields
  const [wtNo, setWtNo] = useState('')
  const [wtDate, setWtDate] = useState(() => new Date().toISOString().split('T')[0])
  const [contractNo, setContractNo] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [productName, setProductName] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [warrantyStartDate, setWarrantyStartDate] = useState('')
  const [warrantyPeriod, setWarrantyPeriod] = useState('12')
  const [warrantyEndDate, setWarrantyEndDate] = useState('')
  const [warrantyType, setWarrantyType] = useState('standard')
  const [coverageDetails, setCoverageDetails] = useState('')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Locale
  const [locale, setLocale] = useState<'en'|'th'>('th')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  // Search contracts
  async function searchContracts() {
    if (!contractSearch.trim()) {
      setContractResults([])
      return
    }

    setSearchingContracts(true)
    try {
      const res = await fetch(`/api/contracts?search=${encodeURIComponent(contractSearch)}`)
      const j = await res.json()
      if (j.success) {
        setContractResults(j.data || [])
        setShowContractModal(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSearchingContracts(false)
    }
  }

  // Select contract and auto-fill warranty data
  function selectContract(contract: any) {
    setSelectedContract(contract)
    setContractNo(contract.contractNo || '')
    setCustomerName(contract.customer_name || '')
    setCustomerPhone(contract.customer_phone || '')

    // Set warranty period from contract
    if (contract.warranty_period) {
      const period = contract.warranty_unit === 'years'
        ? contract.warranty_period * 12
        : contract.warranty_period
      setWarrantyPeriod(period.toString())
    }

    // Set warranty start date (use contract end_date or start_date)
    if (contract.end_date) {
      setWarrantyStartDate(contract.end_date)
    } else if (contract.start_date) {
      setWarrantyStartDate(contract.start_date)
    }

    // Set coverage from maintenance_scope
    if (contract.maintenance_scope) {
      setCoverageDetails(contract.maintenance_scope)
    }

    setShowContractModal(false)
    setContractSearch('')
  }

  // Auto-calculate warranty end date
  useEffect(() => {
    if (warrantyStartDate && warrantyPeriod) {
      const startDate = new Date(warrantyStartDate)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + parseInt(warrantyPeriod || '0'))
      setWarrantyEndDate(endDate.toISOString().split('T')[0])
    }
  }, [warrantyStartDate, warrantyPeriod])

  function validate() {
    const errs: string[] = []

    if (!customerName) errs.push(L('Customer name is required', 'กรุณาระบุชื่อลูกค้า'))
    if (!productName) errs.push(L('Product name is required', 'กรุณาระบุชื่อสินค้า'))
    if (!serialNumber) errs.push(L('Serial number is required', 'กรุณาระบุหมายเลขซีเรียล'))
    if (!purchaseDate) errs.push(L('Purchase date is required', 'กรุณาระบุวันที่ซื้อ'))
    if (!warrantyStartDate) errs.push(L('Warranty start date is required', 'กรุณาระบุวันที่เริ่มรับประกัน'))
    if (!warrantyPeriod || parseInt(warrantyPeriod) <= 0) {
      errs.push(L('Warranty period must be > 0', 'ระยะเวลารับประกันต้อง > 0'))
    }

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
        wtDate,
        contract_no: contractNo,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        product_name: productName,
        serial_number: serialNumber,
        purchase_date: purchaseDate,
        warranty_start_date: warrantyStartDate,
        warranty_period_months: parseInt(warrantyPeriod),
        warranty_end_date: warrantyEndDate,
        warranty_type: warrantyType,
        coverage_details: coverageDetails,
        notes,
        created_by
      }

      const res = await fetch('/api/warranties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Warranty created successfully', 'สร้างใบรับประกันสำเร็จ') })
        setTimeout(() => router.push('/KR-Thailand/Admin-Login/documents/warranties'), 900)
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
    <AdminLayout title="Create Warranty" titleTh="สร้างใบรับประกัน">
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {L('Create Warranty', 'สร้างใบรับประกัน')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Create product warranty record', 'สร้างบันทึกการรับประกันสินค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          {/* Contract Search Section */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            marginBottom: 30
          }}>
            <h3 style={{ color: '#fff', marginBottom: 15, fontSize: 16, fontWeight: 600 }}>
              📋 {L('Import from Contract', 'ดึงข้อมูลจากสัญญา')}
            </h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={contractSearch}
                  onChange={e => setContractSearch(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), searchContracts())}
                  placeholder={L('Search by contract no. or customer name...', 'ค้นหาด้วยเลขที่สัญญาหรือชื่อลูกค้า...')}
                  className={styles.formInput}
                  style={{ background: '#fff' }}
                />
              </div>
              <button
                type="button"
                onClick={searchContracts}
                disabled={searchingContracts}
                className={styles.btnPrimary}
                style={{ minWidth: 120 }}
              >
                {searchingContracts ? L('Searching...', 'กำลังค้นหา...') : L('Search', 'ค้นหา')}
              </button>
            </div>
            {selectedContract && (
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>✓ {L('Selected:', 'เลือกแล้ว:')} <strong>{selectedContract.contractNo}</strong> - {selectedContract.customer_name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedContract(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #fff',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  {L('Clear', 'ล้าง')}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Document Info */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Warranty No.', 'เลขที่ใบรับประกัน')}</label>
                <input
                  type="text"
                  value={wtNo || L('Auto-generated', 'สร้างอัตโนมัติ')}
                  disabled
                  className={styles.formInput}
                  style={{ background: '#f5f5f5' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Contract No.', 'เลขที่สัญญา')}</label>
                <input
                  type="text"
                  value={contractNo}
                  onChange={e => setContractNo(e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Optional', 'ไม่จำเป็น')}
                  style={{ background: contractNo ? '#fef3c7' : '#fff' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input
                  type="date"
                  value={wtDate}
                  readOnly
                  className={styles.formInput}
                  style={{ background: '#f5f5f5' }}
                />
              </div>
            </div>

            {/* Customer Section */}
            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>
              {L('Customer Information', 'ข้อมูลลูกค้า')}
            </h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Customer Name', 'ชื่อลูกค้า')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Enter customer name', 'กรอกชื่อลูกค้า')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Phone', 'เบอร์โทร')}</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Phone number', 'เบอร์โทรศัพท์')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Email', 'อีเมล')}</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Email address', 'ที่อยู่อีเมล')}
                />
              </div>
            </div>

            {/* Product Section */}
            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>
              {L('Product Information', 'ข้อมูลสินค้า')}
            </h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Product Name', 'ชื่อสินค้า')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Enter product name', 'กรอกชื่อสินค้า')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Serial Number', 'หมายเลขซีเรียล')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={e => setSerialNumber(e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Serial/Model number', 'หมายเลขซีเรียล/โมเดล')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Purchase Date', 'วันที่ซื้อ')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>

            {/* Warranty Period Section */}
            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>
              {L('Warranty Period', 'ระยะเวลารับประกัน')}
            </h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Warranty Start Date', 'วันที่เริ่มรับประกัน')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="date"
                  value={warrantyStartDate}
                  onChange={e => setWarrantyStartDate(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Warranty Period (Months)', 'ระยะเวลารับประกัน (เดือน)')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  value={warrantyPeriod}
                  onChange={e => setWarrantyPeriod(e.target.value)}
                  className={styles.formInput}
                  min="1"
                  placeholder="12"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Warranty End Date', 'วันที่สิ้นสุดรับประกัน')}</label>
                <input
                  type="date"
                  value={warrantyEndDate}
                  disabled
                  className={styles.formInput}
                  style={{ background: '#f5f5f5' }}
                />
                <small style={{ color: '#6b7280' }}>{L('Auto-calculated', 'คำนวณอัตโนมัติ')}</small>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Warranty Type', 'ประเภทการรับประกัน')}</label>
                <select
                  value={warrantyType}
                  onChange={e => setWarrantyType(e.target.value)}
                  className={styles.formInput}
                >
                  <option value="standard">{L('Standard', 'มาตรฐาน')}</option>
                  <option value="extended">{L('Extended', 'ขยายเวลา')}</option>
                  <option value="manufacturer">{L('Manufacturer', 'จากผู้ผลิต')}</option>
                  <option value="custom">{L('Custom', 'กำหนดเอง')}</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Coverage Details', 'รายละเอียดความคุ้มครอง')}</label>
              <textarea
                value={coverageDetails}
                onChange={e => setCoverageDetails(e.target.value)}
                className={styles.formInput}
                rows={3}
                placeholder={L('What is covered...', 'สิ่งที่รับประกัน...')}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Notes', 'หมายเหตุ')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={styles.formInput}
                rows={2}
                placeholder={L('Additional notes...', 'หมายเหตุเพิ่มเติม...')}
              />
            </div>

            {errors.length > 0 && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '16px',
                borderRadius: 8,
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#7f1d1d'
              }}>
                {errors.map((err, idx) => (
                  <div key={idx}>• {err}</div>
                ))}
              </div>
            )}

            <div className={styles.formRow} style={{ justifyContent: 'space-between', marginTop: 30 }}>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
              </button>
              <button type="button" onClick={() => router.back()} className={styles.btnOutline}>
                {L('Cancel', 'ยกเลิก')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Contract Search Modal */}
      {showContractModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowContractModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 800,
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>
                {L('Select Contract', 'เลือกสัญญา')}
              </h3>
              <button
                type="button"
                onClick={() => setShowContractModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {contractResults.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                {L('No contracts found', 'ไม่พบสัญญา')}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {contractResults.map((contract: any) => (
                  <div
                    key={contract.contractID}
                    onClick={() => selectContract(contract)}
                    style={{
                      padding: 16,
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#667eea'
                      e.currentTarget.style.background = '#f9fafb'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.background = '#fff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong style={{ color: '#667eea', fontSize: 16 }}>
                        {contract.contractNo}
                      </strong>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        background: contract.status === 'active' ? '#d1fae5' : '#fee2e2',
                        color: contract.status === 'active' ? '#065f46' : '#7f1d1d'
                      }}>
                        {contract.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, color: '#374151' }}>
                      👤 {contract.customer_name}
                      {contract.customer_phone && <span style={{ marginLeft: 12 }}>📞 {contract.customer_phone}</span>}
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                      📅 {contract.start_date} → {contract.end_date}
                      {contract.warranty_period && (
                        <span style={{ marginLeft: 12 }}>
                          🛡️ {L('Warranty:', 'รับประกัน:')} {contract.warranty_period} {contract.warranty_unit || 'months'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
