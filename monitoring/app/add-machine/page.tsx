"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AddMachinePage() {
  const [name, setName] = useState('')
  const [ksave, setKsave] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const [beforeMeterNo, setBeforeMeterNo] = useState('')
  const [metricsMeterNo, setMetricsMeterNo] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [machines, setMachines] = useState<any[]>([])
  const [loadingMachines, setLoadingMachines] = useState(false)
  
  // Edit mode states
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editKsave, setEditKsave] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editIpAddress, setEditIpAddress] = useState('')
  const [editBeforeMeterNo, setEditBeforeMeterNo] = useState('')
  const [editMetricsMeterNo, setEditMetricsMeterNo] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  // Fetch machines list from PostgreSQL
  async function fetchMachines() {
    setLoadingMachines(true)
    try {
      const res = await fetch('/api/admin_route/machines')
      const data = await res.json()
      console.log('📊 Fetch machines response:', data)
      console.log('📊 Machines count:', data.machines?.length || 0)
      if (data.ok && data.machines) {
        setMachines(data.machines)
        console.log('✅ Machines set to state:', data.machines.length)
      } else {
        console.warn('⚠️ API response not ok or no machines:', data)
      }
    } catch (err) {
      console.error('❌ Failed to fetch machines:', err)
    } finally {
      setLoadingMachines(false)
    }
  }

  // Load machines on mount
  useEffect(() => {
    fetchMachines()
  }, [])

  // core submit logic separated so we can retry without an event
  async function submitMachine() {
    setSaving(true)
    setError(null)
    setResult(null)
    setSuccess(null)

    // basic client-side validation
    if (!name.trim() || !ksave.trim()) {
      setError('Please provide machine name and series no (ksave).')
      setSaving(false)
      throw new Error('validation')
    }

    try {
      const res = await fetch('/api/admin_route/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ksave, location, phone, email, password, ipAddress, beforeMeterNo, metricsMeterNo })
      })

      // read response text for better error messages
      const text = await res.text().catch(() => '')
      if (!res.ok) {
        let serverMsg = text
        try {
          const parsed = JSON.parse(text || '{}')
          if (parsed && parsed.error) serverMsg = parsed.error
        } catch (_) {}
        const msg = serverMsg || `${res.status} ${res.statusText}`
        throw new Error(msg)
      }

      let body: any = {}
      try { body = JSON.parse(text || '{}') } catch (_) { body = {} }
      setResult(body)

      if (body && body.ok) {
        const dev = body?.machine?.ksaveID || body?.machine?.ksaveid || body?.machine?.ksave || ksave
        setSuccess(`Saved successfully${dev ? `: ${dev}` : ''}`)
        setTimeout(() => setSuccess(null), 4000)

        // Refresh machines list
        fetchMachines()
      }

      // clear inputs only on success
      setName('')
      setKsave('')
      setLocation('')
      setPhone('')
      setEmail('')
      setPassword('')
      setIpAddress('')
      setBeforeMeterNo('')
      setMetricsMeterNo('')
      return body
    } catch (err: any) {
      const msg = err?.message || String(err)
      setError(`Save failed: ${msg}`)
      console.error('AddMachine submit error:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await submitMachine()
    } catch (_) {
      // error already set
    }
  }

  // Edit functions
  function startEdit(machine: any) {
    setEditingId(machine.deviceID)
    setEditName(machine.deviceName || '')
    setEditKsave(machine.ksaveID || '')
    setEditLocation(machine.location || '')
    setEditPhone(machine.phone || '')
    setEditEmail(machine.U_email || '')
    setEditPassword(machine.pass_phone || '')
    setEditIpAddress(machine.ipAddress || '')
    setEditBeforeMeterNo(machine.beforeMeterNo || '')
    setEditMetricsMeterNo(machine.metricsMeterNo || '')
    setEditStatus(machine.status || 'OK')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditKsave('')
    setEditLocation('')
    setEditPhone('')
    setEditEmail('')
    setEditPassword('')
    setEditIpAddress('')
    setEditBeforeMeterNo('')
    setEditMetricsMeterNo('')
    setEditStatus('')
  }

  async function saveEdit() {
    if (!editingId) return
    
    setUpdating(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/admin_route/machines?id=${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceName: editName,
          ksaveID: editKsave,
          location: editLocation,
          phone: editPhone,
          email: editEmail,
          password: editPassword,
          ipAddress: editIpAddress,
          beforeMeterNo: editBeforeMeterNo,
          metricsMeterNo: editMetricsMeterNo,
          status: editStatus
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Update failed')
      }

      if (data.ok) {
        setSuccess('Updated successfully')
        setTimeout(() => setSuccess(null), 3000)
        cancelEdit()
        fetchMachines()
      }
    } catch (err: any) {
      setError(`Update failed: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f9fafb' }}>
      <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Add Machine</h1>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>Register new device </p>
        </div>
        <Link href="/admin/AdminKsave" className="k-btn k-btn-ghost">← Back to Admin System</Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left column - Add form */}
        <div style={{ background: 'white', borderRadius: 8, padding: 24, border: '1px solid #e5e7eb', height: 'fit-content' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 600 }}>Add New Machine</h2>
          <form onSubmit={handleSubmit}>
            {success && <div style={{ marginBottom: 12, padding: 10, background: '#ecfccb', border: '1px solid #86efac', color: '#065f46', borderRadius: 6 }}>{success}</div>}

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13 }}>KSave Name .</label>
          <input className="k-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="KSAVE01"/>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13 }}>KSave ID.</label>
          <input className="k-input" value={ksave} onChange={(e) => setKsave(e.target.value)} placeholder="KSAVE01" />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13 }}>Location / Site</label>
          <input className="k-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location or site name" />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13 }}>Phone</label>
          <input className="k-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number device" />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13 }}>Email</label>
          <input className="k-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email device" />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13 }}>Password</label>
          <input className="k-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password email" />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13 }}>IP Address</label>
          <input className="k-input" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} placeholder="Optional (e.g., 192.168.1.100)" />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13 }}>Before Meter No.</label>
          <input className="k-input" value={beforeMeterNo} onChange={(e) => setBeforeMeterNo(e.target.value)} placeholder="Optional" />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 13 }}>Metrics Meter No.</label>
          <input className="k-input" value={metricsMeterNo} onChange={(e) => setMetricsMeterNo(e.target.value)} placeholder="Optional" />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="k-btn k-btn-primary" type="submit" disabled={saving || !name.trim() || !ksave.trim()}>{saving ? 'Saving...' : 'Create'}</button>
          <button className="k-btn k-btn-ghost" type="button" onClick={() => { setName(''); setKsave(''); setLocation(''); setPhone(''); setEmail(''); setPassword(''); setIpAddress(''); setBeforeMeterNo(''); setMetricsMeterNo(''); setResult(null); setError(null) }}>Reset</button>
        </div>

        {error && (
          <div style={{ marginTop: 12, color: '#b91c1c' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Save failed</div>
            <div>{error}</div>
            <div style={{ marginTop: 8 }}>
              <button className="k-btn k-btn-primary" type="button" onClick={() => submitMachine() } disabled={saving}>Retry</button>
            </div>
          </div>
        )}

            {result && <pre style={{ marginTop: 12, background: '#f8fafc', padding: 8, fontSize: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
          </form>
        </div>

        {/* Right column - Machines list */}
        <div style={{ background: 'white', borderRadius: 8, padding: 24, border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Registered Machines ({machines.length})</h2>
            <button
              onClick={fetchMachines}
              disabled={loadingMachines}
              className="k-btn k-btn-ghost"
              style={{ fontSize: 13, padding: '6px 12px' }}
            >
              {loadingMachines ? 'Loading...' : '🔄 Refresh'}
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
            <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Device Name</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>KSAVE ID</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Location</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Phone</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Email</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Password</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>IP Address</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Before Meter</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Metrics Meter</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Status</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.map((machine, idx) => (
                    editingId === machine.deviceID ? (
                      // Edit mode row
                      <tr key={machine.deviceID || idx} style={{ background: '#fef3c7', borderBottom: '1px solid #fbbf24' }}>
                        <td style={{ padding: '8px' }}>
                          <input 
                            type="text" 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input 
                            type="text" 
                            value={editKsave} 
                            onChange={(e) => setEditKsave(e.target.value)}
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input 
                            type="text" 
                            value={editLocation} 
                            onChange={(e) => setEditLocation(e.target.value)}
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input 
                            type="text" 
                            value={editPhone} 
                            onChange={(e) => setEditPhone(e.target.value)}
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input 
                            type="email" 
                            value={editEmail} 
                            onChange={(e) => setEditEmail(e.target.value)}
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                            placeholder="Email"
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input 
                            type="password" 
                            value={editPassword} 
                            onChange={(e) => setEditPassword(e.target.value)}
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                            placeholder="Password"
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input 
                            type="text" 
                            value={editIpAddress} 
                            onChange={(e) => setEditIpAddress(e.target.value)}
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                            placeholder="IP Address"
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input 
                            type="text" 
                            value={editBeforeMeterNo} 
                            onChange={(e) => setEditBeforeMeterNo(e.target.value)}
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                            placeholder="Before Meter"
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input 
                            type="text" 
                            value={editMetricsMeterNo} 
                            onChange={(e) => setEditMetricsMeterNo(e.target.value)}
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                            placeholder="Metrics Meter"
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <select 
                            value={editStatus} 
                            onChange={(e) => setEditStatus(e.target.value)}
                            style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
                          >
                            <option value="OK">OK</option>
                            <option value="ON">ON</option>
                            <option value="OFF">OFF</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                            <button 
                              onClick={saveEdit}
                              disabled={updating || !editName.trim() || !editKsave.trim()}
                              style={{ 
                                padding: '6px 12px', 
                                borderRadius: 4, 
                                border: 'none', 
                                background: '#10b981', 
                                color: 'white', 
                                cursor: updating ? 'not-allowed' : 'pointer',
                                fontSize: 12,
                                fontWeight: 500
                              }}
                            >
                              {updating ? '...' : '💾 Save'}
                            </button>
                            <button 
                              onClick={cancelEdit}
                              disabled={updating}
                              style={{ 
                                padding: '6px 12px', 
                                borderRadius: 4, 
                                border: '1px solid #d1d5db', 
                                background: 'white', 
                                color: '#6b7280', 
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // Normal view row
                      <tr
                        key={machine.deviceID || idx}
                        style={{
                          borderBottom: '1px solid #f3f4f6',
                          background: idx % 2 === 0 ? 'white' : '#f9fafb'
                        }}
                      >
                        <td style={{ padding: '12px 8px', color: '#374151' }}>
                          {machine.deviceName || '—'}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#374151', fontFamily: 'monospace' }}>
                          {machine.ksaveID || '—'}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#6b7280' }}>
                          {machine.location || '—'}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#6b7280' }}>
                          {machine.phone || '—'}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#6b7280' }}>
                          {machine.U_email || machine.P_email || '—'}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#6b7280', fontFamily: 'monospace' }}>
                          {machine.pass_phone ? '••••••••' : '—'}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#6b7280', fontFamily: 'monospace' }}>
                          {machine.ipAddress || '—'}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#6b7280' }}>
                          {machine.beforeMeterNo || '—'}
                        </td>
                        <td style={{ padding: '12px 8px', color: '#6b7280' }}>
                          {machine.metricsMeterNo || '—'}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 500,
                            background: machine.status === 'ON' || machine.status === 'active' ? '#dcfce7' : '#f3f4f6',
                            color: machine.status === 'ON' || machine.status === 'active' ? '#166534' : '#6b7280'
                          }}>
                            {machine.status || 'unknown'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <button 
                            onClick={() => startEdit(machine)}
                            disabled={editingId !== null}
                            style={{ 
                              padding: '6px 12px', 
                              borderRadius: 4, 
                              border: '1px solid #3b82f6', 
                              background: 'white', 
                              color: '#3b82f6', 
                              cursor: editingId !== null ? 'not-allowed' : 'pointer',
                              fontSize: 12,
                              fontWeight: 500,
                              opacity: editingId !== null ? 0.5 : 1
                            }}
                          >
                            ✏️ Edit
                          </button>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
