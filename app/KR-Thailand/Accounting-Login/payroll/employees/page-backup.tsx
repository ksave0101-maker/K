"use client"

import React, { useState, useEffect } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'

type Employee = {
  id: string | number
  username: string
  name: string
  email: string
  department: string
  position: string
  typeID: number
  site: string
  salary: number
  status: string
}

export default function EmployeesPage() {
  const { L } = useLang()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/payroll/employees?site=Thailand', {
        cache: 'no-store', // Always get fresh data
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch employees')
      }

      const data = await response.json()

      if (data.ok) {
        setEmployees(data.employees || [])
        setError('')
      } else {
        setError(data.error || 'Failed to load employees')
      }
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message || 'Failed to connect to server')
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (formData: any) => {
    try {
      setSaving(true)
      setError('')

      const response = await fetch('/api/payroll/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          site: 'Thailand'
        })
      })

      const data = await response.json()

      if (data.ok) {
        setSuccessMessage('เพิ่มพนักงานสำเร็จ! ✅')
        setShowAddModal(false)
        fetchEmployees() // Refresh list
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'ไม่สามารถเพิ่มพนักงานได้')
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setSaving(false)
    }
  }

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.username?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase()) ||
    String(e.id).includes(search)
  )

  return (
    <AccWindow title={L('บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด', 'K Energy Save Co., Ltd.')}>
      <div style={{ padding: 30 }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              👥 {L('Employee Data', 'ข้อมูลพนักงาน')}
            </div>
            <div style={{ fontSize: 14, marginTop: 4, opacity: 0.9 }}>
              {L('Total Employees', 'พนักงานทั้งหมด')}: {employees.length} {L('people', 'คน')}
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 20px',
              background: '#fff',
              color: '#4f46e5',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ➕ {L('Add Employee', 'เพิ่มพนักงาน')}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 600,
            color: '#059669',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder={L('Search employees...', 'ค้นหาพนักงาน...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: 14,
              border: '2px solid #e5e7eb',
              borderRadius: 8,
              outline: 'none'
            }}
          />
          <button
            onClick={fetchEmployees}
            style={{
              padding: '12px 24px',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🔄 {L('Refresh', 'รีเฟรช')}
          </button>
        </div>

        {/* Loading State - Skeleton */}
        {loading && (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            border: '2px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  {['รหัส', 'ชื่อ-นามสกุล', 'อีเมล', 'แผนก', 'ตำแหน่ง', 'จัดการ'].map((h, i) => (
                    <th key={i} style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: '#374151' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((n) => (
                  <tr key={n} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    {[1, 2, 3, 4, 5, 6].map((col) => (
                      <td key={col} style={{ padding: 16 }}>
                        <div style={{
                          height: 20,
                          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 1.5s infinite',
                          borderRadius: 4,
                          width: col === 6 ? 100 : '80%'
                        }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <style>{`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{
            background: '#fef2f2',
            border: '2px solid #ef4444',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>
              ❌ {L('Error', 'เกิดข้อผิดพลาด')}
            </div>
            <div style={{ fontSize: 14, color: '#991b1b' }}>{error}</div>
          </div>
        )}

        {/* Employee Table */}
        {!loading && !error && (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            border: '2px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                <div style={{ fontSize: 16 }}>
                  {search
                    ? L('No employees found', 'ไม่พบพนักงานที่ค้นหา')
                    : L('No employees in Thailand site', 'ไม่มีพนักงานในสาขาประเทศไทย')
                  }
                </div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: '#374151' }}>
                      {L('ID', 'รหัส')}
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: '#374151' }}>
                      {L('Name', 'ชื่อ-นามสกุล')}
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: '#374151' }}>
                      {L('Email', 'อีเมล')}
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: '#374151' }}>
                      {L('Department', 'แผนก')}
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: '#374151' }}>
                      {L('Position', 'ตำแหน่ง')}
                    </th>
                    <th style={{ padding: 16, textAlign: 'center', fontWeight: 700, color: '#374151' }}>
                      {L('Actions', 'จัดการ')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp, i) => (
                    <tr key={emp.id} style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid #e5e7eb' : 'none',
                      transition: 'background 0.2s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: 16, fontWeight: 600, color: '#6366f1' }}>
                        #{emp.id}
                      </td>
                      <td style={{ padding: 16, fontWeight: 600 }}>
                        {emp.name || '-'}
                      </td>
                      <td style={{ padding: 16, fontSize: 13, color: '#6b7280' }}>
                        {emp.email || '-'}
                      </td>
                      <td style={{ padding: 16 }}>
                        <span style={{
                          padding: '4px 10px',
                          background: '#eff6ff',
                          color: '#1e40af',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          {emp.department}
                        </span>
                      </td>
                      <td style={{ padding: 16, fontSize: 13 }}>{emp.position}</td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp)
                            setShowDetailModal(true)
                          }}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
                          }}
                        >
                          📋 {L('Details', 'รายละเอียด')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddModal && (
          <AddEmployeeModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddEmployee}
            saving={saving}
            L={L}
          />
        )}

        {/* Employee Detail Modal */}
        {showDetailModal && selectedEmployee && (
          <EmployeeDetailModal
            employee={selectedEmployee}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedEmployee(null)
            }}
            L={L}
          />
        )}

      </div>
    </AccWindow>
  )
}

// Employee Detail Modal Component
function EmployeeDetailModal({
  employee,
  onClose,
  L
}: {
  employee: Employee
  onClose: () => void
  L: (en: string, th: string) => string
}) {
  return (
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
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        width: '90%',
        maxWidth: 700,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          padding: 24,
          borderRadius: '16px 16px 0 0',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              👤 {L('Employee Details', 'รายละเอียดพนักงาน')}
            </div>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>
              {L('Employee ID', 'รหัสพนักงาน')}: #{employee.id}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              fontSize: 24,
              cursor: 'pointer',
              width: 36,
              height: 36,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 32 }}>

          {/* Personal Information */}
          <div style={{
            marginBottom: 24,
            padding: 20,
            background: '#f9fafb',
            borderRadius: 12,
            border: '2px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#374151',
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: '2px solid #d1d5db'
            }}>
              👤 {L('Personal Information', 'ข้อมูลส่วนตัว')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                  {L('Full Name', 'ชื่อ-นามสกุล')}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
                  {employee.name}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                  {L('Email', 'อีเมล')}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
                  {employee.email || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Position Information */}
          <div style={{
            marginBottom: 24,
            padding: 20,
            background: '#f0f9ff',
            borderRadius: 12,
            border: '2px solid #bfdbfe'
          }}>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#374151',
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: '2px solid #93c5fd'
            }}>
              💼 {L('Position Information', 'ข้อมูลตำแหน่ง')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 4 }}>
                  {L('Department', 'แผนก')}
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#1e3a8a',
                  padding: '6px 12px',
                  background: '#dbeafe',
                  borderRadius: 8,
                  display: 'inline-block'
                }}>
                  {employee.department}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 4 }}>
                  {L('Position', 'ตำแหน่ง')}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1e3a8a' }}>
                  {employee.position}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 4 }}>
                  {L('Site', 'สาขา')}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1e3a8a' }}>
                  {employee.site}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 4 }}>
                  {L('Salary', 'เงินเดือน')}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>
                  ฿{employee.salary.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{
            padding: 16,
            background: '#f0fdf4',
            borderRadius: 12,
            border: '2px solid #86efac',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 13, color: '#166534', marginBottom: 4 }}>
              {L('Status', 'สถานะ')}
            </div>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#15803d',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
                display: 'inline-block',
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)'
              }}></span>
              {L('Active', 'ปฏิบัติงาน')}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 32px 24px',
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end',
          borderTop: '2px solid #e5e7eb'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 32px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {L('Close', 'ปิด')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Add Employee Modal Component
function AddEmployeeModal({
  onClose,
  onSubmit,
  saving,
  L
}: {
  onClose: () => void
  onSubmit: (data: any) => void
  saving: boolean
  L: (en: string, th: string) => string
}) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    typeID: 3, // Default: นักบัญชี
    phoneNumber: '',
    address: '',
    salary: '',
    startDate: new Date().toISOString().split('T')[0]
  })

  const [documents, setDocuments] = useState({
    contract: null as File | null,
    education: null as File | null,
    idCard: null as File | null,
    bankAccount: null as File | null,
    resume: null as File | null,
    certificate: null as File | null
  })

  const [uploadingDoc, setUploadingDoc] = useState('')

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (category: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [category]: file }))
  }

  const uploadDocument = async (category: string, file: File, employeeId?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)
    formData.append('employeeId', employeeId || 'temp')

    const response = await fetch('/api/upload/employee-documents', {
      method: 'POST',
      body: formData
    })

    return await response.json()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Upload all documents
      const uploadedDocs: any = {}
      const docCategories = [
        { key: 'contract', category: 'contracts' },
        { key: 'education', category: 'education' },
        { key: 'idCard', category: 'id-cards' },
        { key: 'bankAccount', category: 'bank-accounts' },
        { key: 'resume', category: 'resumes' },
        { key: 'certificate', category: 'certificates' }
      ]

      for (const { key, category } of docCategories) {
        const file = documents[key as keyof typeof documents]
        if (file) {
          setUploadingDoc(category)
          const result = await uploadDocument(category, file)
          if (result.ok) {
            uploadedDocs[key] = result.url
          }
        }
      }

      setUploadingDoc('')

      // Submit form with uploaded document URLs
      onSubmit({
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : 0,
        documents: uploadedDocs
      })
    } catch (error) {
      console.error('Error uploading documents:', error)
      alert('เกิดข้อผิดพลาดในการอัพโหลดเอกสาร')
    }
  }

  return (
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
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        width: '90%',
        maxWidth: 600,
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          padding: 24,
          borderRadius: '16px 16px 0 0',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>
              ➕ {L('Add New Employee', 'เพิ่มพนักงานใหม่')}
            </div>
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.9 }}>
              {L('Fill in the form below', 'กรอกข้อมูลในแบบฟอร์มด้านล่าง')}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              fontSize: 24,
              cursor: 'pointer',
              width: 36,
              height: 36,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            {/* Username */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                {L('Username', 'ชื่อผู้ใช้')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={e => handleChange('username', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none'
                }}
                placeholder={L('Enter username', 'กรอกชื่อผู้ใช้')}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                {L('Password', 'รหัสผ่าน')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none'
                }}
                placeholder={L('Enter password', 'กรอกรหัสผ่าน')}
              />
            </div>

            {/* Name */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                {L('Full Name', 'ชื่อ-นามสกุล')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none'
                }}
                placeholder={L('Enter full name', 'กรอกชื่อ-นามสกุล')}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                {L('Email', 'อีเมล')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none'
                }}
                placeholder={L('Enter email', 'กรอกอีเมล')}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                {L('Phone Number', 'เบอร์โทรศัพท์')}
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={e => handleChange('phoneNumber', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none'
                }}
                placeholder={L('Enter phone number', 'กรอกเบอร์โทรศัพท์')}
              />
            </div>

            {/* Position/Type */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                {L('Position', 'ตำแหน่ง/แผนก')} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                required
                value={formData.typeID}
                onChange={e => handleChange('typeID', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none'
                }}
              >
                <option value={1}>ผู้ดูแลระบบ (System Administrator)</option>
                <option value={2}>ผู้จัดการ (Manager)</option>
                <option value={3}>บัญชี (นักบัญชี)</option>
                <option value={4}>การตลาด (Marketing Staff)</option>
                <option value={5}>ช่างเทคนิค (ช่างติดตั้ง)</option>
                <option value={6}>ฝ่ายขาย (พนักงานขาย)</option>
                <option value={7}>แอดมิน (Admin)</option>
                <option value={8}>HR/เงินเดือน (HR Officer)</option>
                <option value={9}>หัวหน้าแผนกการตลาด (M-Marketing)</option>
                <option value={10}>ผู้จัดการสาขา (Branch Manager)</option>
                <option value={11}>หัวหน้าแผนกบัญชี (M-Accounting)</option>
              </select>
            </div>

            {/* Salary */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                {L('Salary (THB/month)', 'เงินเดือน (บาท/เดือน)')}
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={e => handleChange('salary', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none'
                }}
                placeholder={L('Enter salary', 'กรอกเงินเดือน')}
              />
            </div>

            {/* Start Date */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                {L('Start Date', 'วันที่เริ่มงาน')}
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => handleChange('startDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>

            {/* Address */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                {L('Address', 'ที่อยู่')}
              </label>
              <textarea
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder={L('Enter address', 'กรอกที่อยู่')}
              />
            </div>

            {/* Documents Section Header */}
            <div style={{ gridColumn: '1 / -1', marginTop: 16, marginBottom: 8 }}>
              <div style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#374151',
                paddingBottom: 8,
                borderBottom: '2px solid #e5e7eb'
              }}>
                📄 {L('Upload Documents', 'อัพโหลดเอกสาร')}
              </div>
            </div>

            {/* Employment Contract */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13 }}>
                📋 {L('Employment Contract', 'สัญญาจ้าง')}
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={e => handleFileChange('contract', e.target.files?.[0] || null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '2px dashed #d1d5db',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              {documents.contract && (
                <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
                  ✓ {documents.contract.name}
                </div>
              )}
            </div>

            {/* Education Certificate */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13 }}>
                🎓 {L('Education Certificate', 'วุฒิการศึกษา')}
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => handleFileChange('education', e.target.files?.[0] || null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '2px dashed #d1d5db',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              {documents.education && (
                <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
                  ✓ {documents.education.name}
                </div>
              )}
            </div>

            {/* ID Card Copy */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13 }}>
                🪪 {L('ID Card Copy', 'สำเนาบัตรประชาชน')}
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => handleFileChange('idCard', e.target.files?.[0] || null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '2px dashed #d1d5db',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              {documents.idCard && (
                <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
                  ✓ {documents.idCard.name}
                </div>
              )}
            </div>

            {/* Bank Account */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13 }}>
                🏦 {L('Bank Account Page', 'หน้าบัญชี')}
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => handleFileChange('bankAccount', e.target.files?.[0] || null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '2px dashed #d1d5db',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              {documents.bankAccount && (
                <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
                  ✓ {documents.bankAccount.name}
                </div>
              )}
            </div>

            {/* Resume */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13 }}>
                📝 {L('Resume', 'เรซูเม่')}
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={e => handleFileChange('resume', e.target.files?.[0] || null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '2px dashed #d1d5db',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              {documents.resume && (
                <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
                  ✓ {documents.resume.name}
                </div>
              )}
            </div>

            {/* Other Certificates */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13 }}>
                📜 {L('Other Certificates', 'หนังสือรับรองอื่นๆ')}
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => handleFileChange('certificate', e.target.files?.[0] || null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '2px dashed #d1d5db',
                  borderRadius: 8,
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              {documents.certificate && (
                <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
                  ✓ {documents.certificate.name}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{
            marginTop: 24,
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '10px 24px',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.5 : 1
              }}
            >
              {L('Cancel', 'ยกเลิก')}
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 24px',
                background: saving ? '#9ca3af' : '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {saving ? (
                uploadingDoc ? (
                  <>📤 {L('Uploading', 'กำลังอัพโหลด')} {uploadingDoc}...</>
                ) : (
                  <>⏳ {L('Saving...', 'กำลังบันทึก...')}</>
                )
              ) : (
                <>💾 {L('Save Employee', 'บันทึกพนักงาน')}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
