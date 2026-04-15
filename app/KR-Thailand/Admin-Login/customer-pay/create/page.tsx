"use client"

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import styles from '../../admin-theme.module.css'

export default function CustomerSearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectMode = searchParams?.get('select') === '1'

  const [q, setQ] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // initial load: fetch recent customers
    fetchList('')
  }, [])

  async function fetchList(query: string) {
    try {
      setLoading(true)
      const url = `/api/customers${query && query.length ? `?q=${encodeURIComponent(query)}` : ''}`
      const res = await fetch(url)
      const j = await res.json().catch(() => null)
      if (res.ok && j && j.success && Array.isArray(j.customers)) setCustomers(j.customers)
      else setCustomers([])
    } catch (e) { console.error('customer search error', e); setCustomers([]) }
    finally { setLoading(false) }
  }

  function handleSelect(cust: any) {
    try {
      // If opened as a popup expecting postMessage
      if (selectMode && typeof window !== 'undefined') {
        if (window.opener && typeof window.opener.postMessage === 'function') {
          window.opener.postMessage({ type: 'k-system-customer-selected', customer: cust }, '*')
          window.close()
          return
        }
        // Otherwise dispatch a global event listeners can pick up
        window.dispatchEvent(new CustomEvent('k-system-list-select', { detail: cust }))
        // Also store to localStorage as fallback
        try { localStorage.setItem('k_system_selected_customer', JSON.stringify(cust)) } catch (_) {}
        alert('Customer selected')
        // keep the page open for further actions
        return
      }

      // Default behaviour: navigate back to customer-pay list with cusID param
      const id = cust?.cusID || cust?.cusId || cust?.id || cust?.customerId
      if (id) {
        router.push(`/KR-Thailand/Admin-Login/customer-pay?cusID=${encodeURIComponent(String(id))}`)
      } else {
        alert('Selected customer has no id')
      }
    } catch (e) {
      console.error('select customer error', e)
    }
  }

  return (
    <div className={styles.contentCard} style={{ margin: 20 }}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Search Customer</h2>
        <p className={styles.cardSubtitle}>ค้นหาลูกค้า</p>
      </div>
      <div className={styles.cardBody}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name / email / phone" style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }} />
          <button onClick={() => fetchList(q)} className={styles.btnOutline} disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Company</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, idx) => (
                <tr key={c.cusID || c.id || idx}>
                  <td>{c.cusID ?? c.id ?? '-'}</td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>{c.fullname ?? c.name ?? '-'}</td>
                  <td>{c.company ?? '-'}</td>
                  <td>{c.phone ?? '-'}</td>
                  <td>
                    <button onClick={() => handleSelect(c)} className={styles.btn}>{selectMode ? 'Select' : 'Use'}</button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>{loading ? 'Searching...' : 'No customers found'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
