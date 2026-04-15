"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

type LeaveRequestRecord = {
  requestDate: string
  employeeName: string
  employeeId: string
  userId?: number
  department: string
  leaveType: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  contactPhone: string
  backupPerson: string
  requester: string
  notes?: string
}

type LocaleChangeDetail = string | { locale?: 'en' | 'th' }

export default function CreateVacationLeaveRequestPage() {
  const router = useRouter()

  const [locale, setLocale] = useState<'en' | 'th'>('th')
  const [loading, setLoading] = useState(false)
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [employeeIdConflict, setEmployeeIdConflict] = useState(false)
  const [conflictOwnerName, setConflictOwnerName] = useState('')

  const [requestNo, setRequestNo] = useState('')
  const [requestDate, setRequestDate] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [userIdInt, setUserIdInt] = useState<number | null>(null)
  const [department, setDepartment] = useState('')
  const [loadingDept, setLoadingDept] = useState(false)
  const [leaveType, setLeaveType] = useState('annual_leave')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [backupPerson, setBackupPerson] = useState('')
  const [requester, setRequester] = useState('')

  useEffect(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l)
    } catch {}

    const handler = (e: Event) => {
      const d = (e as CustomEvent<LocaleChangeDetail>).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLocale(v)
    }

    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)

    setRequestNo(L('Auto-generated on submit', 'สร้างอัตโนมัติเมื่อกดส่งคำขอ'))
    setRequestDate(new Date().toISOString().split('T')[0])

    // Auto-fill employee info from logged-in user
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const user = JSON.parse(raw)
        const name = user?.name || user?.username || ''
        const username = user?.username || user?.name || ''
        const uid = user?.userId ? String(user.userId).padStart(4, '0') : ''
        // Prefer employeeId stored in DB (via user_list), fallback to generated
        const empId = user?.employeeId || (uid ? `EMP-TH-${uid}` : '')
        if (name) {
          setEmployeeName(name)
          setRequester(name)
        }
        if (user?.userId) {
          setUserIdInt(Number(user.userId))
        }
        if (empId) {
          setEmployeeId(empId)
        }
        // Fetch department AND employeeId from DB via user_list → cus_type
        if (user?.userId) {
          setLoadingDept(true)
          fetch(`/api/user/type-info?userId=${encodeURIComponent(user.userId)}`)
            .then(r => r.json())
            .then(data => {
              if (data.success) {
                const dept = data.departmentName || data.typeName || ''
                if (dept) setDepartment(dept)

                // Use employeeId from DB if available, else keep generated fallback
                const dbEmpId = data.employeeId
                const finalEmpId = dbEmpId || empId
                if (finalEmpId) setEmployeeId(finalEmpId)

                // Re-run conflict check with DB employeeId
                if (finalEmpId && username) {
                  fetch(`/api/vacation-leave-requests?employeeId=${encodeURIComponent(finalEmpId)}&limit=1`)
                    .then(r2 => r2.json())
                    .then(d2 => {
                      if (d2.success && d2.rows && d2.rows.length > 0) {
                        const owner = d2.rows[0].created_by
                        const ownerName = d2.rows[0].employeeName || owner || ''
                        if (owner && owner !== username) {
                          setEmployeeIdConflict(true)
                          setConflictOwnerName(ownerName)
                        } else {
                          setEmployeeIdConflict(false)
                          setConflictOwnerName('')
                        }
                      } else {
                        setEmployeeIdConflict(false)
                        setConflictOwnerName('')
                      }
                    })
                    .catch(() => {})
                }
              }
            })
            .catch(() => {})
            .finally(() => setLoadingDept(false))
        }

        // Initial conflict check with localStorage employeeId (before API resolves)
        if (empId && username) {
          fetch(`/api/vacation-leave-requests?employeeId=${encodeURIComponent(empId)}&limit=1`)
            .then(r => r.json())
            .then(data => {
              if (data.success && data.rows && data.rows.length > 0) {
                const owner = data.rows[0].created_by
                const ownerName = data.rows[0].employeeName || owner || ''
                if (owner && owner !== username) {
                  setEmployeeIdConflict(true)
                  setConflictOwnerName(ownerName)
                }
              }
            })
            .catch(() => {})
        }
      }
    } catch {}

    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  const L = (en: string, th: string) => (locale === 'th' ? th : en)

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0
    const diff = end.getTime() - start.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
  }, [startDate, endDate])

  function validate() {
    const errs: string[] = []

    if (!employeeName.trim()) errs.push(L('Employee name is required', 'กรุณาระบุชื่อพนักงาน'))
    if (!employeeId.trim()) errs.push(L('Employee ID is required', 'กรุณาระบุรหัสพนักงาน'))
    if (!department.trim()) errs.push(L('Department is required', 'กรุณาระบุแผนก'))
    if (!startDate) errs.push(L('Start date is required', 'กรุณาระบุวันเริ่มลา'))
    if (!endDate) errs.push(L('End date is required', 'กรุณาระบุวันสิ้นสุดลา'))
    if (!reason.trim()) errs.push(L('Reason is required', 'กรุณาระบุเหตุผลการลา'))
    if (!requester.trim()) errs.push(L('Approval requester name is required', 'กรุณาระบุผู้ขออนุมัติ'))

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      errs.push(L('End date must be later than or equal to start date', 'วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มลา'))
    }

    setErrors(errs)
    return errs.length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (employeeIdConflict) {
      setMessageBar({ type: 'error', text: L('Cannot submit: Employee ID conflict. Please contact admin.', 'ไม่สามารถส่งได้: รหัสพนักงานซ้ำกัน กรุณาติดต่อผู้ดูแลระบบ') })
      return
    }

    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('k_system_admin_user') || '{}')
      const createdBy = user?.username || user?.name || 'system'

      const payload: LeaveRequestRecord = {
        requestDate,
        employeeName: employeeName.trim(),
        employeeId: employeeId.trim(),
        userId: userIdInt ?? undefined,
        department: department.trim(),
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason: reason.trim(),
        contactPhone: contactPhone.trim(),
        backupPerson: backupPerson.trim(),
        requester: requester.trim()
      }

      const res = await fetch('/api/vacation-leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, createdBy, branch: 'thailand' })
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit request')
      }

      setRequestNo(result.vlrNo || requestNo)

      setMessageBar({
        type: 'success',
        text: L(
          `Vacation leave request submitted successfully (${result.vlrNo})`,
          `ส่งคำขออนุมัติลาพักร้อนสำเร็จ (${result.vlrNo})`
        )
      })

      setTimeout(() => {
        router.push('/Thailand/Admin-Login/documents')
      }, 900)
    } catch (error) {
      console.error(error)
      setMessageBar({ type: 'error', text: L('Failed to submit request', 'ไม่สามารถส่งคำขอได้') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Create Vacation Leave Approval" titleTh="สร้างคำขออนุมัติลาพักร้อน">
      {messageBar && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '16px',
            borderRadius: 8,
            color: messageBar.type === 'error' ? '#7f1d1d' : '#064e3b',
            background: messageBar.type === 'error' ? '#fee2e2' : '#ecfdf5',
            border: messageBar.type === 'error' ? '1px solid #fca5a5' : '1px solid #86efac'
          }}
        >
          {messageBar.text}
        </div>
      )}

      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {L('Vacation Leave Approval Request', 'แบบฟอร์มขออนุมัติลาพักร้อน')}
          </h2>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Request No.', 'เลขที่คำขอ')}</label>
                <input className={styles.formInput} value={requestNo} disabled style={{ background: '#f5f5f5' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Request Date', 'วันที่ยื่นคำขอ')}</label>
                <input className={styles.formInput} type="date" value={requestDate} disabled style={{ background: '#f5f5f5' }} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Employee Name', 'ชื่อพนักงาน')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input className={styles.formInput} value={employeeName} readOnly style={{ background: '#f5f5f5', cursor: 'not-allowed' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Employee ID', 'รหัสพนักงาน')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input className={styles.formInput} value={employeeId} readOnly style={{ background: '#f5f5f5', cursor: 'not-allowed' }} />
                {employeeIdConflict && (
                  <div style={{ marginTop: 4, fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                    ⚠️ {L(
                      `This Employee ID is already registered to: ${conflictOwnerName || 'another account'}. Please contact admin.`,
                      `รหัสพนักงานนี้เป็นของ: ${conflictOwnerName || 'บัญชีอื่น'} อยู่แล้ว กรุณาติดต่อผู้ดูแลระบบ`
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Department', 'แผนก')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={loadingDept ? L('Loading...', 'กำลังโหลด...') : department}
                  readOnly
                  placeholder={L('Auto-filled from database', 'โหลดจากฐานข้อมูลอัตโนมัติ')}
                  style={{ background: '#f3f4f6', cursor: 'default' }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Leave Type', 'ประเภทการลา')}</label>
                <select className={styles.formInput} value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                  <option value="annual_leave">{L('Annual Leave', 'ลาพักร้อน')}</option>
                  <option value="personal_leave">{L('Personal Leave', 'ลากิจ')}</option>
                  <option value="sick_leave">{L('Sick Leave', 'ลาป่วย')}</option>
                  <option value="other">{L('Other', 'อื่น ๆ')}</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Start Date', 'วันเริ่มลา')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input className={styles.formInput} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('End Date', 'วันสิ้นสุดลา')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input className={styles.formInput} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Total Leave Days', 'จำนวนวันที่ลา')}</label>
                <input className={styles.formInput} value={totalDays || ''} disabled placeholder="0" style={{ background: '#f5f5f5' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Contact Phone During Leave', 'เบอร์ติดต่อระหว่างลา')}</label>
                <input className={styles.formInput} value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder={L('Enter phone number', 'กรอกเบอร์ติดต่อ')} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Work Handover To', 'ผู้รับมอบหมายงาน')}</label>
                <input className={styles.formInput} value={backupPerson} onChange={e => setBackupPerson(e.target.value)} placeholder={L('Name of backup person', 'ชื่อผู้รับมอบหมายงาน')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Approval Requester', 'ผู้ขออนุมัติ')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input className={styles.formInput} value={requester} onChange={e => setRequester(e.target.value)} placeholder={L('Requester name', 'ชื่อผู้ขออนุมัติ')} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Reason for Leave', 'เหตุผลการลา')} <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea className={styles.formInput} rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder={L('Please provide reason', 'โปรดระบุเหตุผลการลา')} />
            </div>

            {errors.length > 0 && (
              <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5', color: '#7f1d1d' }}>
                {errors.map((err, idx) => (
                  <div key={idx}>• {err}</div>
                ))}
              </div>
            )}

            <div className={styles.formRow} style={{ justifyContent: 'space-between', marginTop: 30 }}>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? L('Submitting...', 'กำลังส่งคำขอ...') : L('Submit Leave Request', 'ส่งคำขอลาพักร้อน')}
              </button>
              <button type="button" className={styles.btnOutline} onClick={() => router.push('/Thailand/Admin-Login/documents')}>
                {L('Back to Documents', 'กลับไปหน้าเอกสาร')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
