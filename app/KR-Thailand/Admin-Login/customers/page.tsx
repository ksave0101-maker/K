"use client"

import React, { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type Customer = {
  cusID: number,
  fullname: string,
  email?: string | null,
  phone?: string | null,
  company?: string | null,
  tax_id?: string | null,
  address?: string | null,
  house_number?: string | null,
  moo?: string | null,
  tambon?: string | null,
  amphoe?: string | null,
  province?: string | null,
  postcode?: string | null,
  message?: string | null,
  created_by?: string | null,
  created_by_user_id?: number | null,
  created_by_name?: string | null,
  created_by_username?: string | null,
  created_at?: string | null
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchName, setSearchName] = useState('')
  const [searchProvince, setSearchProvince] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [appliedProvince, setAppliedProvince] = useState('')
  const [loading, setLoading] = useState(true)
  const [locale, setLocale] = useState<'en'|'th'>('th') // Default to 'th' for SSR

  useEffect(() => {
    // Read locale from localStorage (client-side only)
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'th' || l === 'en') setLocale(l)
    } catch {}

    // Event listeners for locale changes
    const handler = (e: Event) => {
      const d = (e as CustomEvent<string | { locale?: string }>).detail
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

  const handleSearch = () => {
    setAppliedName(searchName.trim())
    setAppliedProvince(searchProvince.trim())
  }

  const handleClearSearch = () => {
    setSearchName('')
    setSearchProvince('')
    setAppliedName('')
    setAppliedProvince('')
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/customers')
      const j = await res.json()
      console.log('API Response:', j) // Debug log
      if (j && j.success && Array.isArray(j.customers)) {
        setCustomers(j.customers)
        console.log('Loaded customers:', j.customers.length)
      } else {
        console.error('Invalid response:', j)
        setCustomers([])
      }
    } catch (err) {
      console.error('Failed to load customers', err)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const nameQuery = appliedName.trim().toLowerCase()
    const provinceQuery = appliedProvince.trim().toLowerCase()

    const matchesName = !nameQuery || String(customer.fullname || '').toLowerCase().includes(nameQuery)
    const provinceSource = String(customer.province || customer.address || '').toLowerCase()
    const matchesProvince = !provinceQuery || provinceSource.includes(provinceQuery)

    return matchesName && matchesProvince
  })

  return (
    <AdminLayout title="Customers" titleTh="รายละเอียดลูกค้า">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className={styles.cardTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {L('Customer List', 'รายการลูกค้า')}
            </h2>
            <p className={styles.cardSubtitle}>
              {L(`${filteredCustomers.length} customers`, `${filteredCustomers.length} รายการ`)}
            </p>
          </div>

          <a href="/KR-Thailand/Admin-Login/customer-add" className={styles.btnPrimary}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {L('Add Customer', 'เพิ่มลูกค้า')}
          </a>
        </div>

        <div className={styles.cardBody} style={{ padding: 0 }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'end',
            background: '#f8fafc'
          }}>
            <div style={{ minWidth: 220, flex: '1 1 260px' }}>
              <label className={styles.formLabel}>{L('Search Customer Name', 'ค้นหาชื่อลูกค้า')}</label>
              <input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={L('Type customer name', 'คีย์ชื่อลูกค้า')}
                className={styles.formInput}
              />
            </div>

            <div style={{ minWidth: 180, flex: '1 1 220px' }}>
              <label className={styles.formLabel}>{L('Search Province', 'ค้นหาจังหวัด')}</label>
              <input
                value={searchProvince}
                onChange={(e) => setSearchProvince(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={L('Type province', 'คีย์จังหวัด')}
                className={styles.formInput}
              />
            </div>

            <button
              onClick={handleSearch}
              className={styles.btnPrimary}
              style={{ height: 42 }}
            >
              {L('Search', 'ค้นหา')}
            </button>

            <button
              onClick={handleClearSearch}
              className={styles.btnSecondary}
              style={{ height: 42 }}
            >
              {L('Clear', 'ล้าง')}
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              {L('Loading...', 'กำลังโหลด...')}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              {L('No customers found', 'ไม่พบลูกค้าที่ค้นหา')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>{L('ID', 'รหัส')}</th>
                    <th>{L('Name', 'ชื่อ-นามสกุล')}</th>
                    <th>{L('Email', 'อีเมล')}</th>
                    <th>{L('Phone', 'โทรศัพท์')}</th>
                    <th>{L('Company', 'บริษัท')}</th>
                    <th>{L('Tax ID', 'เลขผู้เสียภาษี')}</th>
                    <th style={{ maxWidth: '200px' }}>{L('Address', 'ที่อยู่')}</th>
                    <th>{L('Province', 'จังหวัด')}</th>
                    <th>{L('Created By', 'สร้างโดย')}</th>
                    <th>{L('Created At', 'วันที่สร้าง')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(c => {
                    // Build full address from parts if available
                    const fullAddr = c.house_number || c.tambon || c.amphoe || c.province || c.postcode
                      ? [c.house_number, c.moo ? `หมู่ ${c.moo}` : '', c.tambon, c.amphoe, c.province, c.postcode].filter(Boolean).join(' ')
                      : (c.address || '-')

                    return (
                      <tr key={c.cusID}>
                        <td>#{c.cusID}</td>
                        <td style={{ fontWeight: 600 }}>{c.fullname}</td>
                        <td>{c.email || '-'}</td>
                        <td>{c.phone || '-'}</td>
                        <td>{c.company || '-'}</td>
                        <td>{c.tax_id || '-'}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {fullAddr}
                        </td>
                        <td>{c.province || '-'}</td>
                        <td>{c.created_by_name || c.created_by || '-'}</td>
                        <td>
                          {c.created_at
                            ? new Date(c.created_at).toLocaleDateString('th-TH')
                            : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
