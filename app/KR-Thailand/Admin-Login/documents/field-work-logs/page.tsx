"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../admin-theme.module.css'

export default function FieldWorkLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
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
    loadLogs()
  }, [])

  async function loadLogs() {
    setLoading(true)
    try {
      const res = await fetch('/api/field-work-logs')
      const j = await res.json()
      if (j.success && j.data) {
        setLogs(j.data)
      }
    } catch (err) {
      console.error('Failed to load field work logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const getWorkTypeLabel = (type: string) => {
    const types: any = {
      installation: L('Installation', 'ติดตั้ง'),
      maintenance: L('Maintenance', 'ซ่อมบำรุง'),
      repair: L('Repair', 'ซ่อมแซม'),
      inspection: L('Inspection', 'ตรวจสอบ'),
      survey: L('Survey', 'สำรวจ')
    }
    return types[type] || type
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: { bg: '#fef3c7', color: '#92400e' },
      in_progress: { bg: '#dbeafe', color: '#1e40af' },
      completed: { bg: '#d1fae5', color: '#065f46' },
      cancelled: { bg: '#fee2e2', color: '#991b1b' }
    }
    return colors[status] || { bg: '#f3f4f6', color: '#374151' }
  }

  return (
    <AdminLayout title="Field Work Logs" titleTh="บันทึกทำงานนอกสถานที่">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{L('Field Work Logs', 'บันทึกทำงานนอกสถานที่')}</h2>
          <button
            onClick={() => router.push('/KR-Thailand/Admin-Login/documents/field-work-logs/create')}
            className={styles.btnPrimary}
          >
            + {L('Create Log', 'สร้างบันทึก')}
          </button>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>{L('Loading...', 'กำลังโหลด...')}</div>
          ) : logs.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              {L('No field work logs found', 'ไม่พบบันทึกทำงานนอกสถานที่')}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{L('Doc No.', 'เลขที่')}</th>
                  <th>{L('Work Date', 'วันที่ทำงาน')}</th>
                  <th>{L('Employee', 'พนักงาน')}</th>
                  <th>{L('Customer', 'ลูกค้า')}</th>
                  <th>{L('Location', 'สถานที่')}</th>
                  <th>{L('Type', 'ประเภท')}</th>
                  <th>{L('Hours', 'ชม.')}</th>
                  <th>{L('Complete', 'สำเร็จ')}</th>
                  <th>{L('Status', 'สถานะ')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.fwlID}>
                    <td>{log.fwlNo}</td>
                    <td>{new Date(log.work_date).toLocaleDateString('th-TH')}</td>
                    <td style={{ fontWeight: 500 }}>{log.employee_name}</td>
                    <td>{log.customer_name || '-'}</td>
                    <td style={{ fontSize: 13, color: '#6b7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.site_location}
                    </td>
                    <td>
                      <span style={{ fontSize: 13 }}>
                        {getWorkTypeLabel(log.work_type)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{log.total_hours || 0}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        background: log.completion_percentage >= 100 ? '#d1fae5' : '#fef3c7',
                        color: log.completion_percentage >= 100 ? '#065f46' : '#92400e'
                      }}>
                        {log.completion_percentage}%
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 13,
                        background: getStatusColor(log.work_status).bg,
                        color: getStatusColor(log.work_status).color
                      }}>
                        {log.work_status}
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
