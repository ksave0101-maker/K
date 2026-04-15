"use client"

import { useState, useEffect } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'

type Employee = {
  id: number
  username: string
  name: string
  name_th?: string
  email: string
  department: string
  position: string
  typeID: number
  site: string
  phoneNumber?: string
  address?: string
  salary?: number
  hourlyRate?: number
  dailyRate?: number
  startDate?: string
  endDate?: string
  terminationReason?: string
  terminationType?: string
  taxId?: string
}

type NewEmployee = {
  name: string
  name_th: string
  email: string
  typeID: number
  phoneNumber: string
  address: string
  salary: number
  hourlyRate: number
  dailyRate: number
  startDate: string
  endDate: string
  terminationReason: string
  terminationType: string
  taxId: string
}

export default function EmployeesPage() {
  const { L } = useLang()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    name: '',
    name_th: '',
    email: '',
    typeID: 6,
    phoneNumber: '',
    address: '',
    salary: 0,
    hourlyRate: 0,
    dailyRate: 0,
    startDate: '',
    endDate: '',
    terminationReason: '',
    terminationType: '',
    taxId: ''
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/payroll/employees?site=Thailand')
      const data = await res.json()

      if (data.ok && data.employees) {
        setEmployees(data.employees)
      } else {
        setError(data.error || 'Unknown error')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (emp: Employee) => {
    setSelectedEmployee({ ...emp })
    setShowEditModal(true)
  }

  const handleSave = async () => {
    if (!selectedEmployee) return

    setSaving(true)
    try {
      const res = await fetch('/api/payroll/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEmployee.id,
          name: selectedEmployee.name,
          name_th: selectedEmployee.name_th,
          email: selectedEmployee.email,
          phoneNumber: selectedEmployee.phoneNumber,
          address: selectedEmployee.address,
          salary: selectedEmployee.salary || 0,
          hourlyRate: selectedEmployee.hourlyRate || 0,
          dailyRate: selectedEmployee.dailyRate || 0
        })
      })

      const data = await res.json()

      if (data.ok) {
        setShowEditModal(false)
        setSelectedEmployee(null)
        loadEmployees()
        alert('✅ บันทึกสำเร็จ!')
      } else {
        alert('❌ ' + data.error)
      }
    } catch (err: unknown) {
      alert('❌ ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleAddEmployee = async () => {
    if (!newEmployee.name) {
      alert('❌ กรุณากรอกข้อมูลที่จำเป็น (ชื่อ-นามสกุล)')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/payroll/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEmployee,
          site: 'Thailand'
        })
      })

      const data = await res.json()

      if (data.ok) {
        setShowAddModal(false)
        setNewEmployee({
          name: '',
          name_th: '',
          email: '',
          typeID: 6,
          phoneNumber: '',
          address: '',
          salary: 0,
          hourlyRate: 0,
          dailyRate: 0,
          startDate: '',
          endDate: '',
          terminationReason: '',
          terminationType: '',
          taxId: ''
        })
        loadEmployees()
        alert(`✅ เพิ่มพนักงานสำเร็จ!\n${L('Generated Username', 'ชื่อผู้ใช้ที่ระบบสร้าง')}: ${data.employee?.username || '-'}\n${L('Temporary Password', 'รหัสผ่านชั่วคราว')}: ${data.employee?.temporaryPassword || '-'}`)
      } else {
        alert('❌ ' + data.error)
      }
    } catch (err: unknown) {
      alert('❌ ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AccWindow title={L('Employee Data', 'ข้อมูลพนักงาน')}>
        <div style={{
          padding: 40,
          textAlign: 'center',
          background: '#f3f4f6',
          margin: 30,
          borderRadius: 12,
          border: '2px solid #d1d5db'
        }}>
          <div style={{ fontSize: 48 }}>⏳</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#4b5563', marginTop: 16 }}>
            {L('Loading...', 'กำลังโหลด...')}
          </div>
        </div>
      </AccWindow>
    )
  }

  if (error) {
    return (
      <AccWindow title={L('Employee Data', 'ข้อมูลพนักงาน')}>
        <div style={{
          padding: 30,
          margin: 30,
          background: '#fee2e2',
          borderRadius: 12,
          border: '2px solid #ef4444',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48 }}>❌</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#991b1b', marginTop: 16 }}>
            Error: {error}
          </div>
          <button onClick={loadEmployees} style={{
            marginTop: 20,
            padding: '12px 32px',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            🔄 {L('Try Again', 'ลองอีกครั้ง')}
          </button>
        </div>
      </AccWindow>
    )
  }

  return (
    <AccWindow title={L('Employee Data', 'ข้อมูลพนักงาน')}>
      <div style={{ padding: 30 }}>

        {/* Header */}
        <div style={{
          background: '#6b7280',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              👥 {L('Employee List', 'รายชื่อพนักงาน')}
            </div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              {L('Total', 'ทั้งหมด')}: <strong>{employees.length}</strong> {L('people', 'คน')}
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '12px 24px',
              background: '#4b5563',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            ➕ {L('Add New Employee', 'เพิ่มพนักงานใหม่')}
          </button>
        </div>

        {/* Table */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                background: '#374151',
                color: '#fff'
              }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, fontSize: 14 }}>
                  {L('ID', 'รหัส')}
                </th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, fontSize: 14 }}>
                  {L('Name', 'ชื่อ-นามสกุล')}
                </th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, fontSize: 14 }}>
                  {L('Email', 'อีเมล')}
                </th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, fontSize: 14 }}>
                  {L('Department', 'แผนก')}
                </th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, fontSize: 14 }}>
                  {L('Position', 'ตำแหน่ง')}
                </th>
                <th style={{ padding: 16, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
                  {L('Actions', 'จัดการ')}
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => (
                <tr
                  key={emp.id}
                  style={{
                    background: idx % 2 ? '#f9fafb' : '#fff',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                >
                  <td style={{
                    padding: 16,
                    fontWeight: 700,
                    color: '#6b7280',
                    fontSize: 14
                  }}>
                    #{emp.id}
                  </td>
                  <td style={{
                    padding: 16,
                    fontWeight: 600,
                    color: '#111827',
                    fontSize: 14
                  }}>
                    {emp.name}
                    {emp.name_th && (
                      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 400, marginTop: 2 }}>
                        {emp.name_th}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 16, color: '#6b7280', fontSize: 13 }}>
                    {emp.email}
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{
                      padding: '6px 12px',
                      background: '#e5e7eb',
                      color: '#374151',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'inline-block'
                    }}>
                      {emp.department}
                    </span>
                  </td>
                  <td style={{ padding: 16, fontWeight: 600, color: '#374151', fontSize: 13 }}>
                    {emp.position}
                  </td>
                  <td style={{ padding: 16, textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(emp)}
                      style={{
                        padding: '8px 16px',
                        background: '#6b7280',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      📋 {L('Edit', 'แก้ไข')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {showEditModal && selectedEmployee && (
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
            zIndex: 9999
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
                background: '#6b7280',
                padding: 24,
                borderRadius: '16px 16px 0 0',
                color: '#fff'
              }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>
                  ✏️ {L('Edit Employee', 'แก้ไขข้อมูลพนักงาน')}
                </div>
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
                  {L('ID', 'รหัส')}: #{selectedEmployee.id}
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: 24 }}>
                <div style={{ display: 'grid', gap: 16 }}>

                  {/* Name (English) */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      {L('Name (English)', 'ชื่อ-นามสกุล (อังกฤษ)')}
                    </label>
                    <input
                      type="text"
                      value={selectedEmployee.name}
                      onChange={e => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
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

                  {/* Name (Thai) */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      {L('Name (Thai)', 'ชื่อ-นามสกุล (ไทย)')}
                    </label>
                    <input
                      type="text"
                      value={selectedEmployee.name_th || ''}
                      onChange={e => setSelectedEmployee({ ...selectedEmployee, name_th: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 14,
                        outline: 'none'
                      }}
                      placeholder={L('Enter Thai name', 'กรอกชื่อภาษาไทย')}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      {L('Email', 'อีเมล')}
                    </label>
                    <input
                      type="email"
                      value={selectedEmployee.email}
                      onChange={e => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
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

                  {/* Phone Number */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      {L('Phone Number', 'เบอร์โทรศัพท์')}
                    </label>
                    <input
                      type="tel"
                      value={selectedEmployee.phoneNumber || ''}
                      onChange={e => setSelectedEmployee({ ...selectedEmployee, phoneNumber: e.target.value })}
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

                  {/* Address */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      {L('Address', 'ที่อยู่')}
                    </label>
                    <textarea
                      value={selectedEmployee.address || ''}
                      onChange={e => setSelectedEmployee({ ...selectedEmployee, address: e.target.value })}
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

                  <div style={{
                    background: '#f3f4f6',
                    padding: 16,
                    borderRadius: 8,
                    border: '2px solid #d1d5db'
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
                      💰 {L('Salary & Wage Information', 'ข้อมูลเงินเดือนและค่าแรง')}
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                        {L('Monthly Salary (Baht/Month)', 'เงินเดือน (บาท/เดือน)')}
                      </label>
                      <input
                        type="number"
                        value={selectedEmployee.salary || ''}
                        onChange={e => setSelectedEmployee({ ...selectedEmployee, salary: parseFloat(e.target.value) || 0 })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none'
                        }}
                        placeholder="0.00"
                      />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                        {L('Hourly Rate (Baht/Hour)', 'ค่าแรงรายชั่วโมง (บาท/ชม.)')}
                      </label>
                      <input
                        type="number"
                        value={selectedEmployee.hourlyRate || ''}
                        onChange={e => setSelectedEmployee({ ...selectedEmployee, hourlyRate: parseFloat(e.target.value) || 0 })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none'
                        }}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                        {L('Daily Rate (Baht/Day)', 'ค่าแรงรายวัน (บาท/วัน)')}
                      </label>
                      <input
                        type="number"
                        value={selectedEmployee.dailyRate || ''}
                        onChange={e => setSelectedEmployee({ ...selectedEmployee, dailyRate: parseFloat(e.target.value) || 0 })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none'
                        }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Employment & Tax Information */}
                  <div style={{
                    background: '#fef3c7',
                    padding: 16,
                    borderRadius: 8,
                    border: '2px solid #fbbf24',
                    marginTop: 16
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#92400e', marginBottom: 12 }}>
                      📋 {L('Employment & Tax Information', 'ข้อมูลการจ้างงานและภาษี')}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                          {L('Start Date', 'วันที่เริ่มงาน')}
                        </label>
                        <input
                          type="date"
                          value={selectedEmployee.startDate || ''}
                          onChange={e => setSelectedEmployee({ ...selectedEmployee, startDate: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '2px solid #d1d5db',
                            borderRadius: 8,
                            fontSize: 14,
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                          {L('End Date', 'วันที่สิ้นสุด')}
                        </label>
                        <input
                          type="date"
                          value={selectedEmployee.endDate || ''}
                          onChange={e => setSelectedEmployee({ ...selectedEmployee, endDate: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '2px solid #d1d5db',
                            borderRadius: 8,
                            fontSize: 14,
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                        {L('Termination Type', 'ประเภทการสิ้นสุดการจ้าง')}
                      </label>
                      <select
                        value={selectedEmployee.terminationType || ''}
                        onChange={e => setSelectedEmployee({ ...selectedEmployee, terminationType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none'
                        }}
                      >
                        <option value="">{L('-- Active Employee --', '-- พนักงานปัจจุบัน --')}</option>
                        <option value="resignation">{L('Resignation', 'ลาออก')}</option>
                        <option value="termination">{L('Termination', 'เลิกจ้าง')}</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                        {L('Reason', 'สาเหตุ')}
                      </label>
                      <textarea
                        value={selectedEmployee.terminationReason || ''}
                        onChange={e => setSelectedEmployee({ ...selectedEmployee, terminationReason: e.target.value })}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none',
                          resize: 'vertical'
                        }}
                        placeholder={L('Enter termination reason (if applicable)', 'กรอกสาเหตุการสิ้นสุดการจ้าง (ถ้ามี)')}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                        {L('Tax ID', 'TAX ID')}
                      </label>
                      <input
                        type="text"
                        value={selectedEmployee.taxId || ''}
                        onChange={e => setSelectedEmployee({ ...selectedEmployee, taxId: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none'
                        }}
                        placeholder={L('Enter Tax ID', 'กรอก TAX ID')}
                        maxLength={13}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '2px solid #e5e7eb',
                display: 'flex',
                gap: 12,
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedEmployee(null)
                  }}
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
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '10px 24px',
                    background: saving ? '#9ca3af' : '#4b5563',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: saving ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {saving ? '⏳ กำลังบันทึก...' : `💾 ${L('Save', 'บันทึก')}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddModal && (
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
            zIndex: 9999
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
                background: '#6b7280',
                padding: 24,
                borderRadius: '16px 16px 0 0',
                color: '#fff'
              }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>
                  ➕ {L('Add New Employee', 'เพิ่มพนักงานใหม่')}
                </div>
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
                  {L('Fill in the form below', 'กรอกข้อมูลในแบบฟอร์มด้านล่าง')}
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: 24 }}>
                <div style={{ display: 'grid', gap: 16 }}>

                  {/* Name (English) */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      {L('Name (English)', 'ชื่อ-นามสกุล (อังกฤษ)')} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={newEmployee.name}
                      onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
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

                  {/* Name (Thai) */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      {L('Name (Thai)', 'ชื่อ-นามสกุล (ไทย)')}
                    </label>
                    <input
                      type="text"
                      value={newEmployee.name_th}
                      onChange={e => setNewEmployee({ ...newEmployee, name_th: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 14,
                        outline: 'none'
                      }}
                      placeholder={L('Enter Thai name', 'กรอกชื่อภาษาไทย')}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      {L('Email', 'อีเมล')}
                    </label>
                    <input
                      type="email"
                      value={newEmployee.email}
                      onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
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

                  {/* Position/Department */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      {L('Position/Department', 'ตำแหน่ง/แผนก')} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={newEmployee.typeID}
                      onChange={e => setNewEmployee({ ...newEmployee, typeID: parseInt(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 14,
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value={1}>System Administrator - ผู้ดูแลระบบ</option>
                      <option value={2}>Manager - ผู้จัดการ</option>
                      <option value={3}>นักบัญชี - Accountant</option>
                      <option value={4}>ผู้บริหาร - Executive</option>
                      <option value={5}>ช่างติดตั้ง - Technician</option>
                      <option value={6}>พนักงานขาย - Sales</option>
                      <option value={7}>Admin - แอดมิน</option>
                      <option value={8}>HR Officer - HR/เงินเดือน</option>
                      <option value={9}>หัวหน้าแผนกการตลาด - M-Marketing</option>
                      <option value={10}>ผู้จัดการสาขา - Branch Manager</option>
                      <option value={11}>หัวหน้าแผนกบัญชี - M-Accounting</option>
                      <option value={12}>นักศึกษาฝึกงาน - Internship</option>
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      {L('Phone Number', 'เบอร์โทรศัพท์')}
                    </label>
                    <input
                      type="tel"
                      value={newEmployee.phoneNumber}
                      onChange={e => setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })}
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

                  {/* Address */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      {L('Address', 'ที่อยู่')}
                    </label>
                    <textarea
                      value={newEmployee.address}
                      onChange={e => setNewEmployee({ ...newEmployee, address: e.target.value })}
                      rows={2}
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

                  {/* Salary & Wage Rates Section */}
                  <div style={{
                    background: '#f3f4f6',
                    padding: 16,
                    borderRadius: 8,
                    border: '2px solid #d1d5db'
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginBottom: 12 }}>
                      💰 {L('Salary & Wage Information', 'ข้อมูลเงินเดือนและค่าแรง')}
                    </div>

                    {/* Monthly Salary */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                        {L('Monthly Salary (Baht/Month)', 'เงินเดือน (บาท/เดือน)')}
                      </label>
                      <input
                        type="number"
                        value={newEmployee.salary || ''}
                        onChange={e => setNewEmployee({ ...newEmployee, salary: parseFloat(e.target.value) || 0 })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none'
                        }}
                        placeholder="0.00"
                      />
                    </div>

                    {/* Hourly Rate */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                        {L('Hourly Rate (Baht/Hour)', 'ค่าแรงรายชั่วโมง (บาท/ชม.)')}
                      </label>
                      <input
                        type="number"
                        value={newEmployee.hourlyRate || ''}
                        onChange={e => setNewEmployee({ ...newEmployee, hourlyRate: parseFloat(e.target.value) || 0 })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none'
                        }}
                        placeholder="0.00"
                      />
                    </div>

                    {/* Daily Rate */}
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                        {L('Daily Rate (Baht/Day)', 'ค่าแรงรายวัน (บาท/วัน)')}
                      </label>
                      <input
                        type="number"
                        value={newEmployee.dailyRate || ''}
                        onChange={e => setNewEmployee({ ...newEmployee, dailyRate: parseFloat(e.target.value) || 0 })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none'
                        }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Employment & Tax Information */}
                  <div style={{
                    background: '#fef3c7',
                    padding: 16,
                    borderRadius: 8,
                    border: '2px solid #fbbf24',
                    marginTop: 16
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#92400e', marginBottom: 12 }}>
                      📋 {L('Employment & Tax Information', 'ข้อมูลการจ้างงานและภาษี')}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                          {L('Start Date', 'วันที่เริ่มงาน')}
                        </label>
                        <input
                          type="date"
                          value={newEmployee.startDate || ''}
                          onChange={e => setNewEmployee({ ...newEmployee, startDate: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '2px solid #d1d5db',
                            borderRadius: 8,
                            fontSize: 14,
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                          {L('End Date', 'วันที่สิ้นสุด')}
                        </label>
                        <input
                          type="date"
                          value={newEmployee.endDate || ''}
                          onChange={e => setNewEmployee({ ...newEmployee, endDate: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '2px solid #d1d5db',
                            borderRadius: 8,
                            fontSize: 14,
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                        {L('Termination Type', 'ประเภทการสิ้นสุดการจ้าง')}
                      </label>
                      <select
                        value={newEmployee.terminationType || ''}
                        onChange={e => setNewEmployee({ ...newEmployee, terminationType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none'
                        }}
                      >
                        <option value="">{L('-- Active Employee --', '-- พนักงานปัจจุบัน --')}</option>
                        <option value="resignation">{L('Resignation', 'ลาออก')}</option>
                        <option value="termination">{L('Termination', 'เลิกจ้าง')}</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                        {L('Reason', 'สาเหตุ')}
                      </label>
                      <textarea
                        value={newEmployee.terminationReason || ''}
                        onChange={e => setNewEmployee({ ...newEmployee, terminationReason: e.target.value })}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none',
                          resize: 'vertical'
                        }}
                        placeholder={L('Enter termination reason (if applicable)', 'กรอกสาเหตุการสิ้นสุดการจ้าง (ถ้ามี)')}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#4b5563' }}>
                        {L('Tax ID', 'TAX ID')}
                      </label>
                      <input
                        type="text"
                        value={newEmployee.taxId || ''}
                        onChange={e => setNewEmployee({ ...newEmployee, taxId: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #d1d5db',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none'
                        }}
                        placeholder={L('Enter Tax ID', 'กรอก TAX ID')}
                        maxLength={13}
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '2px solid #e5e7eb',
                display: 'flex',
                gap: 12,
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewEmployee({
                      name: '',
                      name_th: '',
                      email: '',
                      typeID: 6,
                      phoneNumber: '',
                      address: '',
                      salary: 0,
                      hourlyRate: 0,
                      dailyRate: 0,
                      startDate: '',
                      endDate: '',
                      terminationReason: '',
                      terminationType: '',
                      taxId: ''
                    })
                  }}
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
                  onClick={handleAddEmployee}
                  disabled={saving}
                  style={{
                    padding: '10px 24px',
                    background: saving ? '#9ca3af' : '#4b5563',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: saving ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  {saving ? '⏳ กำลังบันทึก...' : `💾 ${L('Save', 'บันทึก')}`}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AccWindow>
  )
}
