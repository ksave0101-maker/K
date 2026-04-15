"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../admin-theme.module.css'

export default function ImportsPage() {
  const router = useRouter()
  const [imports, setImports] = useState<any[]>([])
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
    loadImports()
  }, [])

  async function loadImports() {
    setLoading(true)
    try {
      const res = await fetch('/api/imports')
      const j = await res.json()
      if (j.success && j.data) {
        setImports(j.data)
      }
    } catch (err) {
      console.error('Failed to load imports:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Imports" titleTh="ใบนำเข้า">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{L('Import Documents', 'ใบนำเข้า')}</h2>
          <button
            onClick={() => router.push('/KR-Thailand/Admin-Login/documents/imports/create')}
            className={styles.btnPrimary}
          >
            + {L('Create Import', 'สร้างใบนำเข้า')}
          </button>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>{L('Loading...', 'กำลังโหลด...')}</div>
          ) : imports.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              {L('No import documents found', 'ไม่พบเอกสารนำเข้า')}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{L('Import No.', 'เลขที่')}</th>
                  <th>{L('Date', 'วันที่')}</th>
                  <th>{L('Supplier', 'ผู้ขาย')}</th>
                  <th>{L('Warehouse', 'คลัง')}</th>
                  <th>{L('Items', 'รายการ')}</th>
                  <th>{L('Amount', 'มูลค่า')}</th>
                  <th>{L('Status', 'สถานะ')}</th>
                </tr>
              </thead>
              <tbody>
                {imports.map((imp) => (
                  <tr key={imp.impID}>
                    <td>{imp.impNo}</td>
                    <td>{new Date(imp.impDate).toLocaleDateString('th-TH')}</td>
                    <td>{imp.supplier_name}</td>
                    <td>{imp.warehouse}</td>
                    <td style={{ textAlign: 'center' }}>{imp.total_items}</td>
                    <td style={{ textAlign: 'right' }}>{Number(imp.total_amount).toLocaleString()} {imp.currency}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 13,
                        background: imp.status === 'completed' ? '#d1fae5' : imp.status === 'received' ? '#dbeafe' : '#fef3c7',
                        color: imp.status === 'completed' ? '#065f46' : imp.status === 'received' ? '#1e40af' : '#92400e'
                      }}>
                        {imp.status}
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
