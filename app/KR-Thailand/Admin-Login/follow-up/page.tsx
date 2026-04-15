"use client"

import React, { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useRouter } from 'next/navigation'
import styles from '../admin-theme.module.css'

type FollowUp = {
  followUpID: number
  target_type: string | null
  target_id: number | null
  notes: string | null
  status: string
  assigned_to: string | null
  follow_up_date: string | null
  created_by: string | null
  created_at: string | null
}

type FormState = {
  target_type: string
  target_id: string
  notes: string
  status: string
  assigned_to: string
  follow_up_date: string
}

export default function FollowUpPage() {
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
    target_type: '',
    target_id: '',
    notes: '',
    status: 'open',
    assigned_to: '',
    follow_up_date: ''
  })
  const [loading, setLoading] = useState(false)
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loadingList, setLoadingList] = useState(true)

  // Delivery Note modal state
  const [showDNModal, setShowDNModal] = useState(false)
  const [dnList, setDnList] = useState<any[]>([])
  const [dnLoading, setDnLoading] = useState(false)

  // Pre-installation modal state
  const [showPreInstModal, setShowPreInstModal] = useState(false)
  const [preInstList, setPreInstList] = useState<any[]>([])
  const [preInstLoading, setPreInstLoading] = useState(false)

  // Load existing follow-ups
  useEffect(() => {
    loadFollowUps()
  }, [])

  const loadFollowUps = async () => {
    setLoadingList(true)
    try {
      const res = await fetch('/api/follow-ups')
      const j = await res.json()
      if (j && j.success && Array.isArray(j.followUps)) {
        setFollowUps(j.followUps)
      }
    } catch (err) {
      console.error('Failed to load follow-ups:', err)
    } finally {
      setLoadingList(false)
    }
  }

  // Load Delivery Notes for modal
  const loadDeliveryNotes = async () => {
    setDnLoading(true)
    try {
      const res = await fetch('/api/delivery-notes')
      const j = await res.json()
      if (j && j.success && Array.isArray(j.deliveryNotes)) {
        setDnList(j.deliveryNotes)
      }
    } catch (err) {
      console.error('Failed to load delivery notes:', err)
    } finally {
      setDnLoading(false)
    }
  }

  // Select a delivery note and import
  const selectDeliveryNote = (dn: any) => {
    const today = new Date().toISOString().split('T')[0]
    const itemCount = (dn.items || []).length
    const customerName = dn.customer_name || dn.receiver_name || ''
    const deliveryNo = dn.deliveryNo || dn.delivery_no || ''
    setForm({
      target_type: 'delivery',
      target_id: String(dn.deliveryID || dn.id || ''),
      notes: locale === 'th'
        ? `ติดตามใบจัดส่ง ${deliveryNo}\nลูกค้า: ${customerName}\nรายการ: ${itemCount} รายการ\nวันที่จัดส่ง: ${dn.delivery_date || ''}\nทะเบียนรถ: ${dn.vehicle_no || '-'}`
        : `Follow-up for Delivery Note ${deliveryNo}\nCustomer: ${customerName}\nItems: ${itemCount} item(s)\nDelivery Date: ${dn.delivery_date || ''}\nVehicle: ${dn.vehicle_no || '-'}`,
      status: 'open',
      assigned_to: dn.delivery_person || '',
      follow_up_date: today
    })
    setShowDNModal(false)
  }

  // Load Pre-installations for modal
  const loadPreInstallations = async () => {
    setPreInstLoading(true)
    try {
      const res = await fetch('/api/pre-installation')
      const j = await res.json()
      if (j && j.success && Array.isArray(j.preInstallations)) {
        setPreInstList(j.preInstallations)
      }
    } catch (err) {
      console.error('Failed to load pre-installations:', err)
    } finally {
      setPreInstLoading(false)
    }
  }

  // Select a pre-installation and import
  const selectPreInstallation = (pi: any) => {
    const today = new Date().toISOString().split('T')[0]
    const preInstNo = pi.preInstNo || pi.pre_inst_no || ''
    const customerName = pi.customer_name || pi.customerName || ''
    const siteName = pi.site_name || pi.siteName || ''
    setForm({
      target_type: 'other',
      target_id: String(pi.preInstID || pi.id || ''),
      notes: locale === 'th'
        ? `ติดตามแบบก่อนติดตั้ง ${preInstNo}\nลูกค้า: ${customerName}\nสถานที่: ${siteName}\nวันที่สำรวจ: ${pi.survey_date || ''}`
        : `Follow-up for Pre-installation ${preInstNo}\nCustomer: ${customerName}\nSite: ${siteName}\nSurvey Date: ${pi.survey_date || ''}`,
      status: 'open',
      assigned_to: pi.surveyor || '',
      follow_up_date: today
    })
    setShowPreInstModal(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        target_type: form.target_type || null,
        target_id: form.target_id ? Number(form.target_id) : null,
        notes: form.notes || null,
        status: form.status || 'open',
        assigned_to: form.assigned_to || null,
        follow_up_date: form.follow_up_date || null
      }

      const res = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const j = await res.json()
      if (j && j.success) {
        // After save, show follow-up list
        router.push('/KR-Thailand/Admin-Login/follow-up/list')
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

  const targetTypes = [
    { value: '', label: L('Select Type', 'เลือกประเภท') },
    { value: 'order', label: L('Purchase Order', 'ใบสั่งซื้อ') },
    { value: 'quotation', label: L('Quotation', 'ใบเสนอราคา') },
    { value: 'invoice', label: L('Invoice', 'ใบแจ้งหนี้') },
    { value: 'delivery', label: L('Installation & Delivery', 'ติดตั้งและจัดส่ง') },
    { value: 'customer', label: L('Customer', 'ลูกค้า') },
    { value: 'product', label: L('Product', 'สินค้า') },
    { value: 'other', label: L('Other', 'อื่นๆ') }
  ]

  const statusOptions = [
    { value: 'open', label: L('Open', 'เปิด') },
    { value: 'in_progress', label: L('In Progress', 'กำลังดำเนินการ') },
    { value: 'pending', label: L('Pending', 'รอดำเนินการ') },
    { value: 'completed', label: L('Completed', 'เสร็จสิ้น') },
    { value: 'cancelled', label: L('Cancelled', 'ยกเลิก') }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return styles.badgeInfo
      case 'in_progress': return styles.badgeWarning
      case 'pending': return styles.badgePending
      case 'completed': return styles.badgeSuccess
      case 'cancelled': return styles.badgeError
      default: return styles.badgePending
    }
  }

  const getStatusLabel = (status: string) => {
    const opt = statusOptions.find(o => o.value === status)
    return opt ? opt.label : status
  }

  const getTargetTypeLabel = (type: string | null) => {
    if (!type) return '-'
    const opt = targetTypes.find(t => t.value === type)
    return opt ? opt.label : type
  }

  return (
    <AdminLayout title="Follow Up" titleTh="ติดตามงาน">
      {/* Add New Follow-up Form */}
      <div className={styles.contentCard} style={{ marginBottom: '24px' }}>
        <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              {L('Add Follow-up', 'เพิ่มรายการติดตาม')}
            </h2>
            <p className={styles.cardSubtitle}>
              {L('Track tasks and follow-up items', 'ติดตามงานและรายการที่ต้องดำเนินการ')}
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            {/* Import Section */}
            <div style={{ marginBottom: 16, padding: 12, background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: '#0369a1' }}>{L('Import from:', 'นำเข้าจาก:')}</span>
                <button type="button" className={styles.btnOutline} style={{ padding: '8px 12px' }} onClick={() => {
                  loadDeliveryNotes()
                  setShowDNModal(true)
                }}>
                  {L('Import from Installation & Delivery', 'นำเข้าจากการติดตั้งและจัดส่ง')}
                </button>
                <button type="button" className={styles.btnOutline} style={{ padding: '8px 12px' }} onClick={() => {
                  loadPreInstallations()
                  setShowPreInstModal(true)
                }}>
                  {L('Import from Pre-installation', 'นำเข้าจากแบบก่อนติดตั้ง')}
                </button>
              </div>
            </div>

            {/* Target Type & ID Row */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Target Type', 'ประเภทเป้าหมาย')}
                </label>
                <select
                  name="target_type"
                  value={form.target_type}
                  onChange={handleChange}
                  className={styles.formSelect}
                >
                  {targetTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Reference ID', 'รหัสอ้างอิง')}
                </label>
                <input
                  type="number"
                  name="target_id"
                  value={form.target_id}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder={L('e.g. Order ID, Customer ID', 'เช่น รหัสใบสั่งซื้อ, รหัสลูกค้า')}
                />
              </div>
            </div>

            {/* Status & Follow-up Date Row */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Status', 'สถานะ')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={styles.formSelect}
                  required
                >
                  {statusOptions.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Follow-up Date', 'วันที่ติดตาม')}
                </label>
                <input
                  type="date"
                  name="follow_up_date"
                  value={form.follow_up_date}
                  onChange={handleChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Assigned To', 'มอบหมายให้')}
                </label>
                <input
                  type="text"
                  name="assigned_to"
                  value={form.assigned_to}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder={L('Staff name', 'ชื่อพนักงาน')}
                />
              </div>
            </div>

            {/* Notes */}
            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.formLabel}>
                {L('Notes', 'บันทึก')}
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className={styles.formTextarea}
                rows={3}
                placeholder={L('Enter notes or details...', 'กรอกบันทึกหรือรายละเอียด...')}
              />
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                type="submit"
                disabled={loading}
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLarge}`}
                style={{ minWidth: '160px', display: 'inline-flex', alignItems: 'center', gap: 10 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save Follow-up', 'บันทึกรายการ')}
              </button>
              <button
                type="button"
                onClick={() => setForm({
                  target_type: '',
                  target_id: '',
                  notes: '',
                  status: 'open',
                  assigned_to: '',
                  follow_up_date: ''
                })}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                {L('Clear', 'ล้างข้อมูล')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Follow-up List */}
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            {L('Follow-up List', 'รายการติดตาม')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L(`${followUps.length} items`, `${followUps.length} รายการ`)}
          </p>
        </div>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          {loadingList ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              {L('Loading...', 'กำลังโหลด...')}
            </div>
          ) : followUps.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              {L('No follow-ups found', 'ไม่พบรายการติดตาม')}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>{L('ID', 'รหัส')}</th>
                  <th style={{ width: '15%' }}>{L('Type', 'ประเภท')}</th>
                  <th style={{ width: '10%' }}>{L('Ref ID', 'รหัสอ้างอิง')}</th>
                  <th style={{ width: '12%' }}>{L('Status', 'สถานะ')}</th>
                  <th style={{ width: '15%' }}>{L('Assigned', 'มอบหมาย')}</th>
                  <th style={{ width: '13%' }}>{L('Follow Date', 'วันติดตาม')}</th>
                  <th style={{ width: '25%' }}>{L('Notes', 'บันทึก')}</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((item) => (
                  <tr key={item.followUpID}>
                    <td>#{item.followUpID}</td>
                    <td>{getTargetTypeLabel(item.target_type)}</td>
                    <td>{item.target_id || '-'}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadge(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td>{item.assigned_to || '-'}</td>
                    <td>
                      {item.follow_up_date
                        ? new Date(item.follow_up_date).toLocaleDateString('th-TH')
                        : '-'}
                    </td>
                    <td style={{
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delivery Note Selection Modal */}
      {showDNModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowDNModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: 700,
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {L('Select Delivery Note', 'เลือกใบจัดส่งสินค้า')}
              </h3>
              <button onClick={() => setShowDNModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 24, color: '#666'
              }}>&times;</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px' }}>
              {dnLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                  {L('Loading...', 'กำลังโหลด...')}
                </div>
              ) : dnList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                  {L('No delivery notes found', 'ไม่พบใบจัดส่งสินค้า')}
                </div>
              ) : (
                <table className={styles.table} style={{ fontSize: 14 }}>
                  <thead>
                    <tr>
                      <th>{L('DN No.', 'เลขที่')}</th>
                      <th>{L('Customer', 'ลูกค้า')}</th>
                      <th>{L('Delivery Date', 'วันที่จัดส่ง')}</th>
                      <th>{L('Vehicle', 'ทะเบียนรถ')}</th>
                      <th style={{ width: 80 }}>{L('Action', 'เลือก')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dnList.map((dn: any) => (
                      <tr key={dn.deliveryID || dn.id}>
                        <td style={{ fontWeight: 600 }}>{dn.deliveryNo || dn.delivery_no || '-'}</td>
                        <td>{dn.customer_name || dn.receiver_name || '-'}</td>
                        <td>{dn.delivery_date ? new Date(dn.delivery_date).toLocaleDateString('th-TH') : '-'}</td>
                        <td>{dn.vehicle_no || '-'}</td>
                        <td>
                          <button
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            style={{ padding: '6px 12px', fontSize: 13 }}
                            onClick={() => selectDeliveryNote(dn)}
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

      {/* Pre-installation Selection Modal */}
      {showPreInstModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowPreInstModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 12, width: '90%', maxWidth: 700,
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {L('Select Pre-installation', 'เลือกแบบก่อนติดตั้ง')}
              </h3>
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
                  {L('No pre-installations found', 'ไม่พบแบบก่อนติดตั้ง')}
                </div>
              ) : (
                <table className={styles.table} style={{ fontSize: 14 }}>
                  <thead>
                    <tr>
                      <th>{L('Pre-Inst No.', 'เลขที่')}</th>
                      <th>{L('Customer', 'ลูกค้า')}</th>
                      <th>{L('Site', 'สถานที่')}</th>
                      <th>{L('Survey Date', 'วันที่สำรวจ')}</th>
                      <th style={{ width: 80 }}>{L('Action', 'เลือก')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preInstList.map((pi: any) => (
                      <tr key={pi.preInstID || pi.id}>
                        <td style={{ fontWeight: 600 }}>{pi.preInstNo || pi.pre_inst_no || '-'}</td>
                        <td>{pi.customer_name || pi.customerName || '-'}</td>
                        <td>{pi.site_name || pi.siteName || '-'}</td>
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
