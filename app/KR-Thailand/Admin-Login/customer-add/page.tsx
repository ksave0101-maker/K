"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

export default function CustomerAddPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    house_number: '',
    moo: '',
    tambon: '',
    amphoe: '',
    province: '',
    postcode: '',
    company: '',
    tax_id: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [saveHover, setSaveHover] = useState(false)
  const [cancelHover, setCancelHover] = useState(false)

  // Start with default 'th' for SSR, then read from localStorage on client
  const [locale, setLocale] = useState<'en'|'th'>('th')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Read locale from localStorage only on client-side
    setMounted(true)
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l)
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

  // Prevent hydration mismatch by waiting for client-side mount
  if (!mounted) {
    return (
      <AdminLayout title="Add Customer - Thailand Branch" titleTh="เพิ่มลูกค้า - สาขาประเทศไทย">
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </AdminLayout>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Get current user from localStorage
      let currentUser = null
      try {
        const userData = localStorage.getItem('k_system_admin_user')
        if (userData) currentUser = JSON.parse(userData)
      } catch (e) {
        console.error('Failed to get user data:', e)
      }

      // Include user info in the request
      const payload = {
        ...form,
        currentUserId: currentUser?.userId,
        currentUserName: currentUser?.name,
        currentUserUsername: currentUser?.username
      }

      const res = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const j = await res.json()

      if (res.ok && j && j.success) {
        setMessageBar({ type: 'success', text: L('Customer added successfully', 'เพิ่มลูกค้าสำเร็จ') })
        setForm({
          name: '',
          email: '',
          phone: '',
          house_number: '',
          moo: '',
          tambon: '',
          amphoe: '',
          province: '',
          postcode: '',
          company: '',
          tax_id: '',
          message: ''
        })
        setTimeout(() => router.push('/KR-Thailand/Admin-Login/customers'), 900)
      } else {
        const serverMsg = (j && j.error) ? j.error : res.statusText || 'Unknown error'
        setMessageBar({ type: 'error', text: L('Save failed:', 'บันทึกไม่สำเร็จ:') + ' ' + serverMsg })
      }
    } catch (err) {
      console.error(err)
      setMessageBar({ type: 'error', text: L('Network error', 'มีข้อผิดพลาดในการเชื่อมต่อ') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Add Customer - Thailand Branch" titleTh="เพิ่มลูกค้า - สาขาประเทศไทย">
      {messageBar && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: 8,
          color: messageBar.type === 'error' ? '#7f1d1d' : '#064e3b',
          background: messageBar.type === 'error' ? '#fee2e2' : '#ecfdf5',
          border: messageBar.type === 'error' ? '1px solid #fca5a5' : '1px solid #86efac',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>{messageBar.text}</div>
          <button onClick={() => setMessageBar(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            {L('Close', 'ปิด')}
          </button>
        </div>
      )}

      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            {L('Add New Customer - Thailand Branch', 'เพิ่มลูกค้าใหม่ - สาขาประเทศไทย')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Enter customer information', 'กรอกข้อมูลลูกค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Customer Name', 'ชื่อลูกค้า')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={styles.formInput}
                  placeholder={L('Enter customer name', 'กรอกชื่อลูกค้า')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Company', 'บริษัท')}</label>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder={L('Company name', 'ชื่อบริษัท')}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Email', 'อีเมล')}</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder={L('email@example.com', 'email@example.com')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Phone', 'เบอร์โทร')}</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder={L('Phone number', 'เบอร์โทรศัพท์')}
                />
              </div>
            </div>

            {/* Address Section - Thai Format */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>
                {L('Address', 'ที่อยู่')}
              </h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('House No.', 'เลขที่')}</label>
                  <input
                    name="house_number"
                    value={form.house_number}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('123', '123')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Moo', 'หมู่ที่')}</label>
                  <input
                    name="moo"
                    value={form.moo}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('1', '1')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Sub-district', 'แขวง/ตำบล')}</label>
                  <input
                    name="tambon"
                    value={form.tambon}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('Tambon', 'ตำบล')}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('District', 'เขต/อำเภอ')}</label>
                  <input
                    name="amphoe"
                    value={form.amphoe}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('District', 'อำเภอ')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Province', 'จังหวัด')}</label>
                  <input
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('Province', 'จังหวัด')}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{L('Postal Code', 'รหัสไปรษณีย์')}</label>
                  <input
                    name="postcode"
                    value={form.postcode}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder={L('10100', '10100')}
                    maxLength={5}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '16px' }}>
              <label className={styles.formLabel}>{L('Tax ID', 'เลขผู้เสียภาษีอากร')}</label>
              <input
                name="tax_id"
                value={form.tax_id}
                onChange={handleChange}
                className={styles.formInput}
                placeholder={L('Tax identification number (13 digits)', 'เลขประจำตัวผู้เสียภาษี (13 หลัก)')}
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
              <label className={styles.formLabel}>{L('Message', 'ข้อความ')}</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className={styles.formTextarea}
                rows={4}
                placeholder={L('Additional notes or message', 'บันทึกหรือข้อความเพิ่มเติม')}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                gap: '14px',
                marginTop: '24px',
                paddingTop: '18px',
                borderTop: '1px solid #f1f5f9',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    onMouseEnter={() => setSaveHover(true)}
                    onMouseLeave={() => setSaveHover(false)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 28px',
                      fontSize: '15px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      background: saveHover && !loading
                        ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
                        : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      color: 'white',
                      boxShadow: saveHover && !loading
                        ? '0 4px 12px rgba(37, 99, 235, 0.4)'
                        : '0 2px 8px rgba(37, 99, 235, 0.2)',
                      transition: 'all 0.2s',
                      opacity: loading ? 0.7 : 1,
                      transform: saveHover && !loading ? 'translateY(-2px)' : 'translateY(0)'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                    </svg>
                    {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    onMouseEnter={() => setCancelHover(true)}
                    onMouseLeave={() => setCancelHover(false)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 28px',
                      fontSize: '15px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      background: cancelHover
                        ? 'linear-gradient(135deg, #475569, #64748b)'
                        : 'linear-gradient(135deg, #64748b, #94a3b8)',
                      color: 'white',
                      boxShadow: cancelHover
                        ? '0 4px 12px rgba(100, 116, 139, 0.4)'
                        : '0 2px 8px rgba(100, 116, 139, 0.2)',
                      transition: 'all 0.2s',
                      transform: cancelHover ? 'translateY(-2px)' : 'translateY(0)'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    {L('Cancel', 'ยกเลิก')}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
