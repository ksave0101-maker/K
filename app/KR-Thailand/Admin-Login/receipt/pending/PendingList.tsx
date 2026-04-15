"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../components/AdminLayout'
import styles from '../../admin-theme.module.css'

type PendingListProps = { locale?: 'en' | 'th' }

type ReceiptRow = {
  receiptID: number
  receiptNo: string
  receiptDate: string | null
  customer: string
  amount: number
  status?: string
}

function getAuthHeaders() {
  try {
    const token = localStorage.getItem('k_system_admin_token') || ''
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`
    return headers
  } catch {
    return {}
  }
}

export default function PendingList({ locale = 'th' }: PendingListProps) {
  const router = useRouter()
  const title = locale === 'th' ? 'รายการบิลรออนุมัติ' : 'Pending Bills'
  const [rows, setRows] = useState<ReceiptRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ReceiptRow | null>(null)
  const [approverName, setApproverName] = useState('')
  const [saving, setSaving] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawingRef = useRef(false)
  const hasDrawnRef = useRef(false)
  const currentUserName = useMemo(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (!raw) return ''
      const user = JSON.parse(raw)
      return user?.name || user?.username || ''
    } catch {
      return ''
    }
  }, [])

  const T = (en: string, th: string) => (locale === 'th' ? th : en)

  const loadRows = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/receipts?status=pending', { headers: getAuthHeaders() })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        setError(json?.error || 'Failed to load pending bills')
        setRows([])
        return
      }
      setRows(Array.isArray(json.rows) ? json.rows : [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load pending bills'
      setError(message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRows()
  }, [])

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasDrawnRef.current = false
  }

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    }
  }

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getPointerPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0f172a'
    isDrawingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getPointerPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    hasDrawnRef.current = true
  }

  const endDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const approveWithSignature = async () => {
    if (!selected) return
    if (!approverName.trim()) {
      alert(T('Please enter approver name', 'กรุณาระบุชื่อผู้อนุมัติ'))
      return
    }
    if (!hasDrawnRef.current) {
      alert(T('Please sign before approval', 'กรุณาวางลายเซ็นก่อนอนุมัติ'))
      return
    }

    try {
      setSaving(true)
      const signatureData = canvasRef.current?.toDataURL('image/png')
      const res = await fetch('/api/receipts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          receiptID: selected.receiptID,
          status: 'approved',
          approvedBy: approverName.trim(),
          approvedSignature: signatureData,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        alert((json?.error || 'Approval failed') as string)
        return
      }
      alert(T('Bill approved successfully', 'อนุมัติบิลเรียบร้อยแล้ว'))
      setSelected(null)
      clearSignature()
      await loadRows()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : T('Approval failed', 'อนุมัติไม่สำเร็จ')
      alert(message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!selected) return
    setApproverName(currentUserName || '')
    setTimeout(() => clearSignature(), 0)
  }, [selected, currentUserName])

  return (
    <AdminLayout title={title} titleTh={title}>
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{title}</h2>
          <p className={styles.cardSubtitle}>{T('Click bill to approve with signature', 'คลิกรายการบิลเพื่ออนุมัติและวางลายเซ็น')}</p>
        </div>
        <div className={styles.cardBody}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <button className={styles.btnOutline} onClick={loadRows} disabled={loading}>
              {loading ? T('Loading...', 'กำลังโหลด...') : T('Refresh', 'รีเฟรช')}
            </button>
            <div style={{ fontSize: 14, color: '#334155' }}>
              {T('Pending Bills', 'บิลรออนุมัติ')}: <strong>{rows.length}</strong>
            </div>
          </div>

          {error && <div style={{ color: '#b91c1c', marginBottom: 10 }}>{error}</div>}

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{T('Bill ID', 'รหัสบิล')}</th>
                  <th>{T('Receipt No', 'เลขที่ใบรับเงิน')}</th>
                  <th>{T('Date', 'วันที่')}</th>
                  <th>{T('Customer', 'ลูกค้า')}</th>
                  <th>{T('Amount', 'จำนวนเงิน')}</th>
                  <th>{T('Status', 'สถานะ')}</th>
                  <th>{T('Action', 'การดำเนินการ')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.receiptID}>
                    <td>{row.receiptID}</td>
                    <td>{row.receiptNo}</td>
                    <td>{row.receiptDate || '-'}</td>
                    <td>{row.customer || '-'}</td>
                    <td>{Number(row.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: '#92400e', background: '#fef3c7' }}>
                        {row.status || 'pending'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button
                        className={styles.btnOutline}
                        onClick={() => router.push(`/KR-Thailand/Admin-Login/receipt?receiptNo=${encodeURIComponent(row.receiptNo)}`)}
                        style={{ padding: '6px 10px' }}
                      >
                        {T('View', 'ดู')}
                      </button>
                      <button
                        className={styles.btnPrimary}
                        onClick={() => setSelected(row)}
                        style={{ padding: '6px 10px' }}
                      >
                        {T('Approve', 'อนุมัติ')}
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>
                      {loading ? T('Loading pending bills...', 'กำลังโหลดบิลรออนุมัติ...') : T('No pending bills', 'ไม่มีบิลรออนุมัติ')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: 16,
        }}>
          <div style={{ background: '#fff', width: 'min(760px, 100%)', borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginBottom: 8, fontWeight: 700, fontSize: 18 }}>{T('Approve Bill', 'อนุมัติบิล')}</h3>
            <p style={{ marginBottom: 12, color: '#475569' }}>
              {T('Receipt No', 'เลขที่ใบรับเงิน')}: <strong>{selected.receiptNo}</strong>
            </p>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>{T('Approver Name', 'ชื่อผู้อนุมัติ')}</label>
              <input
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                placeholder={T('Enter approver name', 'ระบุชื่อผู้อนุมัติ')}
                style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 10px' }}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>{T('Signature', 'ลายเซ็น')}</label>
              <canvas
                ref={canvasRef}
                width={700}
                height={180}
                style={{ width: '100%', border: '1px dashed #94a3b8', borderRadius: 8, touchAction: 'none', background: '#f8fafc' }}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={endDrawing}
                onPointerCancel={endDrawing}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <button className={styles.btnOutline} onClick={clearSignature}>{T('Clear Signature', 'ล้างลายเซ็น')}</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={styles.btnOutline}
                  onClick={() => {
                    setSelected(null)
                    clearSignature()
                  }}
                >
                  {T('Cancel', 'ยกเลิก')}
                </button>
                <button className={styles.btnPrimary} disabled={saving} onClick={approveWithSignature}>
                  {saving ? T('Saving...', 'กำลังบันทึก...') : T('Confirm Approve', 'ยืนยันอนุมัติ')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
