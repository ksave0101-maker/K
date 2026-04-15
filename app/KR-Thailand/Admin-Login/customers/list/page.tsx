"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import AdminLayout from '../../components/AdminLayout'
import styles from '../../admin-theme.module.css'

type Customer = {
  cusID: number
  fullname: string
  email?: string
  phone?: string
  company?: string
  tax_id?: string
  province?: string
  address?: string
  house_number?: string
  moo?: string
  tambon?: string
  amphoe?: string
  postcode?: string
  created_by?: string
  created_by_user_id?: number
  created_by_name?: string
  created_by_username?: string
  created_at?: string
}

export default function Page() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [selectMode, setSelectMode] = useState(false)
  const [returnUrl, setReturnUrl] = useState<string | null>(null)

  async function load(q?: string) {
    try {
      setLoading(true)
      setError(null)
      const url = q && q.length > 0 ? `/api/customers?q=${encodeURIComponent(q)}` : '/api/customers'
      const res = await fetch(url)
      const j = await res.json()
      if (!res.ok || !j.success) {
        setError(j.error || 'Failed to load')
        setCustomers([])
      } else {
        setCustomers(j.customers || [])
      }
    } catch (err: any) {
      setError(String(err))
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    try {
      const u = new URL(window.location.href)
      const s = u.searchParams.get('select')
      const r = u.searchParams.get('returnUrl') || u.searchParams.get('return')
      if (s === '1' || s === 'true') setSelectMode(true)
      if (r) setReturnUrl(decodeURIComponent(r))
    } catch (err) {
      // ignore
    }
  }, [])

  function handleSelect(c: Customer) {
    if (!selectMode) return
    // 1) If opened as popup, postMessage to opener and close
    try {
      if (window.opener && typeof window.opener.postMessage === 'function') {
        window.opener.postMessage({ type: 'k_system_customer_selected', customer: c }, '*')
        window.close()
        return
      }
    } catch (e) {
      // ignore
    }

    // 2) If returnUrl provided, navigate there with cusID
    if (returnUrl) {
      const sep = returnUrl.includes('?') ? '&' : '?'
      window.location.href = `${returnUrl}${sep}cusID=${c.cusID}`
      return
    }

    // 3) Fallback: store in sessionStorage and go back
    try {
      sessionStorage.setItem('k_system_selected_customer', JSON.stringify(c))
      alert('Customer selected — return to the previous page to pick it up.')
      history.back()
    } catch (e) {
      // ignore
    }
  }

  return (
    <AdminLayout title="Customers" titleTh="ลูกค้า">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Customers</h2>
          <p className={styles.cardSubtitle}>Manage customer records</p>
        </div>

        <div className={styles.cardBody}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <input
              placeholder="Search by name, email or phone"
              value={q}
              onChange={e => setQ(e.target.value)}
              className={styles.formInput}
              style={{ width: 320 }}
            />
            <button onClick={() => load(q)} className={styles.btnOutline}>{loading ? 'Loading...' : 'Search'}</button>
            <Link href="/KR-Thailand/Admin-Login/customer-add"><button className={`${styles.btn} ${styles.btnPrimary}`}>Add Customer</button></Link>
          </div>

          {loading && <div>Loading…</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>อีเมล</th>
                  <th>โทรศัพท์</th>
                  <th>บริษัท</th>
                  <th>เลขผู้เสียภาษี</th>
                  <th>ที่อยู่</th>
                  <th>จังหวัด</th>
                  <th>สร้างโดย</th>
                  <th>วันที่สร้าง</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => {
                  // Build full address from parts if available
                  const fullAddr = c.house_number || c.tambon || c.amphoe || c.province || c.postcode
                    ? [c.house_number, c.moo ? `หมู่ ${c.moo}` : '', c.tambon, c.amphoe, c.province, c.postcode].filter(Boolean).join(' ')
                    : (c.address || '-')

                  return (
                    <tr key={c.cusID} onClick={() => handleSelect(c)} style={{ cursor: selectMode ? 'pointer' : 'auto' }}>
                      <td style={{ fontWeight: 600 }}>#{c.cusID}</td>
                      <td>{c.fullname}</td>
                      <td>{c.email || '---'}</td>
                      <td>{c.phone || '-'}</td>
                      <td>{c.company || '-'}</td>
                      <td>{c.tax_id || '-'}</td>
                      <td style={{ maxWidth: 300, fontSize: 13 }}>{fullAddr}</td>
                      <td>{c.province || '-'}</td>
                      <td style={{ fontSize: 13, color: '#666' }}>{c.created_by_name || c.created_by || '-'}</td>
                      <td style={{ fontSize: 13, color: '#666' }}>
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('th-TH') : '-'}
                      </td>
                    </tr>
                  )
                })}
                {customers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#999' }}>ไม่พบข้อมูลลูกค้า</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
