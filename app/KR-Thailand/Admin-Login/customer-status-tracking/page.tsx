"use client"

import React, { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'

type CustomerActivity = {
  activityID: number
  activityDate: string
  salesStaffName: string
  customerName: string
  customerID: number | null
  activityType: string
  keyDiscussionSummary: string
  customerReaction: string
  technicalQuestionsRaised: string
  nextAction: string
  nextActionDate: string
  hqSupportNeeded: string
  created_at: string
}

type CustomerDetailed = {
  customerID: number
  customerCompanyName: string
  industryType: string
  locationProvince: string
  contactPersonName: string
  contactPosition: string
  phone: string
  email: string
  estimatedLoadKW: number
  estimatedSavingMonth: number
  estimatedMonthlySavingTHB: number
  salesOwner: string
  firstContactDate: string
  currentStage: string
  licensingProbability: number
  expectedContractMonth: string
  strategicImportance: string
  notes: string
  created_at: string
}

type ExistingCustomer = {
  id?: number
  cusID?: number
  code?: string
  name_th?: string
  name_en?: string
  phone?: string
  contact_name?: string
  email?: string
}

const reactionColors: Record<string, { color: string; bg: string }> = {
  'Positive': { color: '#065f46', bg: '#d1fae5' },
  'Neutral': { color: '#92400e', bg: '#fef3c7' },
  'Negative': { color: '#991b1b', bg: '#fee2e2' },
}

const importanceColors: Record<string, { color: string; bg: string }> = {
  'High': { color: '#991b1b', bg: '#fee2e2' },
  'Medium': { color: '#ea580c', bg: '#fed7aa' },
  'Low': { color: '#059669', bg: '#d1fae5' },
}

const stageColors: Record<string, { color: string; bg: string }> = {
  Lead: { color: '#1d4ed8', bg: '#dbeafe' },
  Prospect: { color: '#7c3aed', bg: '#ede9fe' },
  Qualified: { color: '#0f766e', bg: '#ccfbf1' },
  Proposal: { color: '#b45309', bg: '#fef3c7' },
  Negotiation: { color: '#c2410c', bg: '#ffedd5' },
  Won: { color: '#166534', bg: '#dcfce7' },
  Lost: { color: '#991b1b', bg: '#fee2e2' }
}

const tableShellStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
  borderRadius: 16,
  border: '1px solid #dbe4ee',
  overflow: 'hidden',
  boxShadow: '0 14px 34px rgba(15,23,42,0.06)'
}

const scrollWrapStyle: React.CSSProperties = {
  overflowX: 'auto',
  overflowY: 'hidden'
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  tableLayout: 'fixed'
}

const stickyHeadStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 1,
  background: '#f8fbff'
}

const headerCellStyle: React.CSSProperties = {
  padding: '14px 12px',
  textAlign: 'left',
  fontWeight: 700,
  color: '#475569',
  fontSize: 12,
  letterSpacing: 0.2,
  lineHeight: 1.45,
  borderBottom: '1px solid #dbe4ee',
  whiteSpace: 'normal'
}

const bodyCellStyle: React.CSSProperties = {
  padding: '14px 12px',
  fontSize: 13,
  color: '#334155',
  verticalAlign: 'top',
  borderBottom: '1px solid #eef2f7'
}

const subtleTextCellStyle: React.CSSProperties = {
  ...bodyCellStyle,
  color: '#64748b'
}

const clampTwoLineStyle: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: 1.55
}

const badgeStyle = (color: string, bg: string): React.CSSProperties => ({
  padding: '5px 10px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  color,
  background: bg,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 24
})

export default function CustomerStatusTrackingPage() {
  const [lang, setLang] = useState<'en' | 'th'>('th')
  const [activeTab, setActiveTab] = useState<'activities' | 'customers'>('activities')
  const [mounted, setMounted] = useState(false)

  // Activities state
  const [activities, setActivities] = useState<CustomerActivity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [activitySearch, setActivitySearch] = useState('')
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [editActivityID, setEditActivityID] = useState<number | null>(null)

  // Customers state
  const [customers, setCustomers] = useState<CustomerDetailed[]>([])
  const [customersLoading, setCustomersLoading] = useState(true)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [editCustomerID, setEditCustomerID] = useState<number | null>(null)

  // Existing customers from acc_customers and cus_detail
  const [existingCustomers, setExistingCustomers] = useState<ExistingCustomer[]>([])
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [searchSource, setSearchSource] = useState<'acc' | 'cus'>('cus')

  const [saving, setSaving] = useState(false)

  const [activityForm, setActivityForm] = useState({
    activityDate: new Date().toISOString().split('T')[0],
    salesStaffName: '',
    customerName: '',
    activityType: 'Follow-up',
    keyDiscussionSummary: '',
    customerReaction: 'Neutral',
    technicalQuestionsRaised: '',
    nextAction: '',
    nextActionDate: '',
    hqSupportNeeded: 'No'
  })

  const [customerForm, setCustomerForm] = useState({
    customerCompanyName: '',
    industryType: '',
    locationProvince: 'Bangkok',
    contactPersonName: '',
    contactPosition: '',
    phone: '',
    email: '',
    estimatedLoadKW: '',
    estimatedSavingMonth: '',
    estimatedMonthlySavingTHB: '',
    salesOwner: '',
    firstContactDate: new Date().toISOString().split('T')[0],
    currentStage: 'Lead',
    licensingProbability: '20',
    expectedContractMonth: '',
    strategicImportance: 'Low',
    notes: ''
  })

  const L = (en: string, th: string) => lang === 'th' ? th : en
  const dateLocale = lang === 'th' ? 'th-TH' : 'en-GB'
  const formatDate = (value?: string) => {
    if (!value) return '-'
    return new Date(value).toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
  const reactionLabel = (value?: string) => {
    switch (value) {
      case 'Positive':
        return L('Positive', 'เชิงบวก')
      case 'Negative':
        return L('Negative', 'เชิงลบ')
      case 'Neutral':
      default:
        return L('Neutral', 'กลางๆ')
    }
  }
  const hqSupportLabel = (value?: string) => {
    return value === 'Yes' ? L('Yes', 'ใช่') : L('No', 'ไม่')
  }

  useEffect(() => {
    setMounted(true)
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLang(l)
    } catch {}
    const handler: EventListener = (event) => {
      const detail = (event as CustomEvent<string | { locale?: string }>).detail
      const v = typeof detail === 'string' ? detail : detail?.locale
      if (v === 'en' || v === 'th') setLang(v)
    }
    window.addEventListener('locale-changed', handler)
    window.addEventListener('k-system-lang', handler)
    return () => {
      window.removeEventListener('locale-changed', handler)
      window.removeEventListener('k-system-lang', handler)
    }
  }, [])

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true)
    try {
      const res = await fetch('/api/customer-activities')
      const j = await res.json()
      if (j.ok) setActivities(j.data || [])
    } catch (e) {
      console.error('Failed to fetch activities:', e)
    }
    setActivitiesLoading(false)
  }, [])

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setCustomersLoading(true)
    try {
      const res = await fetch('/api/customers-detailed')
      const j = await res.json()
      if (j.ok) setCustomers(j.data || [])
    } catch (e) {
      console.error('Failed to fetch customers:', e)
    }
    setCustomersLoading(false)
  }, [])

  // Fetch existing customers from acc_customers
  const fetchExistingCustomers = useCallback(async (search?: string) => {
    try {
      const url = search
        ? `/api/accounting/customers?q=${encodeURIComponent(search)}`
        : '/api/accounting/customers'
      const res = await fetch(url)
      const j = await res.json()
      if (j.ok) {
        setExistingCustomers(j.data || [])
      }
    } catch (e) {
      console.error('Failed to fetch existing customers:', e)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
    fetchCustomers()
    fetchExistingCustomers()
  }, [fetchActivities, fetchCustomers, fetchExistingCustomers])

  // Activity handlers
  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editActivityID
        ? `/api/customer-activities?id=${editActivityID}`
        : '/api/customer-activities'

      const res = await fetch(url, {
        method: editActivityID ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityForm)
      })

      const j = await res.json()
      if (j.ok) {
        await fetchActivities()
        setShowActivityForm(false)
        setEditActivityID(null)
        resetActivityForm()
      } else {
        alert(j.error || 'Failed to save')
      }
    } catch (e) {
      console.error('Save error:', e)
      alert('Failed to save')
    }
    setSaving(false)
  }

  const handleActivityDelete = async (id: number) => {
    if (!confirm(L('Delete this activity?', 'ลบกิจกรรมนี้หรือไม่?'))) return
    try {
      const res = await fetch(`/api/customer-activities?id=${id}`, { method: 'DELETE' })
      const j = await res.json()
      if (j.ok) await fetchActivities()
      else alert(j.error || 'Failed to delete')
    } catch (e) {
      console.error('Delete error:', e)
      alert('Failed to delete')
    }
  }

  const handleActivityEdit = (activity: CustomerActivity) => {
    setEditActivityID(activity.activityID)
    setActivityForm({
      activityDate: activity.activityDate || new Date().toISOString().split('T')[0],
      salesStaffName: activity.salesStaffName || '',
      customerName: activity.customerName || '',
      activityType: activity.activityType || 'Follow-up',
      keyDiscussionSummary: activity.keyDiscussionSummary || '',
      customerReaction: activity.customerReaction || 'Neutral',
      technicalQuestionsRaised: activity.technicalQuestionsRaised || '',
      nextAction: activity.nextAction || '',
      nextActionDate: activity.nextActionDate || '',
      hqSupportNeeded: activity.hqSupportNeeded || 'No'
    })
    setShowActivityForm(true)
  }

  const resetActivityForm = () => {
    setActivityForm({
      activityDate: new Date().toISOString().split('T')[0],
      salesStaffName: '',
      customerName: '',
      activityType: 'Follow-up',
      keyDiscussionSummary: '',
      customerReaction: 'Neutral',
      technicalQuestionsRaised: '',
      nextAction: '',
      nextActionDate: '',
      hqSupportNeeded: 'No'
    })
  }

  // Customer handlers
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editCustomerID
        ? `/api/customers-detailed?id=${editCustomerID}`
        : '/api/customers-detailed'

      const res = await fetch(url, {
        method: editCustomerID ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm)
      })

      const j = await res.json()
      if (j.ok) {
        await fetchCustomers()
        setShowCustomerForm(false)
        setEditCustomerID(null)
        resetCustomerForm()
      } else {
        alert(j.error || 'Failed to save')
      }
    } catch (e) {
      console.error('Save error:', e)
      alert('Failed to save')
    }
    setSaving(false)
  }

  const handleCustomerDelete = async (id: number) => {
    if (!confirm(L('Delete this customer?', 'ลบลูกค้านี้หรือไม่?'))) return
    try {
      const res = await fetch(`/api/customers-detailed?id=${id}`, { method: 'DELETE' })
      const j = await res.json()
      if (j.ok) await fetchCustomers()
      else alert(j.error || 'Failed to delete')
    } catch (e) {
      console.error('Delete error:', e)
      alert('Failed to delete')
    }
  }

  const handleCustomerEdit = (customer: CustomerDetailed) => {
    setEditCustomerID(customer.customerID)
    setCustomerForm({
      customerCompanyName: customer.customerCompanyName || '',
      industryType: customer.industryType || '',
      locationProvince: customer.locationProvince || 'Bangkok',
      contactPersonName: customer.contactPersonName || '',
      contactPosition: customer.contactPosition || '',
      phone: customer.phone || '',
      email: customer.email || '',
      estimatedLoadKW: String(customer.estimatedLoadKW || ''),
      estimatedSavingMonth: String(customer.estimatedSavingMonth || ''),
      estimatedMonthlySavingTHB: String(customer.estimatedMonthlySavingTHB || ''),
      salesOwner: customer.salesOwner || '',
      firstContactDate: customer.firstContactDate || new Date().toISOString().split('T')[0],
      currentStage: customer.currentStage || 'Lead',
      licensingProbability: String(customer.licensingProbability || '20'),
      expectedContractMonth: customer.expectedContractMonth || '',
      strategicImportance: customer.strategicImportance || 'Low',
      notes: customer.notes || ''
    })
    setShowCustomerForm(true)
  }

  const resetCustomerForm = () => {
    setCustomerForm({
      customerCompanyName: '',
      industryType: '',
      locationProvince: 'Bangkok',
      contactPersonName: '',
      contactPosition: '',
      phone: '',
      email: '',
      estimatedLoadKW: '',
      estimatedSavingMonth: '',
      estimatedMonthlySavingTHB: '',
      salesOwner: '',
      firstContactDate: new Date().toISOString().split('T')[0],
      currentStage: 'Lead',
      licensingProbability: '20',
      expectedContractMonth: '',
      strategicImportance: 'Low',
      notes: ''
    })
  }

  const filteredActivities = activities.filter(a => {
    if (!activitySearch) return true
    const s = activitySearch.toLowerCase()
    return a.customerName?.toLowerCase().includes(s) ||
           a.salesStaffName?.toLowerCase().includes(s) ||
           a.activityType?.toLowerCase().includes(s) ||
           a.keyDiscussionSummary?.toLowerCase().includes(s)
  })

  const filteredCustomers = customers.filter(c => {
    if (!customerSearch) return true
    const s = customerSearch.toLowerCase()
    return c.customerCompanyName?.toLowerCase().includes(s) ||
           c.salesOwner?.toLowerCase().includes(s) ||
           c.industryType?.toLowerCase().includes(s) ||
           c.currentStage?.toLowerCase().includes(s)
  })

  if (!mounted) {
    return (
      <AdminLayout
        title="Customer Status Tracking"
        titleTh="ติดตามงานอัพเดตสถานะลูกค้า"
      >
        <div style={{ padding: '20px 24px 32px', textAlign: 'center', paddingTop: 60, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>
          <div style={{ color: '#94a3b8' }}>{L('Loading...', 'กำลังโหลด...')}</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Customer Status Tracking"
      titleTh="ติดตามงานอัพเดตสถานะลูกค้า"
    >
      <div style={{ padding: '20px 24px 32px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: 4
            }}>
              {L('Customer Status Tracking', 'ติดตามงานอัพเดตสถานะลูกค้า')}
            </h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              {L('Track customer activities and manage customer database', 'ติดตามกิจกรรมและจัดการข้อมูลลูกค้า')}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          borderBottom: '2px solid #e2e8f0'
        }}>
          <button
            onClick={() => setActiveTab('activities')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'activities' ? 'white' : 'transparent',
              color: activeTab === 'activities' ? '#2563eb' : '#64748b',
              border: 'none',
              borderBottom: activeTab === 'activities' ? '3px solid #2563eb' : '3px solid transparent',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: -2
            }}
          >
            {L('Sales Activities', 'กิจกรรมการขาย')}
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'customers' ? 'white' : 'transparent',
              color: activeTab === 'customers' ? '#2563eb' : '#64748b',
              border: 'none',
              borderBottom: activeTab === 'customers' ? '3px solid #2563eb' : '3px solid transparent',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: -2
            }}
          >
            {L('Customer Information', 'ข้อมูลลูกค้า')}
          </button>
        </div>

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <>
            {/* Activity Controls */}
            <div style={{
              background: 'white',
              borderRadius: 10,
              padding: 16,
              marginBottom: 20,
              border: '1px solid #e2e8f0',
              boxShadow: 'none'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569' }}>
                    {L('Search Activities', 'ค้นหากิจกรรม')}
                  </label>
                  <input
                    type="text"
                    placeholder={L('Search by customer, staff, activity...', 'ค้นหาลูกค้า, พนักงาน, กิจกรรม...')}
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                </div>
                <div style={{ minWidth: 200 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569' }}>
                    {L('Quick Add from Customer DB', 'เพิ่มจาก DB ลูกค้า')}
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder={L('Customer name...', 'ชื่อลูกค้า...')}
                      value={customerSearchTerm}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value)
                        if (e.target.value.length > 1) {
                          fetchExistingCustomers(e.target.value)
                        }
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && customerSearchTerm.trim()) {
                          try {
                            const res = await fetch(`/api/accounting/customers?q=${encodeURIComponent(customerSearchTerm)}`)
                            const j = await res.json()
                            if (j.ok && j.data && j.data.length > 0) {
                              const cust = j.data[0]
                              setActivityForm({
                                ...activityForm,
                                customerName: cust.name_th || cust.name_en || ''
                              })
                              setShowActivityForm(true)
                              setCustomerSearchTerm('')
                            } else {
                              alert(L('Customer not found', 'ไม่พบลูกค้า'))
                            }
                          } catch (e) {
                            console.error('Search error:', e)
                          }
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 13
                      }}
                    />
                    <button
                      onClick={() => {
                        setShowActivityForm(true)
                        setEditActivityID(null)
                        resetActivityForm()
                      }}
                      style={{
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.2)'
                      }}
                    >
                      + {L('New', 'ใหม่')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Activities Table */}
            {activitiesLoading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                {L('Loading...', 'กำลังโหลด...')}
              </div>
            ) : (
              <div style={tableShellStyle}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                    {L('Sales Activity Timeline', 'ไทม์ไลน์กิจกรรมการขาย')}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13, color: '#64748b' }}>
                    {L(`Showing ${filteredActivities.length} records`, `แสดง ${filteredActivities.length} รายการ`)}
                  </div>
                </div>
                <div style={scrollWrapStyle}>
                <table style={{ ...tableStyle, minWidth: 1500 }}>
                  <thead>
                    <tr>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 90 }}>
                        {L('Date', 'วันที่')}
                      </th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 120 }}>
                        {L('Sales Staff', 'พนักงานขาย')}
                      </th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 160 }}>
                        {L('Customer Name', 'ชื่อลูกค้า')}
                      </th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 120 }}>
                        {L('Activity Type', 'ประเภท')}
                      </th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 260 }}>
                        {L('Key Discussion Summary', 'สรุปการสนทนา')}
                      </th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 120 }}>
                        {L('Reaction', 'ปฏิกิริยา')}
                      </th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 210 }}>
                        {L('Technical Questions', 'คำถามเทคนิค')}
                      </th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 210 }}>
                        {L('Next Action', 'ขั้นตอนถัดไป')}
                      </th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 120 }}>
                        {L('Appointment Date', 'วันนัดหมาย')}
                      </th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 80, textAlign: 'center' }}>
                        {L('HQ', 'HQ')}
                      </th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 100, textAlign: 'center' }}>
                        {L('Actions', 'จัดการ')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivities.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                          {L('No activities found', 'ไม่พบกิจกรรม')}
                        </td>
                      </tr>
                    ) : filteredActivities.map((activity, idx) => {
                      const reactionStyle = reactionColors[activity.customerReaction] || { color: '#475569', bg: '#f1f5f9' }

                      return (
                        <tr
                          key={activity.activityID}
                          style={{
                            background: idx % 2 === 0 ? '#ffffff' : '#fbfdff',
                            transition: 'background 0.2s ease, transform 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fbff'}
                          onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fbfdff'}
                        >
                          <td style={{ ...bodyCellStyle, whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{formatDate(activity.activityDate)}</div>
                          </td>
                          <td style={{ ...bodyCellStyle, color: '#0f172a', fontWeight: 600 }}>
                            {activity.salesStaffName || '-'}
                          </td>
                          <td style={{ ...bodyCellStyle, color: '#0f172a' }}>
                            <div style={{ fontWeight: 700 }}>{activity.customerName || '-'}</div>
                            {activity.customerID ? (
                              <div style={{ marginTop: 4, fontSize: 11, color: '#94a3b8' }}>#{activity.customerID}</div>
                            ) : null}
                          </td>
                          <td style={bodyCellStyle}>
                            <span style={badgeStyle('#1d4ed8', '#dbeafe')}>
                              {activity.activityType || '-'}
                            </span>
                          </td>
                          <td style={subtleTextCellStyle}>
                            <div style={clampTwoLineStyle}>{activity.keyDiscussionSummary || '-'}</div>
                          </td>
                          <td style={bodyCellStyle}>
                            <span style={badgeStyle(reactionStyle.color, reactionStyle.bg)}>
                              {reactionLabel(activity.customerReaction)}
                            </span>
                          </td>
                          <td style={subtleTextCellStyle}>
                            <div style={clampTwoLineStyle}>{activity.technicalQuestionsRaised || '-'}</div>
                          </td>
                          <td style={subtleTextCellStyle}>
                            <div style={clampTwoLineStyle}>{activity.nextAction || '-'}</div>
                          </td>
                          <td style={{ ...bodyCellStyle, whiteSpace: 'nowrap', color: '#0f172a', fontWeight: 600 }}>
                            {formatDate(activity.nextActionDate)}
                          </td>
                          <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                            <span style={badgeStyle(activity.hqSupportNeeded === 'Yes' ? '#991b1b' : '#166534', activity.hqSupportNeeded === 'Yes' ? '#fee2e2' : '#dcfce7')}>
                              {hqSupportLabel(activity.hqSupportNeeded)}
                            </span>
                          </td>
                          <td style={{ ...bodyCellStyle, padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                              <button
                                onClick={() => handleActivityEdit(activity)}
                                title={L('Edit', 'แก้ไข')}
                                style={{
                                  width: 32,
                                  height: 32,
                                  background: '#eef4ff',
                                  color: '#2563eb',
                                  border: '1px solid #dbeafe',
                                  borderRadius: 10,
                                  fontSize: 15,
                                  cursor: 'pointer'
                                }}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleActivityDelete(activity.activityID)}
                                title={L('Delete', 'ลบ')}
                                style={{
                                  width: 32,
                                  height: 32,
                                  background: '#fff1f2',
                                  color: '#e11d48',
                                  border: '1px solid #fecdd3',
                                  borderRadius: 10,
                                  fontSize: 15,
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                    }
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <>
            {/* Customer Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 20,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 300, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={searchSource}
                    onChange={(e) => setSearchSource(e.target.value as 'acc' | 'cus')}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="cus">{L('cus_detail', 'ลูกค้า (cus_detail)')}</option>
                    <option value="acc">{L('acc_customers', 'ลูกค้าบัญชี (acc)')}</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder={searchSource === 'cus'
                    ? L('Search from cus_detail...', 'ค้นหาจาก cus_detail...')
                    : L('Search from acc_customers...', 'ค้นหาจาก acc_customers...')
                  }
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: '10px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14
                  }}
                />
                <button
                  onClick={async () => {
                    if (!customerSearch.trim()) {
                      alert(L('Please enter search term', 'กรุณาใส่คำค้นหา'))
                      return
                    }
                    try {
                      const apiUrl = searchSource === 'cus'
                        ? `/api/cus-detail?q=${encodeURIComponent(customerSearch)}`
                        : `/api/accounting/customers?q=${encodeURIComponent(customerSearch)}`

                      const res = await fetch(apiUrl)
                      const j = await res.json()

                      if (j.ok && j.data && j.data.length > 0) {
                        const cust = j.data[0]

                        if (searchSource === 'cus') {
                          // From cus_detail
                          setCustomerForm({
                            customerCompanyName: cust.company || cust.fullname || '',
                            industryType: '',
                            locationProvince: cust.province || 'Bangkok',
                            contactPersonName: cust.fullname || '',
                            contactPosition: '',
                            phone: cust.phone || '',
                            email: cust.email || '',
                            estimatedLoadKW: '',
                            estimatedSavingMonth: '',
                            estimatedMonthlySavingTHB: '',
                            salesOwner: '',
                            firstContactDate: new Date().toISOString().split('T')[0],
                            currentStage: 'Lead',
                            licensingProbability: '20',
                            expectedContractMonth: '',
                            strategicImportance: 'Low',
                            notes: `Imported from cus_detail (ID: ${cust.cusID})${cust.site_name ? ' | Site: ' + cust.site_name : ''}`
                          })
                        } else {
                          // From acc_customers
                          setCustomerForm({
                            customerCompanyName: cust.name_th || cust.name_en || '',
                            industryType: '',
                            locationProvince: 'Bangkok',
                            contactPersonName: cust.contact_name || '',
                            contactPosition: '',
                            phone: cust.phone || '',
                            email: cust.email || '',
                            estimatedLoadKW: '',
                            estimatedSavingMonth: '',
                            estimatedMonthlySavingTHB: '',
                            salesOwner: '',
                            firstContactDate: new Date().toISOString().split('T')[0],
                            currentStage: 'Lead',
                            licensingProbability: '20',
                            expectedContractMonth: '',
                            strategicImportance: 'Low',
                            notes: `Imported from acc_customers (${cust.code})`
                          })
                        }

                        setShowCustomerForm(true)
                        setEditCustomerID(null)
                      } else {
                        alert(L('Customer not found in database', 'ไม่พบลูกค้าในฐานข้อมูล'))
                      }
                    } catch (e) {
                      console.error('Search error:', e)
                      alert(L('Search failed', 'ค้นหาไม่สำเร็จ'))
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(124,58,237,0.2)'
                  }}
                >
                  🔍 {L('Search Customer', 'ค้นหารายชื่อลูกค้า')}
                </button>
              </div>
            </div>

            {/* Bulk Import Section */}
            {filteredCustomers.length === 0 && !customersLoading && (
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                border: '2px dashed #3b82f6',
                borderRadius: 12,
                padding: 24,
                marginBottom: 20,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📥</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  {L('No customers in tracking system', 'ยังไม่มีลูกค้าในระบบติดตาม')}
                </h3>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
                  {L('Import customers from main database or add new ones', 'นำเข้าลูกค้าจากฐานข้อมูลหลัก หรือเพิ่มใหม่')}
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={async () => {
                      const confirmed = confirm(L(
                        'Import all active customers from database?',
                        'นำเข้าลูกค้าทั้งหมดจากฐานข้อมูลหรือไม่?'
                      ))
                      if (!confirmed) return

                      try {
                        const res = await fetch('/api/accounting/customers')
                        const j = await res.json()
                        if (j.ok && j.data && j.data.length > 0) {
                          let imported = 0
                          for (const cust of j.data.slice(0, 50)) { // Import first 50
                            const importData = {
                              customerCompanyName: cust.name_th || cust.name_en || '',
                              industryType: '',
                              locationProvince: 'Bangkok',
                              contactPersonName: cust.contact_name || '',
                              contactPosition: '',
                              phone: cust.phone || '',
                              email: cust.email || '',
                              estimatedLoadKW: 0,
                              estimatedSavingMonth: 0,
                              estimatedMonthlySavingTHB: 0,
                              salesOwner: '',
                              firstContactDate: new Date().toISOString().split('T')[0],
                              currentStage: 'Lead',
                              licensingProbability: 20,
                              expectedContractMonth: '',
                              strategicImportance: 'Low',
                              notes: `Auto-imported from customer DB (${cust.code})`
                            }

                            const importRes = await fetch('/api/customers-detailed', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(importData)
                            })

                            if (importRes.ok) imported++
                          }

                          await fetchCustomers()
                          alert(L(
                            `Successfully imported ${imported} customers`,
                            `นำเข้าลูกค้าสำเร็จ ${imported} รายการ`
                          ))
                        } else {
                          alert(L('No customers found in database', 'ไม่พบลูกค้าในฐานข้อมูล'))
                        }
                      } catch (e) {
                        console.error('Import error:', e)
                        alert(L('Import failed', 'การนำเข้าล้มเหลว'))
                      }
                    }}
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                    }}
                  >
                    📥 {L('Bulk Import from Database', 'นำเข้าจากฐานข้อมูล')}
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomerForm(true)
                      setEditCustomerID(null)
                      resetCustomerForm()
                    }}
                    style={{
                      padding: '12px 24px',
                      background: 'white',
                      color: '#3b82f6',
                      border: '2px solid #3b82f6',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ➕ {L('Add Customer Manually', 'เพิ่มลูกค้าด้วยตนเอง')}
                  </button>
                </div>
              </div>
            )}

            {/* Customers Table */}
            {customersLoading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                {L('Loading...', 'กำลังโหลด...')}
              </div>
            ) : (
              <div style={tableShellStyle}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                    {L('Customer Pipeline Overview', 'ภาพรวมลูกค้าใน Pipeline')}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13, color: '#64748b' }}>
                    {L(`Showing ${filteredCustomers.length} records`, `แสดง ${filteredCustomers.length} รายการ`)}
                  </div>
                </div>
                <div style={scrollWrapStyle}>
                <table style={{ ...tableStyle, minWidth: 1480 }}>
                  <thead>
                    <tr>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 72 }}>ID</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 220 }}>{L('Company Name', 'ชื่อบริษัท')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 140 }}>{L('Industry', 'อุตสาหกรรม')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 110 }}>{L('Location', 'สถานที่')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 130 }}>{L('Contact', 'ผู้ติดต่อ')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 130 }}>{L('Position', 'ตำแหน่ง')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 120 }}>{L('Phone', 'เบอร์โทร')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 80, textAlign: 'right' }}>{L('kW', 'kW')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 110, textAlign: 'right' }}>{L('Saving', 'ประหยัด')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 120 }}>{L('Owner', 'เซลล์')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 110 }}>{L('Contact Date', 'วันติดต่อ')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 110 }}>{L('Stage', 'สถานะ')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 80, textAlign: 'right' }}>{L('%', '%')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 96, textAlign: 'center' }}>{L('Imp.', 'สำคัญ')}</th>
                      <th style={{ ...headerCellStyle, ...stickyHeadStyle, minWidth: 96, textAlign: 'center' }}>{L('Act', 'จัดการ')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={15} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                          {L('No customers found', 'ไม่พบลูกค้า')}
                        </td>
                      </tr>
                    ) : filteredCustomers.map((customer, idx) => {
                      const importStyle = importanceColors[customer.strategicImportance] || { color: '#475569', bg: '#f1f5f9' }
                      const stageStyle = stageColors[customer.currentStage] || { color: '#475569', bg: '#f1f5f9' }

                      return (
                        <tr
                          key={customer.customerID}
                          style={{
                            background: idx % 2 === 0 ? '#ffffff' : '#fbfdff',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fbff'}
                          onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fbfdff'}
                        >
                          <td style={subtleTextCellStyle}>{customer.customerID}</td>
                          <td style={{ ...bodyCellStyle, color: '#0f172a' }}>
                            <div style={{ fontWeight: 700 }}>{customer.customerCompanyName || '-'}</div>
                          </td>
                          <td style={subtleTextCellStyle}>
                            <div style={clampTwoLineStyle}>{customer.industryType || '-'}</div>
                          </td>
                          <td style={subtleTextCellStyle}>{customer.locationProvince || '-'}</td>
                          <td style={subtleTextCellStyle}>
                            <div style={{ fontWeight: 600, color: '#334155' }}>{customer.contactPersonName || '-'}</div>
                          </td>
                          <td style={subtleTextCellStyle}>
                            <div style={clampTwoLineStyle}>{customer.contactPosition || '-'}</div>
                          </td>
                          <td style={subtleTextCellStyle}>{customer.phone || '-'}</td>
                          <td style={{ ...bodyCellStyle, color: '#0f172a', textAlign: 'right', fontWeight: 700 }}>{customer.estimatedLoadKW || '-'}</td>
                          <td style={{ ...bodyCellStyle, color: '#0f172a', textAlign: 'right', fontWeight: 700 }}>
                            {customer.estimatedMonthlySavingTHB ? customer.estimatedMonthlySavingTHB.toLocaleString() : '-'}
                          </td>
                          <td style={subtleTextCellStyle}>{customer.salesOwner || '-'}</td>
                          <td style={subtleTextCellStyle}>
                            {formatDate(customer.firstContactDate)}
                          </td>
                          <td style={bodyCellStyle}>
                            <span style={badgeStyle(stageStyle.color, stageStyle.bg)}>{customer.currentStage || '-'}</span>
                          </td>
                          <td style={{ ...bodyCellStyle, color: '#0f172a', textAlign: 'right', fontWeight: 700 }}>
                            {customer.licensingProbability || 0}%
                          </td>
                          <td style={{ ...bodyCellStyle, textAlign: 'center' }}>
                            <span style={badgeStyle(importStyle.color, importStyle.bg)}>
                              {customer.strategicImportance || 'Low'}
                            </span>
                          </td>
                          <td style={{ ...bodyCellStyle, padding: '10px 8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                              <button
                                onClick={() => handleCustomerEdit(customer)}
                                title={L('Edit', 'แก้ไข')}
                                style={{
                                  width: 32,
                                  height: 32,
                                  background: '#eef4ff',
                                  color: '#2563eb',
                                  border: '1px solid #dbeafe',
                                  borderRadius: 10,
                                  fontSize: 15,
                                  cursor: 'pointer'
                                }}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleCustomerDelete(customer.customerID)}
                                title={L('Delete', 'ลบ')}
                                style={{
                                  width: 32,
                                  height: 32,
                                  background: '#fff1f2',
                                  color: '#e11d48',
                                  border: '1px solid #fecdd3',
                                  borderRadius: 10,
                                  fontSize: 15,
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                    }
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Activity Form Modal */}
        {showActivityForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              maxWidth: 700,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>
                {editActivityID
                  ? L('Edit Activity', 'แก้ไขกิจกรรม')
                  : L('Add Activity', 'เพิ่มกิจกรรม')
                }
              </h2>

              <form onSubmit={handleActivitySubmit}>
                <div style={{ display: 'grid', gap: 16 }}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Activity Date', 'วันที่')} *
                      </label>
                      <input
                        type="date"
                        required
                        value={activityForm.activityDate}
                        onChange={(e) => setActivityForm({...activityForm, activityDate: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Sales Staff Name', 'พนักงานขาย')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={activityForm.salesStaffName}
                        onChange={(e) => setActivityForm({...activityForm, salesStaffName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                      {L('Select Existing Customer (Optional)', 'เลือกลูกค้าที่มีอยู่ (ไม่บังคับ)')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder={L('Search customer...', 'ค้นหาลูกค้า...')}
                        value={customerSearchTerm}
                        onChange={(e) => {
                          setCustomerSearchTerm(e.target.value)
                          if (e.target.value.length > 1) {
                            fetchExistingCustomers(e.target.value)
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                      {customerSearchTerm && existingCustomers.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          marginTop: 4,
                          maxHeight: 200,
                          overflowY: 'auto',
                          zIndex: 1000,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          {existingCustomers.slice(0, 10).map((cust) => (
                            <div
                              key={cust.id}
                              onClick={() => {
                                setActivityForm({
                                  ...activityForm,
                                  customerName: cust.name_th || cust.name_en || ''
                                })
                                setCustomerSearchTerm('')
                              }}
                              style={{
                                padding: '10px 14px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f1f5f9',
                                fontSize: 13
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{cust.name_th || cust.name_en}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>
                                {cust.code} • {cust.phone} • {cust.contact_name}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Customer Name', 'ชื่อลูกค้า')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={activityForm.customerName}
                        onChange={(e) => setActivityForm({...activityForm, customerName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Activity Type', 'ประเภทกิจกรรม')} *
                      </label>
                      <select
                        required
                        value={activityForm.activityType}
                        onChange={(e) => setActivityForm({...activityForm, activityType: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      >
                        <option value="Follow-up">Follow-up</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Call">Call</option>
                        <option value="Email Introduction">Email Introduction</option>
                        <option value="Site Survey">Site Survey</option>
                        <option value="Meter Installation">Meter Installation</option>
                        <option value="Presentation">Presentation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                      {L('Key Discussion Summary', 'สรุปการสนทนา')}
                    </label>
                    <textarea
                      value={activityForm.keyDiscussionSummary}
                      onChange={(e) => setActivityForm({...activityForm, keyDiscussionSummary: e.target.value})}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14,
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Customer Reaction', 'ปฏิกิริยาลูกค้า')}
                      </label>
                      <select
                        value={activityForm.customerReaction}
                        onChange={(e) => setActivityForm({...activityForm, customerReaction: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      >
                        <option value="Positive">Positive</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Negative">Negative</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('HQ Support Needed', 'ขอความช่วยเหลือ')}
                      </label>
                      <select
                        value={activityForm.hqSupportNeeded}
                        onChange={(e) => setActivityForm({...activityForm, hqSupportNeeded: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                      {L('Technical Questions Raised', 'คำถามทางเทคนิค')}
                    </label>
                    <textarea
                      value={activityForm.technicalQuestionsRaised}
                      onChange={(e) => setActivityForm({...activityForm, technicalQuestionsRaised: e.target.value})}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14,
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Next Action', 'ขั้นตอนถัดไป')}
                      </label>
                      <input
                        type="text"
                        value={activityForm.nextAction}
                        onChange={(e) => setActivityForm({...activityForm, nextAction: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Next Action Date', 'วันที่นัดหมาย')}
                      </label>
                      <input
                        type="date"
                        value={activityForm.nextActionDate}
                        onChange={(e) => setActivityForm({...activityForm, nextActionDate: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: saving ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {saving ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowActivityForm(false)
                      setEditActivityID(null)
                      resetActivityForm()
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {L('Cancel', 'ยกเลิก')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Customer Form Modal */}
        {showCustomerForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              maxWidth: 800,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>
                {editCustomerID
                  ? L('Edit Customer', 'แก้ไขข้อมูลลูกค้า')
                  : L('Add Customer', 'เพิ่มลูกค้า')
                }
              </h2>

              <form onSubmit={handleCustomerSubmit}>
                <div style={{ display: 'grid', gap: 16 }}>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                      {L('Link to Existing Customer (Optional)', 'เชื่อมกับลูกค้าที่มีอยู่ (ไม่บังคับ)')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder={L('Search customer from database...', 'ค้นหาลูกค้าจากฐานข้อมูล...')}
                        value={customerSearchTerm}
                        onChange={(e) => {
                          setCustomerSearchTerm(e.target.value)
                          if (e.target.value.length > 1) {
                            fetchExistingCustomers(e.target.value)
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                      {customerSearchTerm && existingCustomers.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          marginTop: 4,
                          maxHeight: 200,
                          overflowY: 'auto',
                          zIndex: 1000,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          {existingCustomers.slice(0, 10).map((cust) => (
                            <div
                              key={cust.id}
                              onClick={() => {
                                setCustomerForm({
                                  ...customerForm,
                                  customerCompanyName: cust.name_th || cust.name_en || '',
                                  contactPersonName: cust.contact_name || '',
                                  phone: cust.phone || '',
                                  email: cust.email || ''
                                })
                                setCustomerSearchTerm('')
                              }}
                              style={{
                                padding: '10px 14px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f1f5f9',
                                fontSize: 13
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{cust.name_th || cust.name_en}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>
                                {cust.code} • {cust.phone} • {cust.contact_name}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Company Name', 'ชื่อบริษัท')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerForm.customerCompanyName}
                        onChange={(e) => setCustomerForm({...customerForm, customerCompanyName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Industry Type', 'ประเภทธุรกิจ')}
                      </label>
                      <input
                        type="text"
                        value={customerForm.industryType}
                        onChange={(e) => setCustomerForm({...customerForm, industryType: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Location', 'สถานที่')}
                      </label>
                      <input
                        type="text"
                        value={customerForm.locationProvince}
                        onChange={(e) => setCustomerForm({...customerForm, locationProvince: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Contact Person', 'ผู้ติดต่อ')}
                      </label>
                      <input
                        type="text"
                        value={customerForm.contactPersonName}
                        onChange={(e) => setCustomerForm({...customerForm, contactPersonName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Position', 'ตำแหน่ง')}
                      </label>
                      <input
                        type="text"
                        value={customerForm.contactPosition}
                        onChange={(e) => setCustomerForm({...customerForm, contactPosition: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Phone', 'เบอร์โทร')}
                      </label>
                      <input
                        type="text"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Email', 'อีเมล')}
                      </label>
                      <input
                        type="email"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Estimated Load (kW)', 'โหลด (kW)')}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={customerForm.estimatedLoadKW}
                        onChange={(e) => setCustomerForm({...customerForm, estimatedLoadKW: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Saving/Month', 'ประหยัด/เดือน')}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={customerForm.estimatedSavingMonth}
                        onChange={(e) => setCustomerForm({...customerForm, estimatedSavingMonth: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Monthly Saving (THB)', 'ประหยัด (บาท/เดือน)')}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={customerForm.estimatedMonthlySavingTHB}
                        onChange={(e) => setCustomerForm({...customerForm, estimatedMonthlySavingTHB: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Sales Owner', 'เซลล์ที่ดูแล')}
                      </label>
                      <input
                        type="text"
                        value={customerForm.salesOwner}
                        onChange={(e) => setCustomerForm({...customerForm, salesOwner: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('First Contact Date', 'วันที่ติดต่อครั้งแรก')}
                      </label>
                      <input
                        type="date"
                        value={customerForm.firstContactDate}
                        onChange={(e) => setCustomerForm({...customerForm, firstContactDate: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Current Stage', 'สถานะ')}
                      </label>
                      <select
                        value={customerForm.currentStage}
                        onChange={(e) => setCustomerForm({...customerForm, currentStage: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      >
                        <option value="Lead">Lead</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Meter Installation">Meter Installation</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed Won">Closed Won</option>
                        <option value="Closed Lost">Closed Lost</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Probability %', 'โอกาส %')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={customerForm.licensingProbability}
                        onChange={(e) => setCustomerForm({...customerForm, licensingProbability: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Expected Month', 'คาดว่าปิดดีล')}
                      </label>
                      <input
                        type="text"
                        placeholder="2026-06"
                        value={customerForm.expectedContractMonth}
                        onChange={(e) => setCustomerForm({...customerForm, expectedContractMonth: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        {L('Importance', 'ความสำคัญ')}
                      </label>
                      <select
                        value={customerForm.strategicImportance}
                        onChange={(e) => setCustomerForm({...customerForm, strategicImportance: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                      {L('Notes', 'หมายเหตุ')}
                    </label>
                    <textarea
                      value={customerForm.notes}
                      onChange={(e) => setCustomerForm({...customerForm, notes: e.target.value})}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14,
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: saving ? '#94a3b8' : 'linear-gradient(135deg, #059669, #10b981)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {saving ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomerForm(false)
                      setEditCustomerID(null)
                      resetCustomerForm()
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {L('Cancel', 'ยกเลิก')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
