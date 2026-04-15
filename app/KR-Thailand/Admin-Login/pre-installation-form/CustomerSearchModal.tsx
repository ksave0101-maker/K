"use client"
import React, { useState } from 'react'
import styles from '../admin-theme.module.css'

export default function CustomerSearchModal({ onSelect, onClose }: { onSelect: (customer: any) => void, onClose: () => void }) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(search)}`)
      const j = await res.json()
      if (j && j.success && Array.isArray(j.rows)) setResults(j.rows)
      else setResults([])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: 480 }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>ค้นหาลูกค้า/บริษัท</div>
        <input
          className={styles.formInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ชื่อลูกค้า, เบอร์, อีเมล, บริษัท ฯลฯ"
          style={{ width: '100%', marginBottom: 12 }}
        />
        <button className={styles.btn} style={{ marginBottom: 12 }} onClick={handleSearch} disabled={loading || !search}>{loading ? 'ค้นหา...' : 'ค้นหา'}</button>
        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
          {results.map(cus => (
            <div key={cus.cusID} style={{ padding: 8, borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => { onSelect(cus) }}>
              <div style={{ fontWeight: 600 }}>{cus.fullname}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{cus.company || ''} {cus.phone ? ' | ' + cus.phone : ''}</div>
            </div>
          ))}
          {results.length === 0 && !loading && <div style={{ color: '#999', textAlign: 'center', marginTop: 16 }}>ไม่พบข้อมูล</div>}
        </div>
        <button className={styles.btnOutline} style={{ marginTop: 16 }} onClick={onClose}>ปิด</button>
      </div>
    </div>
  )
}
