"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../admin-theme.module.css'

export default function ExportsPage() {
  const router = useRouter()
  const [exports, setExports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [locale, setLocale] = useState<'en'|'th'>('th')

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
    loadExports()
  }, [])

  async function loadExports() {
    setLoading(true)
    try {
      const res = await fetch('/api/exports')
      const j = await res.json()
      if (j.success && j.data) {
        setExports(j.data)
      }
    } catch (err) {
      console.error('Failed to load exports:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Exports" titleTh="ใบส่งออก">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{L('Export Documents', 'ใบส่งออก')}</h2>
          <button
            onClick={() => router.push('/KR-Thailand/Admin-Login/documents/exports/create')}
            className={styles.btnPrimary}
          >
            + {L('Create Export', 'สร้างใบส่งออก')}
          </button>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>{L('Loading...', 'กำลังโหลด...')}</div>
          ) : exports.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              {L('No export documents found', 'ไม่พบเอกสารส่งออก')}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{L('Export No.', 'เลขที่')}</th>
                  <th>{L('Date', 'วันที่')}</th>
                  <th>{L('Customer', 'ลูกค้า')}</th>
                  <th>{L('Country', 'ประเทศ')}</th>
                  <th>{L('Items', 'รายการ')}</th>
                  <th>{L('Amount', 'มูลค่า')}</th>
                  <th>{L('Tracking', 'เลขติดตาม')}</th>
                  <th>{L('Status', 'สถานะ')}</th>
                </tr>
              </thead>
              <tbody>
                {exports.map((exp) => (
                  <tr key={exp.expID}>
                    <td>{exp.expNo}</td>
                    <td>{new Date(exp.expDate).toLocaleDateString('th-TH')}</td>
                    <td>{exp.customer_name}</td>
                    <td>{exp.destination_country}</td>
                    <td style={{ textAlign: 'center' }}>{exp.total_items}</td>
                    <td style={{ textAlign: 'right' }}>{Number(exp.total_amount).toLocaleString()} {exp.currency}</td>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>{exp.tracking_no || '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 13,
                        background: exp.status === 'delivered' ? '#d1fae5' : exp.status === 'shipped' ? '#dbeafe' : '#fef3c7',
                        color: exp.status === 'delivered' ? '#065f46' : exp.status === 'shipped' ? '#1e40af' : '#92400e'
                      }}>
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
