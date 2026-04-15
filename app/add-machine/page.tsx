"use client"

import React, { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

type MachineId = number | string

type MachineRow = {
  deviceID?: MachineId
  deviceName?: string | null
  ksaveID?: string | null
  series_no?: string | null
  ipAddress?: string | null
  location?: string | null
  site?: string | null
  status?: string | null
  beforeMeterNo?: string | null
  metricsMeterNo?: string | null
  U_email?: string | null
  P_email?: string | null
  phone?: string | null
  pass_phone?: string | null
  create_by?: string | null
  latitude?: string | number | null
  longitude?: string | number | null
  customerName?: string | null
  customerNameEn?: string | null
  customerPhone?: string | null
  customerAddress?: string | null
  customer_id?: number | null
  record_scope?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type MachinesResponse = {
  ok?: boolean
  machines?: MachineRow[]
  machine?: MachineRow
  error?: string
  [key: string]: unknown
}

type MachineFormState = {
  name: string
  ksave: string
  seriesNo: string
  site: string
  status: string
  recordScope: string
  location: string
  ipAddress: string
  beforeMeterNo: string
  metricsMeterNo: string
  phone: string
  userEmail: string
  partnerEmail: string
  password: string
  customerId: string
  customerName: string
  customerNameEn: string
  customerPhone: string
  customerAddress: string
  latitude: string
  longitude: string
  createdBy: string
}

const initialFormState: MachineFormState = {
  name: '',
  ksave: '',
  seriesNo: '',
  site: 'thailand',
  status: 'OK',
  recordScope: 'installed',
  location: '',
  ipAddress: '',
  beforeMeterNo: '1',
  metricsMeterNo: '2',
  phone: '',
  userEmail: '',
  partnerEmail: '',
  password: '',
  customerId: '',
  customerName: '',
  customerNameEn: '',
  customerPhone: '',
  customerAddress: '',
  latitude: '',
  longitude: '',
  createdBy: 'administrator'
}

const sectionStyle: React.CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  padding: 16
}

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: 15,
  fontWeight: 700,
  color: '#111827'
}

const fieldGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  marginBottom: 6,
  color: '#374151',
  fontWeight: 500
}

const statusOptions = ['OK', 'ON', 'OFF', 'active', 'inactive', 'Enable', 'Disable']
const siteOptions = ['thailand', 'korea', 'vietnam', 'malaysia']
const scopeOptions = [
  { value: 'installed', label: 'Installed' },
  { value: 'pre_install', label: 'Pre-Install' }
]

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error)

const mapMachineToForm = (machine: MachineRow): MachineFormState => ({
  name: String(machine.deviceName || ''),
  ksave: String(machine.ksaveID || ''),
  seriesNo: String(machine.series_no || ''),
  site: String(machine.site || 'thailand'),
  status: String(machine.status || 'OK'),
  recordScope: String(machine.record_scope || 'installed'),
  location: String(machine.location || ''),
  ipAddress: String(machine.ipAddress || ''),
  beforeMeterNo: String(machine.beforeMeterNo || '1'),
  metricsMeterNo: String(machine.metricsMeterNo || '2'),
  phone: String(machine.phone || ''),
  userEmail: String(machine.U_email || ''),
  partnerEmail: String(machine.P_email || ''),
  password: String(machine.pass_phone || ''),
  customerId: machine.customer_id == null ? '' : String(machine.customer_id),
  customerName: String(machine.customerName || ''),
  customerNameEn: String(machine.customerNameEn || ''),
  customerPhone: String(machine.customerPhone || ''),
  customerAddress: String(machine.customerAddress || ''),
  latitude: machine.latitude == null ? '' : String(machine.latitude),
  longitude: machine.longitude == null ? '' : String(machine.longitude),
  createdBy: String(machine.create_by || 'administrator')
})

const buildPayload = (form: MachineFormState) => ({
  name: form.name,
  ksave: form.ksave,
  seriesNo: form.seriesNo,
  site: form.site,
  status: form.status,
  recordScope: form.recordScope,
  location: form.location,
  ipAddress: form.ipAddress,
  beforeMeterNo: form.beforeMeterNo,
  metricsMeterNo: form.metricsMeterNo,
  phone: form.phone,
  email: form.userEmail,
  userEmail: form.userEmail,
  partnerEmail: form.partnerEmail || form.userEmail,
  password: form.password,
  customerId: form.customerId,
  customerName: form.customerName,
  customerNameEn: form.customerNameEn,
  customerPhone: form.customerPhone,
  customerAddress: form.customerAddress,
  latitude: form.latitude,
  longitude: form.longitude,
  createdBy: form.createdBy
})

function FormField({
  label,
  children,
  fullWidth = false
}: {
  label: string
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <div style={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function FormSection({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={sectionStyle}>
      <h3 style={sectionTitleStyle}>{title}</h3>
      <div style={fieldGridStyle}>{children}</div>
    </div>
  )
}

function MachineFormFields({
  form,
  onChange,
  showPassword,
  onTogglePassword
}: {
  form: MachineFormState
  onChange: (field: keyof MachineFormState, value: string) => void
  showPassword: boolean
  onTogglePassword: () => void
}) {
  return (
    <>
      <FormSection title="Device Identity">
        <FormField label="KSave Name / Device Name *">
          <input
            className="k-input"
            value={form.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="K-Saver-30kVA"
            style={inputStyle}
          />
        </FormField>
        <FormField label="KSave ID *">
          <input
            className="k-input"
            value={form.ksave}
            onChange={(e) => onChange('ksave', e.target.value)}
            placeholder="KSAVE-TH-000001"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Series No.">
          <input
            className="k-input"
            value={form.seriesNo}
            onChange={(e) => onChange('seriesNo', e.target.value)}
            placeholder="ZE KOR-C-20260413-TH000001"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Site">
          <select
            className="k-input"
            value={form.site}
            onChange={(e) => onChange('site', e.target.value)}
            style={inputStyle}
          >
            {siteOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Status">
          <select
            className="k-input"
            value={form.status}
            onChange={(e) => onChange('status', e.target.value)}
            style={inputStyle}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Record Scope">
          <select
            className="k-input"
            value={form.recordScope}
            onChange={(e) => onChange('recordScope', e.target.value)}
            style={inputStyle}
          >
            {scopeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Created By">
          <input
            className="k-input"
            value={form.createdBy}
            onChange={(e) => onChange('createdBy', e.target.value)}
            placeholder="administrator"
            style={inputStyle}
          />
        </FormField>
      </FormSection>

      <FormSection title="Meter & Location">
        <FormField label="Location / Site Name">
          <input
            className="k-input"
            value={form.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="Location or site name"
            style={inputStyle}
          />
        </FormField>
        <FormField label="IP Address">
          <input
            className="k-input"
            value={form.ipAddress}
            onChange={(e) => onChange('ipAddress', e.target.value)}
            placeholder="192.168.1.100"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Before Meter No.">
          <input
            className="k-input"
            value={form.beforeMeterNo}
            onChange={(e) => onChange('beforeMeterNo', e.target.value)}
            placeholder="1"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Metrics Meter No.">
          <input
            className="k-input"
            value={form.metricsMeterNo}
            onChange={(e) => onChange('metricsMeterNo', e.target.value)}
            placeholder="2"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Latitude">
          <input
            className="k-input"
            type="number"
            step="0.00000001"
            value={form.latitude}
            onChange={(e) => onChange('latitude', e.target.value)}
            placeholder="13.75633000"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Longitude">
          <input
            className="k-input"
            type="number"
            step="0.00000001"
            value={form.longitude}
            onChange={(e) => onChange('longitude', e.target.value)}
            placeholder="100.50177000"
            style={inputStyle}
          />
        </FormField>
      </FormSection>

      <FormSection title="Access & Contact">
        <FormField label="Device Phone">
          <input
            className="k-input"
            type="tel"
            value={form.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Phone number device"
            style={inputStyle}
          />
        </FormField>
        <FormField label="User Email (U_email)">
          <input
            className="k-input"
            type="email"
            value={form.userEmail}
            onChange={(e) => onChange('userEmail', e.target.value)}
            placeholder="user@example.com"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Partner Email (P_email)">
          <input
            className="k-input"
            type="email"
            value={form.partnerEmail}
            onChange={(e) => onChange('partnerEmail', e.target.value)}
            placeholder="partner@example.com"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Password (pass_phone)">
          <div style={{ position: 'relative' }}>
            <input
              className="k-input"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder="Password"
              style={{ ...inputStyle, paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                padding: 0,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </FormField>
      </FormSection>

      <FormSection title="Customer Information">
        <FormField label="Customer ID">
          <input
            className="k-input"
            type="number"
            value={form.customerId}
            onChange={(e) => onChange('customerId', e.target.value)}
            placeholder="Optional customer_id"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Customer Name">
          <input
            className="k-input"
            value={form.customerName}
            onChange={(e) => onChange('customerName', e.target.value)}
            placeholder="Customer name"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Customer Name (English)">
          <input
            className="k-input"
            value={form.customerNameEn}
            onChange={(e) => onChange('customerNameEn', e.target.value)}
            placeholder="Customer name in English"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Customer Phone">
          <input
            className="k-input"
            value={form.customerPhone}
            onChange={(e) => onChange('customerPhone', e.target.value)}
            placeholder="Customer phone"
            style={inputStyle}
          />
        </FormField>
        <FormField label="Customer Address" fullWidth>
          <textarea
            className="k-input"
            value={form.customerAddress}
            onChange={(e) => onChange('customerAddress', e.target.value)}
            placeholder="Customer address"
            rows={3}
            style={{ ...inputStyle, minHeight: 88, resize: 'vertical' }}
          />
        </FormField>
      </FormSection>
    </>
  )
}

export default function AddMachinePage() {
  const [form, setForm] = useState<MachineFormState>(initialFormState)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [machines, setMachines] = useState<MachineRow[]>([])
  const [loadingMachines, setLoadingMachines] = useState(false)
  const [editingId, setEditingId] = useState<MachineId | null>(null)
  const [editForm, setEditForm] = useState<MachineFormState>(initialFormState)
  const [updating, setUpdating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)

  const updateFormField = (field: keyof MachineFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updateEditFormField = (field: keyof MachineFormState, value: string) => {
    setEditForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setForm(initialFormState)
    setResult(null)
    setError(null)
    setShowPassword(false)
  }

  async function fetchMachines() {
    setLoadingMachines(true)
    try {
      const res = await fetch('/api/admin_route/machines?limit=200')
      const data = await res.json() as MachinesResponse
      if (data.ok && Array.isArray(data.machines)) {
        setMachines(data.machines)
      } else {
        setMachines([])
      }
    } catch (fetchError: unknown) {
      console.error('Failed to fetch machines:', fetchError)
      setMachines([])
    } finally {
      setLoadingMachines(false)
    }
  }

  useEffect(() => {
    fetchMachines()
  }, [])

  async function submitMachine() {
    setSaving(true)
    setError(null)
    setResult(null)
    setSuccess(null)

    if (!form.name.trim() || !form.ksave.trim()) {
      setError('Please provide device name and KSAVE ID.')
      setSaving(false)
      throw new Error('validation')
    }

    try {
      const res = await fetch('/api/admin_route/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(form))
      })

      const text = await res.text().catch(() => '')
      if (!res.ok) {
        let serverMsg = text
        try {
          const parsed = JSON.parse(text || '{}') as MachinesResponse
          if (parsed.error) serverMsg = parsed.error
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(serverMsg || `${res.status} ${res.statusText}`)
      }

      let body: Record<string, unknown> = {}
      try {
        body = JSON.parse(text || '{}') as Record<string, unknown>
      } catch {
        body = {}
      }

      setResult(body)

      if (body.ok) {
        const machine = body.machine as MachineRow | undefined
        const deviceCode = machine?.ksaveID || form.ksave
        setSuccess(`Saved successfully${deviceCode ? `: ${deviceCode}` : ''}`)
        setTimeout(() => setSuccess(null), 4000)
        resetForm()
        await fetchMachines()
      }

      return body
    } catch (submitError: unknown) {
      const message = getErrorMessage(submitError)
      setError(`Save failed: ${message}`)
      console.error('AddMachine submit error:', submitError)
      throw submitError
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await submitMachine()
    } catch {
      // error already set
    }
  }

  function startEdit(machine: MachineRow) {
    setEditingId(machine.deviceID ?? null)
    setEditForm(mapMachineToForm(machine))
    setShowEditPassword(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(initialFormState)
    setShowEditPassword(false)
  }

  async function saveEdit() {
    if (editingId === null) return

    if (!editForm.name.trim() || !editForm.ksave.trim()) {
      setError('Please provide device name and KSAVE ID before saving.')
      return
    }

    setUpdating(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin_route/machines?id=${encodeURIComponent(String(editingId))}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceName: editForm.name,
          ksaveID: editForm.ksave,
          seriesNo: editForm.seriesNo,
          site: editForm.site,
          status: editForm.status,
          recordScope: editForm.recordScope,
          location: editForm.location,
          phone: editForm.phone,
          userEmail: editForm.userEmail,
          partnerEmail: editForm.partnerEmail,
          password: editForm.password,
          ipAddress: editForm.ipAddress,
          beforeMeterNo: editForm.beforeMeterNo,
          metricsMeterNo: editForm.metricsMeterNo,
          customerId: editForm.customerId,
          customerName: editForm.customerName,
          customerNameEn: editForm.customerNameEn,
          customerPhone: editForm.customerPhone,
          customerAddress: editForm.customerAddress,
          latitude: editForm.latitude,
          longitude: editForm.longitude,
          createdBy: editForm.createdBy
        })
      })

      const data = await res.json() as MachinesResponse

      if (!res.ok) {
        throw new Error(data.error || 'Update failed')
      }

      if (data.ok) {
        setSuccess('Updated successfully')
        setTimeout(() => setSuccess(null), 3000)
        cancelEdit()
        await fetchMachines()
      }
    } catch (updateError: unknown) {
      setError(`Update failed: ${getErrorMessage(updateError)}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f9fafb' }}>
      <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Add Machine</h1>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Register new device with all available database fields.</p>
        </div>
        <Link href="/meter-seting" className="k-btn k-btn-ghost">← Back to Korea Admin</Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1.05fr) minmax(500px, 0.95fr)', gap: 24 }}>
        <div style={{ background: 'white', borderRadius: 8, padding: 24, border: '1px solid #e5e7eb', height: 'fit-content' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 600 }}>Add New Machine</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {success && (
              <div style={{ padding: 10, background: '#ecfccb', border: '1px solid #86efac', color: '#065f46', borderRadius: 6 }}>
                {success}
              </div>
            )}

            <MachineFormFields
              form={form}
              onChange={updateFormField}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((value) => !value)}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button className="k-btn k-btn-primary" type="submit" disabled={saving || !form.name.trim() || !form.ksave.trim()}>
                {saving ? 'Saving...' : 'Create'}
              </button>
              <button className="k-btn k-btn-ghost" type="button" onClick={resetForm}>
                Reset
              </button>
            </div>

            {error && (
              <div style={{ color: '#b91c1c' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Save failed</div>
                <div>{error}</div>
                <div style={{ marginTop: 8 }}>
                  <button className="k-btn k-btn-primary" type="button" onClick={() => submitMachine()} disabled={saving}>
                    Retry
                  </button>
                </div>
              </div>
            )}

            {result && (
              <pre style={{ margin: 0, background: '#f8fafc', padding: 12, fontSize: 12, borderRadius: 8, overflowX: 'auto' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </form>
        </div>

        <div style={{ background: 'white', borderRadius: 8, padding: 24, border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Registered Machines ({machines.length})</h2>
            <button
              onClick={fetchMachines}
              disabled={loadingMachines}
              className="k-btn k-btn-ghost"
              style={{ fontSize: 13, padding: '6px 12px' }}
            >
              {loadingMachines ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loadingMachines && machines.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading machines...</div>
          ) : machines.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <div>No machines registered yet</div>
            </div>
          ) : (
            <div style={{ overflow: 'auto', maxHeight: 900 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 1100 }}>
                <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Device</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>KSAVE ID</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Site</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Scope</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Series No.</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Customer</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Location</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Owner Email</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Status</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Updated</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map((machine, idx) => {
                    const isEditing = editingId === machine.deviceID
                    const customerLabel = machine.customerNameEn || machine.customerName || '—'
                    const ownerEmail = machine.U_email || machine.P_email || '—'

                    return (
                      <Fragment key={String(machine.deviceID || idx)}>
                        <tr
                          style={{
                            borderBottom: isEditing ? 'none' : '1px solid #f3f4f6',
                            background: idx % 2 === 0 ? 'white' : '#f9fafb'
                          }}
                        >
                          <td style={{ padding: '12px 8px', color: '#374151' }}>
                            <div style={{ fontWeight: 600 }}>{machine.deviceName || '—'}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>
                              Meters: {machine.beforeMeterNo || '—'} / {machine.metricsMeterNo || '—'}
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px', color: '#374151', fontFamily: 'monospace' }}>{machine.ksaveID || '—'}</td>
                          <td style={{ padding: '12px 8px', color: '#6b7280' }}>{machine.site || '—'}</td>
                          <td style={{ padding: '12px 8px', color: '#6b7280' }}>{machine.record_scope || 'installed'}</td>
                          <td style={{ padding: '12px 8px', color: '#6b7280', fontFamily: 'monospace' }}>{machine.series_no || '—'}</td>
                          <td style={{ padding: '12px 8px', color: '#6b7280' }}>{customerLabel}</td>
                          <td style={{ padding: '12px 8px', color: '#6b7280' }}>{machine.location || '—'}</td>
                          <td style={{ padding: '12px 8px', color: '#6b7280' }}>{ownerEmail}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 500,
                              background: ['ON', 'OK', 'active', 'Enable'].includes(String(machine.status || ''))
                                ? '#dcfce7'
                                : '#f3f4f6',
                              color: ['ON', 'OK', 'active', 'Enable'].includes(String(machine.status || ''))
                                ? '#166534'
                                : '#6b7280'
                            }}>
                              {machine.status || 'unknown'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', color: '#6b7280', fontSize: 12 }}>
                            {machine.updated_at ? new Date(machine.updated_at).toLocaleString() : '—'}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <button
                              onClick={() => startEdit(machine)}
                              disabled={editingId !== null && !isEditing}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 4,
                                border: '1px solid #3b82f6',
                                background: 'white',
                                color: '#3b82f6',
                                cursor: editingId !== null && !isEditing ? 'not-allowed' : 'pointer',
                                fontSize: 12,
                                fontWeight: 500,
                                opacity: editingId !== null && !isEditing ? 0.5 : 1
                              }}
                            >
                              {isEditing ? 'Editing' : 'Edit'}
                            </button>
                          </td>
                        </tr>

                        {isEditing && (
                          <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fff7ed' }}>
                            <td colSpan={11} style={{ padding: 16 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <MachineFormFields
                                  form={editForm}
                                  onChange={updateEditFormField}
                                  showPassword={showEditPassword}
                                  onTogglePassword={() => setShowEditPassword((value) => !value)}
                                />

                                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={cancelEdit}
                                    disabled={updating}
                                    className="k-btn k-btn-ghost"
                                    type="button"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={saveEdit}
                                    disabled={updating || !editForm.name.trim() || !editForm.ksave.trim()}
                                    className="k-btn k-btn-primary"
                                    type="button"
                                  >
                                    {updating ? 'Saving...' : 'Save changes'}
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
