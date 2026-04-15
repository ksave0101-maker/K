"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/app/KR-Thailand/Admin-Login/components/AdminLayout'

export default function CreateVacationLeaveRequestPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [locale, setLocale] = useState<'en' | 'th'>('th')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [requestDate, setRequestDate] = useState(() => new Date().toISOString().split('T')[0])
  const [employeeName, setEmployeeName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [department, setDepartment] = useState('')
  const [leaveType, setLeaveType] = useState<'annual_leave' | 'personal_leave' | 'sick_leave' | 'other'>('annual_leave')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [backupPerson, setBackupPerson] = useState('')
  const [requester, setRequester] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setMounted(true)
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l)

      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const user = JSON.parse(raw)
        const name = user?.name || user?.fullname || user?.username || ''
        if (name) setRequester(name)
      }
    } catch {}
  }, [])

  const L = (en: string, th: string) => (locale === 'th' ? th : en)

  const totalDays = (() => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0
    const msPerDay = 24 * 60 * 60 * 1000
    return Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1
  })()

  const validate = () => {
    if (!employeeName || !employeeId || !department || !startDate || !endDate || !reason || !requester) {
      setMessage({ type: 'error', text: L('Please fill all required fields', 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ') })
      return false
    }
    if (new Date(endDate) < new Date(startDate)) {
      setMessage({ type: 'error', text: L('End date must be after start date', 'วันที่สิ้นสุดต้องไม่น้อยกว่าวันที่เริ่มต้น') })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!validate()) return

    setLoading(true)
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      const user = raw ? JSON.parse(raw) : {}
      const createdBy = user?.username || user?.name || 'system'

      const res = await fetch('/api/vacation-leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestDate,
          employeeName,
          employeeId,
          department,
          leaveType,
          startDate,
          endDate,
          totalDays,
          reason,
          contactPhone: contactPhone || null,
          backupPerson: backupPerson || null,
          requester,
          notes: notes || null,
          createdBy,
          branch: 'thailand'
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed')
      }

      setMessage({ type: 'success', text: L('Leave request created successfully', 'สร้างคำขออนุมัติลาสำเร็จ') })
      setTimeout(() => router.push('/Thailand/Admin-Login/documents/vacation-leave-requests'), 800)
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : L('Unknown error', 'ข้อผิดพลาดที่ไม่ทราบสาเหตุ')
      setMessage({ type: 'error', text })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <AdminLayout title="Create Leave Request" titleTh="สร้างคำขออนุมัติลา">
        <div style={{ padding: 24 }}>Loading...</div>
      </AdminLayout>
    )
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    marginTop: 6,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #d1d5db',
    background: 'white',
    fontSize: 14,
    outline: 'none'
  }

  const sectionTitleStyle: React.CSSProperties = {
    margin: 0,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: 700,
    color: '#111827'
  }

  return (
    <AdminLayout title="Create Leave Request" titleTh="สร้างคำขออนุมัติลา">
      {message && (
        <div
          style={{
            padding: '12px 14px',
            marginBottom: 16,
            borderRadius: 8,
            border: message.type === 'success' ? '1px solid #86efac' : '1px solid #fca5a5',
            background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'success' ? '#166534' : '#991b1b'
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', background: 'white' }}>
        <div style={{ background: 'linear-gradient(120deg, #1d4ed8, #0ea5e9)', color: 'white', padding: '18px 20px' }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{L('Leave Approval Request', 'ยื่นขออนุมัติลา')}</h2>
          <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: 13 }}>
            {L('Fill out required fields marked with *', 'กรอกข้อมูลที่จำเป็นเครื่องหมาย * ให้ครบถ้วน')}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'grid', gap: 14 }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, background: '#f8fafc' }}>
            <h3 style={sectionTitleStyle}>{L('Employee Information', 'ข้อมูลพนักงาน')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <label>{L('Request Date', 'วันที่ยื่นคำขอ')} *<input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} style={fieldStyle} /></label>
              <label>{L('Employee Name', 'ชื่อพนักงาน')} *<input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} style={fieldStyle} /></label>
              <label>{L('Employee ID', 'รหัสพนักงาน')} *<input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} style={fieldStyle} /></label>
              <label>{L('Department', 'แผนก')} *<input value={department} onChange={(e) => setDepartment(e.target.value)} style={fieldStyle} /></label>
              <label>{L('Requester', 'ผู้ยื่นคำขอ')} *<input value={requester} onChange={(e) => setRequester(e.target.value)} style={fieldStyle} /></label>
            </div>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
            <h3 style={sectionTitleStyle}>{L('Leave Details', 'รายละเอียดการลา')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <label>
                {L('Leave Type', 'ประเภทการลา')} *
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value as typeof leaveType)} style={fieldStyle}>
                  <option value="annual_leave">{L('Annual Leave', 'ลาพักร้อน')}</option>
                  <option value="personal_leave">{L('Personal Leave', 'ลากิจ')}</option>
                  <option value="sick_leave">{L('Sick Leave', 'ลาป่วย')}</option>
                  <option value="other">{L('Other', 'อื่น ๆ')}</option>
                </select>
              </label>
              <label>{L('Start Date', 'วันที่เริ่มลา')} *<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={fieldStyle} /></label>
              <label>{L('End Date', 'วันที่สิ้นสุด')} *<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={fieldStyle} /></label>
              <label>{L('Total Days', 'จำนวนวันลา')}<input value={String(totalDays)} disabled style={{ ...fieldStyle, background: '#f3f4f6', color: '#6b7280' }} /></label>
              <label>{L('Contact Phone', 'เบอร์ติดต่อ')}<input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={fieldStyle} /></label>
              <label>{L('Backup Person', 'ผู้รับผิดชอบแทน')}<input value={backupPerson} onChange={(e) => setBackupPerson(e.target.value)} style={fieldStyle} /></label>
            </div>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }}>
            <h3 style={sectionTitleStyle}>{L('Reason & Notes', 'เหตุผลและหมายเหตุ')}</h3>
            <label style={{ display: 'block' }}>
              {L('Reason', 'เหตุผลการลา')} *
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} style={{ ...fieldStyle, resize: 'vertical' }} />
            </label>
            <label style={{ display: 'block', marginTop: 12 }}>
              {L('Notes', 'หมายเหตุ')}
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ ...fieldStyle, resize: 'vertical' }} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="submit" disabled={loading} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
              {loading ? L('Saving...', 'กำลังบันทึก...') : L('Create Document', 'สร้างเอกสาร')}
            </button>
            <button type="button" onClick={() => router.push('/Thailand/Admin-Login/documents/vacation-leave-requests')} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontWeight: 600 }}>
              {L('Back', 'ย้อนกลับ')}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
