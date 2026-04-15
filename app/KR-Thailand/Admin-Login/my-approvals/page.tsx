"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type HrEmployee = {
  empID: number
  employeeId: string
  username: string
  affix: string | null
  firstName: string
  lastName: string
  firstNameTh: string | null
  lastNameTh: string | null
  jobTitle: string | null
  gender: string | null
  birthDate: string | null
  contactNumber: string | null
  startDate: string | null
  probationEnd: string | null
  employeeStatus: string
  monthlySalary: number | null
  bankName: string | null
  bankAccount: string | null
  branch: string | null
  annualLeaveEntitlement: number
  annualLeaveCarryForward: number
  annualLeaveUsed: number
  sickLeaveEntitlement: number
  sickLeaveUsed: number
  personalLeaveEntitlement: number
  personalLeaveUsed: number
}

type User = {
  username?: string
  fullname?: string
  name?: string
  typeID?: number
  site?: string
}

type LeaveRequest = {
  vlrID: number
  vlrNo: string
  requestDate: string | null
  employeeName: string
  employeeId: string
  department: string
  leaveType: 'annual_leave' | 'personal_leave' | 'sick_leave' | 'other'
  startDate: string
  endDate: string
  totalDays: number
  reason: string | null
  contactPhone: string | null
  backupPerson: string | null
  approver: string | null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by: string | null
  approved_at: string | null
  notes: string | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

const STATUS_CONFIG: Record<string, { labelEn: string; labelTh: string; bg: string; color: string; icon: string }> = {
  pending:   { labelEn: 'Pending',   labelTh: 'รออนุมัติ',  bg: '#fef9c3', color: '#92400e', icon: '⏳' },
  approved:  { labelEn: 'Approved',  labelTh: 'อนุมัติแล้ว', bg: '#dcfce7', color: '#166534', icon: '✅' },
  rejected:  { labelEn: 'Rejected',  labelTh: 'ไม่อนุมัติ', bg: '#fee2e2', color: '#991b1b', icon: '❌' },
  cancelled: { labelEn: 'Cancelled', labelTh: 'ยกเลิก',    bg: '#f3f4f6', color: '#4b5563', icon: '🚫' },
}

const LEAVE_TYPE_LABEL: Record<string, { en: string; th: string }> = {
  annual_leave:   { en: 'Annual Leave',   th: 'ลาพักร้อน' },
  personal_leave: { en: 'Personal Leave', th: 'ลากิจ' },
  sick_leave:     { en: 'Sick Leave',     th: 'ลาป่วย' },
  other:          { en: 'Other',          th: 'อื่นๆ' },
}

export default function MyApprovalsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [lang, setLang] = useState<'en' | 'th'>('th')
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [empProfile, setEmpProfile] = useState<HrEmployee | null>(null)

  // Prevent hydration mismatch — nothing renders during SSR or first client paint
  const [mounted, setMounted] = useState(false)

  // Verification gate
  const [verified, setVerified] = useState(false)
  const [verifyUsername, setVerifyUsername] = useState('')
  const [verifyPassword, setVerifyPassword] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [userList, setUserList] = useState<{ userName: string; name: string; displayName: string; displayNameTh: string; typeID: number }[]>([])
  const [isAdminSession, setIsAdminSession] = useState(false)

  const L = (en: string, th: string) => lang === 'th' ? th : en

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!verifyUsername.trim() || !verifyPassword.trim()) {
      setVerifyError(lang === 'th' ? 'กรุณากรอก Username และ Password' : 'Please enter username and password')
      return
    }
    setVerifyLoading(true)
    setVerifyError('')
    try {
      const res = await fetch('/api/auth/mysql-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: verifyUsername.trim(), password: verifyPassword.trim() })
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setVerifyError(lang === 'th' ? 'Username หรือ Password ไม่ถูกต้อง' : 'Incorrect username or password')
        return
      }
      // Set user from verified identity
      setUser({ username: data.username, name: data.name, typeID: data.typeID, site: data.site })
      setVerified(true)
    } catch {
      setVerifyError(lang === 'th' ? 'ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่' : 'Connection error, please try again')
    } finally {
      setVerifyLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)

    // Language
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLang(l)
    } catch {}

    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLang(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)

    // Auto-verify if admin session already exists in localStorage
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const stored = JSON.parse(raw)
        const isAdmin = [1, 2, 7].includes(Number(stored?.typeID))
        if (isAdmin && stored?.username) {
          setUser({
            username: stored.username,
            name: stored.name || stored.fullname,
            typeID: stored.typeID,
            site: stored.site,
          })
          setVerified(true)
          setIsAdminSession(true)
        } else if (stored?.username) {
          // Pre-fill gate for non-admin
          setVerifyUsername(stored.username)
        }
      }
    } catch {}

    // Fetch user list for the picker
    fetch('/api/auth/user-list?site=Thailand')
      .then(r => r.json())
      .then(d => { if (d.success) setUserList(d.users || []) })
      .catch(() => {})

    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  const fetchRequests = useCallback(async (u: User) => {
    setLoading(true)
    setError(null)
    try {
      const username = u.username || u.name || ''
      if (!username) {
        setRequests([])
        return
      }
      const res = await fetch(`/api/vacation-leave-requests?createdBy=${encodeURIComponent(username)}&limit=200`)
      const data = await res.json()
      if (data.success) {
        setRequests(data.rows || [])
      } else {
        setError(data.error || 'Failed to load')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchRequests(user)
  }, [user, fetchRequests])

  useEffect(() => {
    const username = user?.username || user?.name || ''
    if (!username) return
    fetch(`/api/hr-employees?username=${encodeURIComponent(username)}`)
      .then(r => r.json())
      .then(d => { if (d.success && d.employees?.length > 0) setEmpProfile(d.employees[0]) })
      .catch(() => {})
  }, [user])

  const filtered = filterStatus === 'all'
    ? requests
    : requests.filter(r => r.status === filterStatus)

  // Notifications: approved or rejected in the last 7 days
  const recentNotifications = requests.filter(r => {
    if (r.status !== 'approved' && r.status !== 'rejected') return false
    if (!r.updated_at) return false
    const updated = new Date(r.updated_at)
    const diff = Date.now() - updated.getTime()
    return diff < 7 * 24 * 60 * 60 * 1000
  })

  const countByStatus = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  }

  const formatDate = (d: string | null) => {
    if (!d) return '-'
    return String(d).slice(0, 10)
  }

  const displayName = user?.fullname || user?.name || user?.username || ''

  // SSR and first client paint both return null → no hydration mismatch
  if (!mounted) return null

  if (!verified) {
    const selectedUser = userList.find(u => u.userName === verifyUsername)

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '36px 32px',
          width: '100%', maxWidth: 440,
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)'
        }}>
          {/* Icon + title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: '0 auto 14px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1e1b4b' }}>
              {L('My Approvals', 'การอนุมัติของฉัน')}
            </h2>
            <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>
              {L(
                'Select your name and enter your password to verify identity',
                'เลือกชื่อของคุณและกรอก Password เพื่อยืนยันตัวตน'
              )}
            </p>
          </div>

          <form onSubmit={handleVerify}>

            {/* Step 1: User picker */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                {L('Step 1 — Select your account', 'ขั้นที่ 1 — เลือกบัญชีของคุณ')}
              </label>

              {userList.length === 0 ? (
                <div style={{ padding: '10px 13px', background: '#f8fafc', borderRadius: 9, border: '1.5px solid #e2e8f0', color: '#94a3b8', fontSize: 13 }}>
                  {L('Loading users...', 'กำลังโหลด...')}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 220, overflowY: 'auto', padding: 2 }}>
                  {userList.map(u => {
                    const isSelected = verifyUsername === u.userName
                    return (
                      <button
                        key={u.userName}
                        type="button"
                        onClick={() => {
                          setVerifyUsername(u.userName)
                          setVerifyError('')
                          if (isAdminSession) {
                            // Admin: bypass password — set user directly from picker
                            setUser({ username: u.userName, name: u.displayName, typeID: u.typeID, site: 'Thailand' })
                            setVerified(true)
                          }
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: isSelected ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                          background: isSelected ? 'linear-gradient(135deg, #ede9fe, #dbeafe)' : '#f8fafc',
                          cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.15s',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: isSelected ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : '#e2e8f0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, color: isSelected ? '#fff' : '#64748b', fontWeight: 700,
                        }}>
                          {(lang === 'th' ? u.displayNameTh : u.displayName).charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#4c1d95' : '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lang === 'th' ? u.displayNameTh : u.displayName}
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>@{u.userName}</div>
                        </div>
                        {isSelected && (
                          <div style={{ marginLeft: 'auto', flexShrink: 0, color: '#7c3aed', fontSize: 16 }}>✓</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Show selected badge */}
            {selectedUser && (
              <div style={{
                marginBottom: 16, padding: '10px 14px',
                background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
                border: '1px solid #c4b5fd', borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>👤</span>
                <div>
                  <span style={{ fontWeight: 700, color: '#4c1d95', fontSize: 14 }}>
                    {lang === 'th' ? selectedUser.displayNameTh : selectedUser.displayName}
                  </span>
                  <span style={{ fontSize: 12, color: '#7c3aed', marginLeft: 8 }}>@{selectedUser.userName}</span>
                </div>
              </div>
            )}

            {/* Step 2: Password — only show after user selected, hidden for admin */}
            {verifyUsername && !isAdminSession && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  {L('Step 2 — Enter your password', 'ขั้นที่ 2 — กรอก Password ของคุณ')}
                </label>
                <input
                  type="password"
                  value={verifyPassword}
                  onChange={e => { setVerifyPassword(e.target.value); setVerifyError('') }}
                  autoComplete="current-password"
                  autoFocus
                  placeholder={L('Enter your password', 'กรอก Password')}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '11px 13px', borderRadius: 9,
                    border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none'
                  }}
                />
              </div>
            )}

            {verifyError && (
              <div style={{
                marginBottom: 14, padding: '10px 13px',
                background: '#fee2e2', border: '1px solid #fca5a5',
                borderRadius: 8, color: '#991b1b', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                ⚠️ {verifyError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  flex: 1, padding: '11px', borderRadius: 9,
                  border: '1.5px solid #d1d5db', background: '#fff',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151'
                }}
              >
                {L('Back', 'ย้อนกลับ')}
              </button>
              <button
                type="submit"
                disabled={verifyLoading || !verifyUsername || (!isAdminSession && !verifyPassword)}
                style={{
                  flex: 2, padding: '11px', borderRadius: 9, border: 'none',
                  background: (verifyLoading || !verifyUsername || (!isAdminSession && !verifyPassword))
                    ? '#a78bfa'
                    : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  cursor: (verifyLoading || !verifyUsername || (!isAdminSession && !verifyPassword)) ? 'not-allowed' : 'pointer',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                }}
              >
                {verifyLoading
                  ? L('Verifying...', 'กำลังตรวจสอบ...')
                  : L('Confirm & View', 'ยืนยันและดูข้อมูล')}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>🔔</span>
                {L('My Approvals', 'การอนุมัติของฉัน')}
              </h1>
              <p className={styles.subtitle}>
                {displayName
                  ? L(`Hello, ${displayName}`, `สวัสดี, ${displayName}`)
                  : L('Your personal approval notification area', 'พื้นที่แจ้งเตือนการอนุมัติส่วนตัว')}
              </p>
            </div>
            <button
              onClick={() => router.push('/KR-Thailand/Admin-Login/documents/vacation-leave/create')}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
              }}
            >
              <span>＋</span>
              {L('New Leave Request', 'ยื่นคำขอลา')}
            </button>
          </div>
        </div>

        {/* HR Employee Profile Card */}
        {empProfile && (
          <div style={{
            marginBottom: 24,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
            border: '1px solid #bbf7d0',
          }}>
            {/* Top stripe */}
            <div style={{
              background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #16a34a 100%)',
              padding: '18px 24px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0,
              }}>👤</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>
                  {lang === 'th' && (empProfile.firstNameTh || empProfile.lastNameTh)
                    ? `${empProfile.firstNameTh ?? ''} ${empProfile.lastNameTh ?? ''}`.trim()
                    : `${empProfile.affix ? empProfile.affix + ' ' : ''}${empProfile.firstName} ${empProfile.lastName}`
                  }
                </div>
                <div style={{ color: '#bbf7d0', fontSize: 13, marginTop: 2 }}>
                  {lang === 'th'
                    ? `${empProfile.affix ? empProfile.affix + ' ' : ''}${empProfile.firstName} ${empProfile.lastName}`
                    : (empProfile.firstNameTh || empProfile.lastNameTh)
                      ? `${empProfile.firstNameTh ?? ''} ${empProfile.lastNameTh ?? ''}`.trim()
                      : ''
                  }
                </div>
                <div style={{ color: '#a7f3d0', fontSize: 13, marginTop: 4 }}>
                  {empProfile.jobTitle || ''}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.15)', borderRadius: 8,
                  padding: '4px 12px', color: '#fff', fontSize: 12, fontWeight: 700,
                }}>{empProfile.employeeId}</div>
                <div style={{
                  marginTop: 6,
                  background: empProfile.employeeStatus === 'Permanent' ? 'rgba(255,255,255,0.2)' : 'rgba(251,191,36,0.3)',
                  borderRadius: 6, padding: '3px 10px',
                  color: '#fff', fontSize: 11, fontWeight: 600,
                }}>{{Permanent:L('Permanent','พนักงานประจำ'),Probation:L('Probation','ทดลองงาน'),Contract:L('Contract','สัญญาจ้าง'),Resigned:L('Resigned','ลาออก'),Terminated:L('Terminated','พ้นสภาพ')}[empProfile.employeeStatus] ?? empProfile.employeeStatus}</div>
              </div>
            </div>

            {/* Info row */}
            <div style={{
              background: '#f0fdf4', padding: '14px 24px',
              display: 'flex', flexWrap: 'wrap', gap: '12px 32px',
              borderBottom: '1px solid #bbf7d0',
            }}>
              {empProfile.contactNumber && (
                <div style={{ fontSize: 13, color: '#374151' }}>
                  <span style={{ color: '#6b7280', marginRight: 6 }}>📞</span>{empProfile.contactNumber}
                </div>
              )}
              {empProfile.startDate && (
                <div style={{ fontSize: 13, color: '#374151' }}>
                  <span style={{ color: '#6b7280', marginRight: 6 }}>📅</span>
                  {L('Start Date', 'วันเริ่มงาน')}: {String(empProfile.startDate).slice(0,10)}
                </div>
              )}
              {empProfile.branch && (
                <div style={{ fontSize: 13, color: '#374151' }}>
                  <span style={{ color: '#6b7280', marginRight: 6 }}>🏢</span>{empProfile.branch}
                </div>
              )}
            </div>

            {/* Leave Balance */}
            <div style={{ background: '#fff', padding: '16px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 12 }}>
                {L('Leave Balance 2026', 'สิทธิ์การลา 2566')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {([
                  { label: L('Annual Leave','ลาพักร้อน'), icon: '🌴',
                    entitlement: empProfile.annualLeaveEntitlement + empProfile.annualLeaveCarryForward,
                    used: empProfile.annualLeaveUsed,
                    color: '#7c3aed', bg: '#f5f3ff' },
                  { label: L('Sick Leave','ลาป่วย'), icon: '🏥',
                    entitlement: empProfile.sickLeaveEntitlement,
                    used: empProfile.sickLeaveUsed,
                    color: '#dc2626', bg: '#fef2f2' },
                  { label: L('Personal Leave','ลากิจ'), icon: '📝',
                    entitlement: empProfile.personalLeaveEntitlement,
                    used: empProfile.personalLeaveUsed,
                    color: '#0369a1', bg: '#f0f9ff' },
                ] as const).map(item => {
                  const balance = item.entitlement - item.used
                  const pct = item.entitlement > 0 ? Math.round((balance / item.entitlement) * 100) : 0
                  return (
                    <div key={item.label} style={{
                      background: item.bg, borderRadius: 10, padding: '12px 14px',
                      border: `1px solid ${item.color}22`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 16 }}>{item.icon}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{balance}</span>
                      </div>
                      {/* Progress bar */}
                      <div style={{ background: `${item.color}22`, borderRadius: 4, height: 5, overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          background: item.color, borderRadius: 4,
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                        <span style={{ fontSize: 10, color: '#6b7280' }}>{L('Used','ใช้ไป')}: {item.used}</span>
                        <span style={{ fontSize: 10, color: '#6b7280' }}>{L('Total','สิทธิ์')}: {item.entitlement}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent Notifications Banner */}
        {recentNotifications.length > 0 && (
          <div style={{
            marginBottom: 24,
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
            border: '1px solid #c4b5fd',
            borderRadius: 12,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#4c1d95', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🆕</span>
              {L(`${recentNotifications.length} recent update(s) in the last 7 days`, `มีการอัพเดต ${recentNotifications.length} รายการใน 7 วันที่ผ่านมา`)}
            </div>
            {recentNotifications.map(r => {
              const cfg = STATUS_CONFIG[r.status]
              return (
                <div key={r.vlrID} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  background: '#fff',
                  borderRadius: 8,
                  marginBottom: 6,
                  border: `1px solid ${cfg.bg}`,
                }}>
                  <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.vlrNo}</span>
                    <span style={{ color: '#64748b', fontSize: 13, marginLeft: 8 }}>
                      {L('Leave', 'คำขอลา')} {formatDate(r.startDate)} – {formatDate(r.endDate)}
                    </span>
                  </div>
                  <span style={{
                    padding: '2px 12px',
                    borderRadius: 20,
                    background: cfg.bg,
                    color: cfg.color,
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    {L(cfg.labelEn, cfg.labelTh)}
                  </span>
                  {r.approved_by && (
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      {L('by', 'โดย')} {r.approved_by}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
          {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as const).map(key => {
            const count = key === 'all' ? requests.length : countByStatus[key as keyof typeof countByStatus] ?? 0
            const cfg = key === 'all'
              ? { bg: '#f1f5f9', color: '#334155', icon: '📋', labelEn: 'All', labelTh: 'ทั้งหมด' }
              : { ...STATUS_CONFIG[key] }
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                style={{
                  padding: '14px 10px',
                  borderRadius: 12,
                  background: filterStatus === key ? cfg.bg : '#fff',
                  border: `2px solid ${filterStatus === key ? cfg.color : '#e2e8f0'}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{cfg.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>{count}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{L(cfg.labelEn, cfg.labelTh)}</div>
              </button>
            )
          })}
        </div>

        {/* Request List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            {L('Loading...', 'กำลังโหลด...')}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fee2e2', borderRadius: 12, color: '#991b1b' }}>
            ❌ {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div style={{ fontSize: 16 }}>{L('No requests found', 'ยังไม่มีคำขอ')}</div>
            <button
              onClick={() => router.push('/KR-Thailand/Admin-Login/documents/vacation-leave/create')}
              style={{ marginTop: 16, padding: '10px 24px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            >
              {L('Create First Request', 'สร้างคำขอแรก')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(r => {
              const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending
              const leaveLabel = LEAVE_TYPE_LABEL[r.leaveType] || { en: r.leaveType, th: r.leaveType }
              const isExpanded = expandedId === r.vlrID
              return (
                <div
                  key={r.vlrID}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    border: `1px solid ${isExpanded ? '#a5b4fc' : '#e2e8f0'}`,
                    overflow: 'hidden',
                    boxShadow: isExpanded ? '0 4px 16px rgba(99,102,241,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : r.vlrID)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 18px',
                      cursor: 'pointer',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{cfg.icon}</span>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>{r.vlrNo}</div>
                      <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                        {L(leaveLabel.en, leaveLabel.th)} • {r.totalDays} {L('day(s)', 'วัน')} •{' '}
                        {formatDate(r.startDate)} → {formatDate(r.endDate)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        padding: '4px 14px',
                        borderRadius: 20,
                        background: cfg.bg,
                        color: cfg.color,
                        fontWeight: 700,
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                      }}>
                        {L(cfg.labelEn, cfg.labelTh)}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: 20 }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div style={{
                      padding: '0 18px 18px',
                      borderTop: '1px solid #f1f5f9',
                      background: '#fafafa',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14 }}>
                        <DetailRow label={L('Document No.', 'เลขที่เอกสาร')} value={r.vlrNo} />
                        <DetailRow label={L('Request Date', 'วันที่ขอ')} value={formatDate(r.requestDate)} />
                        <DetailRow label={L('Employee Name', 'ชื่อพนักงาน')} value={r.employeeName} />
                        <DetailRow label={L('Employee ID', 'รหัสพนักงาน')} value={r.employeeId} />
                        <DetailRow label={L('Department', 'แผนก')} value={r.department} />
                        <DetailRow label={L('Leave Type', 'ประเภทการลา')} value={L(leaveLabel.en, leaveLabel.th)} />
                        <DetailRow label={L('Start Date', 'วันที่เริ่ม')} value={formatDate(r.startDate)} />
                        <DetailRow label={L('End Date', 'วันที่สิ้นสุด')} value={formatDate(r.endDate)} />
                        <DetailRow label={L('Total Days', 'จำนวนวัน')} value={`${r.totalDays} ${L('day(s)', 'วัน')}`} />
                        <DetailRow label={L('Contact Phone', 'เบอร์ติดต่อ')} value={r.contactPhone || '-'} />
                        <DetailRow label={L('Backup Person', 'ผู้รับงานแทน')} value={r.backupPerson || '-'} />
                        <DetailRow label={L('Approver', 'ผู้อนุมัติ')} value={r.approver || '-'} />
                      </div>
                      {r.reason && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{L('Reason', 'เหตุผล')}</div>
                          <div style={{ padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, color: '#334155' }}>{r.reason}</div>
                        </div>
                      )}
                      {(r.status === 'approved' || r.status === 'rejected') && (
                        <div style={{
                          marginTop: 14,
                          padding: '12px 16px',
                          background: cfg.bg,
                          borderRadius: 10,
                          border: `1px solid ${cfg.color}30`,
                        }}>
                          <div style={{ fontWeight: 700, color: cfg.color, marginBottom: 6 }}>
                            {cfg.icon} {L(`Status: ${cfg.labelEn}`, `สถานะ: ${cfg.labelTh}`)}
                          </div>
                          {r.approved_by && (
                            <div style={{ fontSize: 13, color: '#475569' }}>
                              {L('By:', 'โดย:')} <strong>{r.approved_by}</strong>
                            </div>
                          )}
                          {r.approved_at && (
                            <div style={{ fontSize: 13, color: '#475569' }}>
                              {L('Date:', 'วันที่:')} {formatDate(r.approved_at)}
                            </div>
                          )}
                          {r.notes && (
                            <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
                              {L('Note:', 'หมายเหตุ:')} {r.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Refresh button */}
        {!loading && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              onClick={() => user && fetchRequests(user)}
              style={{ padding: '8px 24px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b', fontSize: 14 }}
            >
              🔄 {L('Refresh', 'รีเฟรช')}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{value || '-'}</div>
    </div>
  )
}
