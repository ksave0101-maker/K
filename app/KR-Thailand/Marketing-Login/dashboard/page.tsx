"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Search, Phone, Mail, User, Briefcase, X, StickyNote } from 'lucide-react'

type CustomerType = 'new' | 'existing' | 'vip' | 'potential'
type ContactStatus = 'pending' | 'contacted' | 'follow_up' | 'negotiating' | 'success' | 'in_service' | 'feedback' | 'closed'

type User = {
  userId: number
  userName: string
  name: string
  typeID: number
  email?: string
}

type Contact = {
  id: number
  company_name: string
  country: string
  customer_type: CustomerType
  contact_status: ContactStatus
  work_type?: string
  contact_person?: string
  phone?: string
  email?: string
  notes?: string
  created_at?: string
  updated_at?: string
  assigned_to?: number
  assigned_to_name?: string
  assigned_to_username?: string
}

export default function MarketingDashboard() {
  const router = useRouter()
  const [locale, setLocale] = useState<'en' | 'th'>('en')
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [marketingUsers, setMarketingUsers] = useState<User[]>([])
  const [showAddContact, setShowAddContact] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<ContactStatus | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string>('all')

  // Form states
  const [formCompanyName, setFormCompanyName] = useState('')
  const [formCountry, setFormCountry] = useState('Thailand')
  const [formCustomerType, setFormCustomerType] = useState<CustomerType>('new')
  const [formContactStatus, setFormContactStatus] = useState<ContactStatus>('pending')
  const [formWorkType, setFormWorkType] = useState('')
  const [formContactPerson, setFormContactPerson] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formNotes, setFormNotes] = useState('')

  const L = (en: string, th: string) => (mounted && locale === 'th') ? th : en

  useEffect(() => {
    setMounted(true)

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Check user permission
    try {
      const userData = localStorage.getItem('k_system_marketing_user')
      if (!userData) {
        router.push('/Thailand/Marketing-Login')
        return
      }
      const user = JSON.parse(userData)
      setCurrentUser(user)

      const allowedTypes = [0, 1, 16, 17, 18, 19]
      if (!allowedTypes.includes(user.typeID)) {
        router.push('/Thailand/Marketing-Login')
        return
      }
    } catch (e) {
      router.push('/Thailand/Marketing-Login')
      return
    }

    // Load language
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l)
    } catch {}

    // Listen for language changes
    const handleLangChange = (e: any) => {
      const newLang = e.detail
      if (newLang === 'en' || newLang === 'th') setLocale(newLang)
    }
    const handleLocaleChange = (e: any) => {
      if (e.detail?.locale === 'en' || e.detail?.locale === 'th') {
        setLocale(e.detail.locale)
      }
    }
    window.addEventListener('k-system-lang', handleLangChange)
    window.addEventListener('locale-changed', handleLocaleChange)

    // Load contacts and users
    loadContacts()
    loadMarketingUsers()

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('k-system-lang', handleLangChange)
      window.removeEventListener('locale-changed', handleLocaleChange)
    }
  }, [router])

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/marketing-contacts')
      const data = await response.json()
      if (data.success) {
        setContacts(data.contacts)
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
    }
  }

  const loadMarketingUsers = async () => {
    try {
      const response = await fetch('/api/marketing-users')
      const data = await response.json()
      if (data.success) {
        setMarketingUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to load marketing users:', error)
    }
  }

  const handleLanguageChange = (lang: 'en' | 'th') => {
    setLocale(lang)
    try {
      localStorage.setItem('locale', lang)
      localStorage.setItem('k_system_lang', lang)
      window.dispatchEvent(new CustomEvent('k-system-lang', { detail: lang }))
      window.dispatchEvent(new CustomEvent('locale-changed', { detail: { locale: lang } }))
    } catch {}
  }

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/marketing-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formCompanyName,
          country: formCountry,
          customer_type: formCustomerType,
          contact_status: formContactStatus,
          work_type: formWorkType,
          contact_person: formContactPerson,
          phone: formPhone,
          email: formEmail,
          notes: formNotes,
          created_by: currentUser?.userId,
          assigned_to: null
        })
      })

      const data = await response.json()
      if (data.success) {
        await loadContacts()
        // Reset form
        setFormCompanyName('')
        setFormCountry('Thailand')
        setFormCustomerType('new')
        setFormContactStatus('pending')
        setFormWorkType('')
        setFormContactPerson('')
        setFormPhone('')
        setFormEmail('')
        setFormNotes('')
        setShowAddContact(false)
      }
    } catch (error) {
      console.error('Failed to add contact:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (contactId: number, newStatus: ContactStatus) => {
    try {
      const contact = contacts.find(c => c.id === contactId)
      if (!contact) return

      const response = await fetch('/api/marketing-contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contact,
          contact_status: newStatus
        })
      })

      if (response.ok) {
        await loadContacts()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm(L('Are you sure you want to delete this contact?', 'คุณแน่ใจหรือไม่ว่าต้องการลบลูกค้านี้?'))) {
      return
    }

    try {
      const response = await fetch(`/api/marketing-contacts?id=${contactId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadContacts()
      }
    } catch (error) {
      console.error('Failed to delete contact:', error)
    }
  }

  const handleDragStart = (e: React.DragEvent, contact: Contact) => {
    setDraggedContact(contact)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
    setDraggedContact(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, status: ContactStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: ContactStatus) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (!draggedContact) return

    // Don't update if dropped in the same column
    if (draggedContact.contact_status === newStatus) {
      setDraggedContact(null)
      return
    }

    // Update status
    await handleUpdateStatus(draggedContact.id, newStatus)
    setDraggedContact(null)
  }

  const getCustomerTypeLabel = (type: CustomerType) => {
    const labels = {
      new: L('New', 'ลูกค้าใหม่'),
      existing: L('Existing', 'ลูกค้าเก่า'),
      vip: L('VIP', 'วีไอพี'),
      potential: L('Potential', 'มีโอกาส')
    }
    return labels[type]
  }

  const getCustomerTypeBadgeColor = (type: CustomerType) => {
    const colors = {
      new: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
      existing: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
      vip: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
      potential: { bg: '#e0e7ff', text: '#3730a3', border: '#6366f1' }
    }
    return colors[type]
  }

  const getStatusLabel = (status: ContactStatus) => {
    const labels = {
      pending: L('Pending', 'รอติดต่อ'),
      contacted: L('Contacted', 'ติดต่อแล้ว'),
      follow_up: L('Follow Up', 'ติดตามผล'),
      negotiating: L('Negotiating', 'เจรจา'),
      success: L('Success', 'สำเร็จ'),
      in_service: L('In Service', 'กำลังใช้บริการ'),
      feedback: L('Feedback', 'เก็บฟีดแบ๊ค'),
      closed: L('Closed', 'ปิดงาน')
    }
    return labels[status]
  }

  const getStatusColor = (status: ContactStatus) => {
    const colors = {
      pending: { bg: '#f3f4f6', border: '#9ca3af' },
      contacted: { bg: '#dbeafe', border: '#3b82f6' },
      follow_up: { bg: '#fef3c7', border: '#f59e0b' },
      negotiating: { bg: '#fce7f3', border: '#ec4899' },
      success: { bg: '#d1fae5', border: '#10b981' },
      in_service: { bg: '#ccfbf1', border: '#14b8a6' },
      feedback: { bg: '#e0e7ff', border: '#6366f1' },
      closed: { bg: '#e5e7eb', border: '#6b7280' }
    }
    return colors[status]
  }

  const statuses: ContactStatus[] = ['pending', 'contacted', 'follow_up', 'negotiating', 'success', 'in_service', 'feedback', 'closed']

  const countries = Array.from(new Set(contacts.map(c => c.country || 'Thailand'))).sort()

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchQuery === '' ||
      contact.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.work_type?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCountry = selectedCountry === 'all' || contact.country === selectedCountry

    return matchesSearch && matchesCountry
  })

  if (!mounted || !currentUser) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f0 0%, #ffe5d9 100%)',
      padding: isMobile ? '12px' : '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa600 100%)',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '16px' : '24px',
        color: 'white',
        boxShadow: '0 8px 24px rgba(255, 107, 53, 0.25)',
        position: 'relative'
      }}>
        {/* Company Logo & Name - Top Left */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '12px' : '16px',
          left: isMobile ? '12px' : '16px',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '12px',
          background: 'rgba(255,255,255,0.2)',
          padding: isMobile ? '8px 12px' : '10px 16px',
          borderRadius: '12px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {/* Logo */}
          <div style={{
            width: isMobile ? '36px' : '44px',
            height: isMobile ? '36px' : '44px',
            borderRadius: '8px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '4px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Image
              src="/kenergysave-logo.avif"
              alt="K Energy Save Logo"
              width={isMobile ? 32 : 40}
              height={isMobile ? 32 : 40}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          {/* Company Name */}
          <div>
            <div style={{
              fontSize: isMobile ? '0.688rem' : '0.813rem',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              K Energy Save co.,Ltd
            </div>
            {!isMobile && (
              <div style={{
                fontSize: '0.688rem',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.2,
                marginTop: '2px'
              }}>
                (Group of Zera) - Thailand Branch
              </div>
            )}
          </div>
        </div>

        {/* Language Switcher */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '12px' : '16px',
          right: isMobile ? '12px' : '16px',
          display: 'flex',
          gap: '6px',
          background: 'rgba(255,255,255,0.2)',
          padding: isMobile ? '5px' : '6px',
          borderRadius: '10px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            style={{
              padding: isMobile ? '6px 12px' : '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: locale === 'en' ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.1)',
              color: locale === 'en' ? '#ff6b35' : 'rgba(255,255,255,0.95)',
              fontSize: isMobile ? '0.75rem' : '0.813rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: locale === 'en' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('th')}
            style={{
              padding: isMobile ? '6px 12px' : '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: locale === 'th' ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.1)',
              color: locale === 'th' ? '#ff6b35' : 'rgba(255,255,255,0.95)',
              fontSize: isMobile ? '0.75rem' : '0.813rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: locale === 'th' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            ไทย
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexWrap: 'wrap', gap: isMobile ? '12px' : '16px', marginTop: isMobile ? '60px' : '70px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: 700 }}>
              {L('Contact List', 'รายชื่อติดต่อ')}
            </h1>
            <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: isMobile ? '0.875rem' : '1rem' }}>
              {L('Welcome', 'ยินดีต้อนรับ')}, {currentUser.name || currentUser.userName}
            </p>
          </div>
          <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', flexWrap: isMobile ? 'wrap' : 'nowrap', width: isMobile ? '100%' : 'auto' }}>
            <button
              onClick={() => setShowAddContact(true)}
              style={{
                padding: isMobile ? '10px 16px' : '12px 24px',
                background: 'rgba(255,255,255,0.95)',
                color: '#ff6b35',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontSize: isMobile ? '0.875rem' : '1rem',
                flex: isMobile ? 1 : 'none',
                justifyContent: 'center',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <Plus size={isMobile ? 18 : 20} />
              {L('Add Contact', 'เพิ่มลูกค้า')}
            </button>
            <button
              onClick={() => router.push('/KR-Thailand/Admin-Login/dashboard')}
              style={{
                padding: isMobile ? '10px 16px' : '12px 24px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: isMobile ? '0.875rem' : '1rem',
                flex: isMobile ? 1 : 'none',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {L('Back', 'กลับ')}
            </button>
          </div>
        </div>

        {/* Search and Country Filter */}
        <div style={{ marginTop: isMobile ? '16px' : '20px', display: 'flex', gap: isMobile ? '8px' : '12px', flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ position: 'relative', flex: isMobile ? '1' : '2' }}>
            <Search size={isMobile ? 18 : 20} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder={L('Search...', 'ค้นหา...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: isMobile ? '10px 12px 10px 40px' : '12px 12px 12px 44px',
                borderRadius: '10px',
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.95)',
                fontSize: isMobile ? '0.875rem' : '0.938rem',
                outline: 'none'
              }}
            />
          </div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            style={{
              padding: isMobile ? '10px 12px' : '12px 16px',
              borderRadius: '10px',
              border: '2px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.95)',
              fontSize: isMobile ? '0.875rem' : '0.938rem',
              fontWeight: 600,
              color: '#1f2937',
              cursor: 'pointer',
              outline: 'none',
              flex: isMobile ? '1' : '0 0 auto',
              minWidth: isMobile ? 'auto' : '200px'
            }}
          >
            <option value="all">{L('All Countries', 'ทุกประเทศ')}</option>
            {countries.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board - Columns by Status */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: isMobile ? '16px' : '20px',
        overflowX: isMobile ? 'visible' : 'auto'
      }}>
        {statuses.map(status => {
          const statusContacts = filteredContacts.filter(c => c.contact_status === status)
          const statusColor = getStatusColor(status)

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
              style={{
                background: 'white',
                borderRadius: isMobile ? '10px' : '12px',
                padding: isMobile ? '12px' : '16px',
                boxShadow: dragOverColumn === status ? '0 4px 20px rgba(255, 107, 53, 0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                minHeight: isMobile ? '200px' : '400px',
                border: dragOverColumn === status ? '2px dashed #ff6b35' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {/* Column Header */}
              <div style={{
                borderLeft: `4px solid ${statusColor.border}`,
                paddingLeft: '12px',
                marginBottom: '16px',
                background: statusColor.bg,
                padding: '12px',
                borderRadius: '8px'
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1f2937' }}>
                  {getStatusLabel(status)}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.813rem', color: '#6b7280' }}>
                  {statusContacts.length} {L('contacts', 'รายการ')}
                </p>
              </div>

              {/* Contact Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {statusContacts.map(contact => {
                  const customerColor = getCustomerTypeBadgeColor(contact.customer_type)
                  return (
                    <div
                      key={contact.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, contact)}
                      onDragEnd={handleDragEnd}
                      style={{
                        background: '#f9fafb',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: draggedContact?.id === contact.id ? 'grabbing' : 'grab',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s',
                        opacity: draggedContact?.id === contact.id ? 0.5 : 1
                      }}
                      onClick={() => setSelectedContact(contact)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f3f4f6'
                        e.currentTarget.style.borderColor = '#d1d5db'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f9fafb'
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4
                            style={{
                              margin: 0,
                              fontSize: '0.938rem',
                              fontWeight: 600,
                              color: '#1f2937',
                              cursor: contact.notes ? 'help' : 'default'
                            }}
                            title={contact.notes || undefined}
                          >
                            {contact.company_name}
                          </h4>
                          {contact.notes && (
                            <div
                              style={{
                                position: 'relative',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                              title={contact.notes}
                            >
                              <StickyNote
                                size={14}
                                style={{
                                  color: '#f59e0b',
                                  cursor: 'help'
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteContact(contact.id)
                          }}
                          style={{
                            padding: '4px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: customerColor.bg,
                          color: customerColor.text,
                          border: `1px solid ${customerColor.border}`
                        }}>
                          {getCustomerTypeLabel(contact.customer_type)}
                        </div>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #d1d5db'
                        }}>
                          🌍 {contact.country || 'Thailand'}
                        </div>
                      </div>

                      {contact.work_type && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.813rem', color: '#6b7280', marginBottom: '4px' }}>
                          <Briefcase size={14} />
                          {contact.work_type}
                        </div>
                      )}

                      {contact.contact_person && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.813rem', color: '#6b7280', marginBottom: '4px' }}>
                          <User size={14} />
                          {contact.contact_person}
                        </div>
                      )}

                      {contact.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.813rem', color: '#6b7280', marginBottom: '4px' }}>
                          <Phone size={14} />
                          {contact.phone}
                        </div>
                      )}

                      {contact.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.813rem', color: '#6b7280', marginBottom: '4px' }}>
                          <Mail size={14} />
                          {contact.email}
                        </div>
                      )}

                      {/* Assigned User Dropdown */}
                      <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '0.688rem', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                          {L('Assigned to', 'ผู้รับผิดชอบ')}
                        </label>
                        <select
                          value={contact.assigned_to || ''}
                          onChange={async (e) => {
                            e.stopPropagation()
                            const newAssignedTo = e.target.value ? parseInt(e.target.value) : null
                            try {
                              const response = await fetch('/api/marketing-contacts', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  ...contact,
                                  assigned_to: newAssignedTo
                                })
                              })
                              if (response.ok) {
                                await loadContacts()
                              }
                            } catch (error) {
                              console.error('Failed to update assignment:', error)
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            fontSize: '0.813rem',
                            cursor: 'pointer',
                            background: contact.assigned_to ? '#f0fdf4' : 'white',
                            color: contact.assigned_to ? '#15803d' : '#6b7280',
                            fontWeight: contact.assigned_to ? 600 : 400
                          }}
                        >
                          <option value="">{L('Unassigned', 'ยังไม่ได้มอบหมาย')}</option>
                          {marketingUsers.map(user => (
                            <option key={user.userId} value={user.userId}>
                              {user.name} ({user.userName})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status Dropdown */}
                      <select
                        value={contact.contact_status}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(contact.id, e.target.value as ContactStatus)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          fontSize: '0.813rem',
                          cursor: 'pointer',
                          background: 'white'
                        }}
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{getStatusLabel(s)}</option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '0' : '20px',
          overflowY: 'auto'
        }} onClick={() => setShowAddContact(false)}>
          <div style={{
            background: 'white',
            borderRadius: isMobile ? '0' : '16px',
            padding: isMobile ? '20px 16px' : '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: isMobile ? '100vh' : '90vh',
            overflowY: 'auto',
            margin: isMobile ? '0' : 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 700, color: '#1f2937' }}>
              {L('Add New Contact', 'เพิ่มลูกค้าใหม่')}
            </h2>

            <form onSubmit={handleAddContact}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                    {L('Company Name', 'ชื่อบริษัท')} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.938rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                    {L('Country', 'ประเทศ')}
                  </label>
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.938rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Thailand">Thailand</option>
                    <option value="Korea">Korea</option>
                    <option value="Japan">Japan</option>
                    <option value="China">China</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                    {L('Customer Type', 'ประเภทลูกค้า')}
                  </label>
                  <select
                    value={formCustomerType}
                    onChange={(e) => setFormCustomerType(e.target.value as CustomerType)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.938rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="new">{L('New', 'ลูกค้าใหม่')}</option>
                    <option value="existing">{L('Existing', 'ลูกค้าเก่า')}</option>
                    <option value="vip">{L('VIP', 'วีไอพี')}</option>
                    <option value="potential">{L('Potential', 'มีโอกาส')}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                    {L('Contact Status', 'สถานะการติดต่อ')}
                  </label>
                  <select
                    value={formContactStatus}
                    onChange={(e) => setFormContactStatus(e.target.value as ContactStatus)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.938rem',
                      cursor: 'pointer'
                    }}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{getStatusLabel(s)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  {L('Work Type', 'ประเภทงาน')}
                </label>
                <input
                  type="text"
                  value={formWorkType}
                  onChange={(e) => setFormWorkType(e.target.value)}
                  placeholder={L('e.g., Solar Panel, LED Lighting', 'เช่น โซล่าเซลล์, ไฟ LED')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.938rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  {L('Contact Person', 'ผู้ติดต่อ')}
                </label>
                <input
                  type="text"
                  value={formContactPerson}
                  onChange={(e) => setFormContactPerson(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.938rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                    {L('Phone', 'เบอร์โทร')}
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.938rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                    {L('Email', 'อีเมล')}
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.938rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                  {L('Notes', 'หมายเหตุ')}
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.938rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexDirection: isMobile ? 'column' : 'row' }}>
                <button
                  type="button"
                  onClick={() => setShowAddContact(false)}
                  style={{
                    padding: isMobile ? '14px 24px' : '12px 24px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#374151',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {L('Cancel', 'ยกเลิก')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: isMobile ? '14px 24px' : '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
                    color: 'white',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(255, 107, 53, 0.3)',
                    width: isMobile ? '100%' : 'auto',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {loading ? L('Adding...', 'กำลังเพิ่ม...') : L('Add Contact', 'เพิ่มลูกค้า')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: isMobile ? '0' : '20px'
        }} onClick={() => setSelectedContact(null)}>
          <div style={{
            background: 'white',
            borderRadius: isMobile ? '20px 20px 0 0' : '16px',
            padding: isMobile ? '20px 16px' : '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: isMobile ? '85vh' : 'auto',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? '1.125rem' : '1.5rem', fontWeight: 700, color: '#1f2937', paddingRight: '40px' }}>
                {selectedContact.company_name}
              </h2>
              <button
                onClick={() => setSelectedContact(null)}
                style={{
                  padding: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.813rem', color: '#6b7280', fontWeight: 600 }}>
                    {L('Customer Type', 'ประเภทลูกค้า')}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    ...getCustomerTypeBadgeColor(selectedContact.customer_type),
                    background: getCustomerTypeBadgeColor(selectedContact.customer_type).bg,
                    color: getCustomerTypeBadgeColor(selectedContact.customer_type).text,
                    border: `1px solid ${getCustomerTypeBadgeColor(selectedContact.customer_type).border}`
                  }}>
                    {getCustomerTypeLabel(selectedContact.customer_type)}
                  </span>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.813rem', color: '#6b7280', fontWeight: 600 }}>
                    {L('Country', 'ประเทศ')}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db'
                  }}>
                    🌍 {selectedContact.country || 'Thailand'}
                  </span>
                </div>
              </div>

              <div>
                <p style={{ margin: '0 0 4px', fontSize: '0.813rem', color: '#6b7280', fontWeight: 600 }}>
                  {L('Contact Status', 'สถานะการติดต่อ')}
                </p>
                <p style={{ margin: 0, fontSize: '0.938rem', color: '#1f2937' }}>
                  {getStatusLabel(selectedContact.contact_status)}
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 4px', fontSize: '0.813rem', color: '#6b7280', fontWeight: 600 }}>
                  {L('Assigned to', 'ผู้รับผิดชอบ')}
                </p>
                {selectedContact.assigned_to ? (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#15803d'
                  }}>
                    <User size={14} />
                    {selectedContact.assigned_to_name} ({selectedContact.assigned_to_username})
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.938rem', color: '#9ca3af', fontStyle: 'italic' }}>
                    {L('Unassigned', 'ยังไม่ได้มอบหมาย')}
                  </p>
                )}
              </div>

              {selectedContact.work_type && (
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.813rem', color: '#6b7280', fontWeight: 600 }}>
                    {L('Work Type', 'ประเภทงาน')}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.938rem', color: '#1f2937' }}>
                    {selectedContact.work_type}
                  </p>
                </div>
              )}

              {selectedContact.contact_person && (
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.813rem', color: '#6b7280', fontWeight: 600 }}>
                    {L('Contact Person', 'ผู้ติดต่อ')}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.938rem', color: '#1f2937' }}>
                    {selectedContact.contact_person}
                  </p>
                </div>
              )}

              {selectedContact.phone && (
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.813rem', color: '#6b7280', fontWeight: 600 }}>
                    {L('Phone', 'เบอร์โทร')}
                  </p>
                  <a href={`tel:${selectedContact.phone}`} style={{ fontSize: '0.938rem', color: '#ff6b35', textDecoration: 'none' }}>
                    {selectedContact.phone}
                  </a>
                </div>
              )}

              {selectedContact.email && (
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.813rem', color: '#6b7280', fontWeight: 600 }}>
                    {L('Email', 'อีเมล')}
                  </p>
                  <a href={`mailto:${selectedContact.email}`} style={{ fontSize: '0.938rem', color: '#ff6b35', textDecoration: 'none' }}>
                    {selectedContact.email}
                  </a>
                </div>
              )}

              {selectedContact.notes && (
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '0.813rem', color: '#6b7280', fontWeight: 600 }}>
                    {L('Notes', 'หมายเหตุ')}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.938rem', color: '#1f2937', whiteSpace: 'pre-wrap' }}>
                    {selectedContact.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
