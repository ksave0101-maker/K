"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../admin-theme.module.css'

type ContractRecord = {
  contractID: number
  contractNo: string
  cusID?: number
  customer_name: string
  contract_date: string
  contract_duration: number
  duration_unit: string
  total_amount: number
  installment_count: number
  warranty_period: number
  warranty_unit: string
  status: string
  created_at: string
}

export default function ContractListPage() {
  const router = useRouter()
  const [contracts, setContracts] = useState<ContractRecord[]>([])
  const [loading, setLoading] = useState(false)

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

  const getAuthHeaders = (): Record<string, string> => {
    try {
      const t = localStorage.getItem('k_system_admin_token') || ''
      return t ? { Authorization: `Bearer ${t}` } : {}
    } catch {
      return {}
    }
  }

  const loadContracts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/contracts', { headers: getAuthHeaders() })
      const j = await res.json()
      if (j && j.success && Array.isArray(j.contracts)) {
        setContracts(j.contracts)
      }
    } catch (err) {
      console.error('Failed to load contracts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContracts()
  }, [])

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; bg: string }> = {
      active: { label: L('Active', 'มีผลบังคับ'), color: '#166534', bg: '#dcfce7' },
      pending: { label: L('Pending', 'รอดำเนินการ'), color: '#92400e', bg: '#fef3c7' },
      expired: { label: L('Expired', 'หมดอายุ'), color: '#991b1b', bg: '#fee2e2' },
      terminated: { label: L('Terminated', 'ยกเลิก'), color: '#6b7280', bg: '#f3f4f6' },
      completed: { label: L('Completed', 'เสร็จสิ้น'), color: '#1e40af', bg: '#dbeafe' }
    }
    const b = badges[status] || { label: status, color: '#666', bg: '#f5f5f5' }
    return (
      <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: b.color, background: b.bg }}>
        {b.label}
      </span>
    )
  }

  const getDurationText = (duration: number, unit: string) => {
    const units: Record<string, { en: string; th: string }> = {
      days: { en: 'days', th: 'วัน' },
      months: { en: 'months', th: 'เดือน' },
      years: { en: 'years', th: 'ปี' }
    }
    const u = units[unit] || { en: unit, th: unit }
    return `${duration} ${locale === 'th' ? u.th : u.en}`
  }

  const fmtCurrency = (n: number) => n.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <AdminLayout title="Contracts" titleTh="รายการสัญญา">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M12 18v-6"/>
              <path d="M9 15l3 3 3-3"/>
            </svg>
            {L('Contract List', 'รายการสัญญาซื้อ-ขาย')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('View and manage sales contracts', 'ดูและจัดการสัญญาซื้อขาย')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => router.push('/KR-Thailand/Admin-Login/contract')}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              + {L('Create New Contract', 'สร้างสัญญาใหม่')}
            </button>
            <button onClick={loadContracts} className={styles.btnOutline} disabled={loading}>
              {loading ? L('Loading...', 'กำลังโหลด...') : L('Refresh', 'รีเฟรช')}
            </button>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{L('Contract No.', 'เลขที่สัญญา')}</th>
                  <th>{L('Customer', 'ลูกค้า')}</th>
                  <th>{L('Duration', 'ระยะเวลา')}</th>
                  <th style={{ textAlign: 'right' }}>{L('Amount', 'ยอดเงิน')}</th>
                  <th style={{ textAlign: 'center' }}>{L('Installments', 'จำนวนงวด')}</th>
                  <th>{L('Warranty', 'ประกัน')}</th>
                  <th style={{ textAlign: 'center' }}>{L('Status', 'สถานะ')}</th>
                  <th style={{ textAlign: 'center', width: 72 }}>{L('Print', 'พิมพ์')}</th>
                  <th>{L('Date', 'วันที่')}</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map(c => (
                  <tr key={c.contractID}>
                    <td style={{ fontWeight: 600 }}>{c.contractNo}</td>
                    <td>{c.customer_name || '-'}</td>
                    <td>{getDurationText(c.contract_duration || 0, c.duration_unit || 'months')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
                      {fmtCurrency(Number(c.total_amount || 0))} ฿
                    </td>
                    <td style={{ textAlign: 'center' }}>{c.installment_count || 1} {L('installments', 'งวด')}</td>
                    <td>{getDurationText(c.warranty_period || 0, c.warranty_unit || 'months')}</td>
                    <td style={{ textAlign: 'center' }}>{getStatusBadge(c.status)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => window.open(`/KR-Thailand/Admin-Login/contract/print?contractID=${c.contractID}`, '_blank')}
                        className={styles.btnOutline}
                        title={L('Print contract', 'พิมพ์สัญญา')}
                        style={{ padding: '6px 8px', borderRadius: 8 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9V2h12v7"/>
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5h20v5a2 2 0 0 1-2 2h-2"/>
                          <rect x="6" y="14" width="12" height="8" rx="2" ry="2"/>
                        </svg>
                      </button>
                    </td>
                    <td style={{ fontSize: 13, color: '#666' }}>
                      {c.contract_date ? new Date(c.contract_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
                {contracts.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                      {loading ? L('Loading...', 'กำลังโหลด...') : L('No contracts found', 'ไม่พบข้อมูลสัญญา')}
                    </td>
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
