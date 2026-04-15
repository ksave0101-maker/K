"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Column = {
  column_name: string
  data_type: string
  character_maximum_length?: number
}

export default function DatabasePage() {
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [columns, setColumns] = useState<Column[]>([])
  const [data, setData] = useState<any[]>([])
  const [totalRows, setTotalRows] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  // Inline editing states
  const [inlineEditingId, setInlineEditingId] = useState<number | null>(null)
  const [inlineEdits, setInlineEdits] = useState<Record<number, any>>({})

  // Fetch list of tables
  useEffect(() => {
    async function fetchTables() {
      try {
        const res = await fetch('/api/database/tables')
        const body = await res.json()
        if (body.success && body.tables) {
          setTables(body.tables)
          if (body.tables.length > 0) {
            setSelectedTable(body.tables[0])
          }
        }
      } catch (e) {
        console.error('Failed to fetch tables:', e)
      }
    }
    fetchTables()
  }, [])

  // Filters for influx_power_data
  const [deviceFilter, setDeviceFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (!selectedTable) return;

    async function fetchTableData() {
      setLoading(true);
      setError(null);
      try {
        let url = `/api/database/tables?table=${encodeURIComponent(selectedTable)}`;
        if (selectedTable === 'influx_power_data') {
          const params = [];
          if (deviceFilter) params.push(`device=${encodeURIComponent(deviceFilter)}`);
          if (dateFrom) params.push(`from=${encodeURIComponent(dateFrom)}`);
          if (dateTo) params.push(`to=${encodeURIComponent(dateTo)}`);
          if (params.length > 0) url += `&${params.join('&')}`;
        }
        const res = await fetch(url);
        const body = await res.json();
        if (!res.ok) {
          setError(body.error || 'Failed to load data');
        } else if (body.success) {
          setColumns(body.columns || []);
          setData(body.data || []);
          setTotalRows(body.totalRows || 0);
        }
      } catch (e: any) {
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    }
    fetchTableData();
  }, [selectedTable, deviceFilter, dateFrom, dateTo]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—'
    if (typeof value === 'boolean') return value ? '✓' : '✗'
    if (value instanceof Date) return value.toLocaleString()
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  // Handle inline edit field change
  const handleInlineChange = (rowId: number, field: string, value: any) => {
    setInlineEdits((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value
      }
    }))
  }

  // Start inline editing for a row
  const startInlineEdit = (row: any) => {
    if (selectedTable !== 'devices' && selectedTable !== 'users') return
    const rowId = selectedTable === 'devices' ? row.deviceID : row.userID
    setInlineEditingId(rowId)
    setInlineEdits({
      ...inlineEdits,
      [rowId]: { ...row }
    })
  }

  // Save inline edits
  async function saveInlineEdit(rowId: number) {
    if (!inlineEdits[rowId]) return

    setLoading(true)
    setResult(null)
    try {
      const editedData = inlineEdits[rowId]

      let res, body
      if (selectedTable === 'devices') {
        res = await fetch(`/api/admin_route/machines?id=${rowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceName: editedData.deviceName,
            ksaveID: editedData.ksaveID,
            ipAddress: editedData.ipAddress,
            location: editedData.location,
            status: editedData.status,
            beforeMeterNo: editedData.beforeMeterNo,
            metricsMeterNo: editedData.metricsMeterNo
          })
        })
        body = await res.json().catch(() => ({}))

        if (!res.ok || !body.ok) {
          setResult(`❌ Update failed: ${body?.error || res.status}`)
          return
        }

        // Update local state
        setData(prev => prev.map(row =>
          row.deviceID === rowId ? body.device : row
        ))
        setResult('✅ Device updated successfully')
      } else if (selectedTable === 'users') {
        res = await fetch(`/api/admin_route/users?id=${rowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: editedData.userName,
            userPassword: editedData.userPassword,
            userFULLNAME: editedData.userFULLNAME
          })
        })
        body = await res.json().catch(() => ({}))

        if (!res.ok || !body.ok) {
          setResult(`❌ Update failed: ${body?.error || res.status}`)
          return
        }

        // Update local state
        setData(prev => prev.map(row =>
          row.userID === rowId ? body.user : row
        ))
        setResult('✅ User updated successfully')
      }

      setInlineEditingId(null)
    } catch (err: any) {
      setResult(`❌ Update error: ${err?.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  // Cancel inline editing
  const cancelInlineEdit = () => {
    setInlineEditingId(null)
    setInlineEdits({})
  }

  // Delete a record (device or user)
  async function deleteRecord(id: number, name: string, table: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    setLoading(true)
    setResult(null)
    try {
      let res, body
      if (table === 'devices') {
        res = await fetch(`/api/admin_route/machines?id=${id}`, {
          method: 'DELETE'
        })
        body = await res.json().catch(() => ({}))

        if (!res.ok || !body.ok) {
          setResult(`❌ Delete failed: ${body?.error || res.status}`)
          return
        }

        // Remove from local state
        setData(prev => prev.filter(row => row.deviceID !== id))
        setResult('✅ Device deleted successfully')
      } else if (table === 'users') {
        res = await fetch(`/api/admin_route/users?id=${id}`, {
          method: 'DELETE'
        })
        body = await res.json().catch(() => ({}))

        if (!res.ok || !body.ok) {
          setResult(`❌ Delete failed: ${body?.error || res.status}`)
          return
        }

        // Remove from local state
        setData(prev => prev.filter(row => row.userID !== id))
        setResult('✅ User deleted successfully')
      }

      setTotalRows(prev => prev - 1)
    } catch (err: any) {
      setResult(`❌ Delete error: ${err?.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f9fafb' }}>
      <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Database Browser</h1>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>View all tables and data in PostgreSQL database</p>
        </div>
        <Link href="/sites" className="k-btn k-btn-ghost">← Back to Sites</Link>
      </header>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Sidebar - Table list */}
        <div style={{ width: 250, background: 'white', borderRadius: 8, padding: 16, height: 'fit-content', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600 }}>Tables ({tables.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {tables.map(table => (
              <button
                key={table}
                onClick={() => setSelectedTable(table)}
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: selectedTable === table ? '#3b82f6' : 'transparent',
                  color: selectedTable === table ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: selectedTable === table ? 600 : 400,
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (selectedTable !== table) {
                    e.currentTarget.style.background = '#f3f4f6'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTable !== table) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {table}
              </button>
            ))}
          </div>
        </div>

        {/* Main content - Table data */}
        <div style={{ flex: 1, background: 'white', borderRadius: 8, padding: 20, border: '1px solid #e5e7eb' }}>
          {selectedTable && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                  {selectedTable}
                  <span style={{ marginLeft: 12, fontSize: 14, color: '#6b7280', fontWeight: 400 }}>
                    ({totalRows} rows total, showing last 100)
                  </span>
                </h2>
                <button
                  onClick={() => setSelectedTable(selectedTable)}
                  style={{
                    padding: '6px 12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
              {/* Filters for influx_power_data */}
              {selectedTable === 'influx_power_data' && (
                <div style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    className="k-input"
                    style={{ minWidth: 180 }}
                    placeholder="Filter by device"
                    value={deviceFilter}
                    onChange={e => setDeviceFilter(e.target.value)}
                  />
                  <label style={{ fontSize: 14 }}>Updated at from:</label>
                  <input
                    className="k-input"
                    type="datetime-local"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                  />
                  <label style={{ fontSize: 14 }}>to:</label>
                  <input
                    className="k-input"
                    type="datetime-local"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                  />
                  <button
                    className="k-btn k-btn-primary"
                    type="button"
                    onClick={() => {
                      // Just trigger the effect by updating state (already handled by useEffect)
                      setDeviceFilter(deviceFilter);
                      setDateFrom(dateFrom);
                      setDateTo(dateTo);
                    }}
                  >
                    Select
                  </button>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              Loading...
            </div>
          )}

          {error && (
            <div style={{ padding: 20, background: '#fee2e2', color: '#dc2626', borderRadius: 6, marginBottom: 16 }}>
              Error: {error}
            </div>
          )}

          {result && (
            <div style={{
              padding: 16,
              background: result.startsWith('✅') ? '#d1fae5' : '#fee2e2',
              color: result.startsWith('✅') ? '#065f46' : '#dc2626',
              borderRadius: 6,
              marginBottom: 16,
              fontSize: 14
            }}>
              {result}
            </div>
          )}

          {!loading && !error && data.length === 0 && selectedTable && (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              No data in this table
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <div style={{ overflowX: 'auto', overflowY: 'visible', maxWidth: '100%' }}>
              <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    {columns.map((col) => (
                      <th
                        key={col.column_name}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: '#374151',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {col.column_name}
                        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400, marginTop: 2 }}>
                          {col.data_type}
                        </div>
                      </th>
                    ))}
                    {(selectedTable === 'devices' || selectedTable === 'users') && (
                      <th style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#374151',
                        whiteSpace: 'nowrap'
                      }}>
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        background: idx % 2 === 0 ? 'white' : '#f9fafb'
                      }}
                    >
                      {columns.map((col) => {
                        const isEditing = (selectedTable === 'devices' && inlineEditingId === row.deviceID) ||
                                         (selectedTable === 'users' && inlineEditingId === row.userID)
                        const fieldName = col.column_name
                        const deviceEditableFields = ['deviceName', 'ksaveID', 'ipAddress', 'location', 'status', 'beforeMeterNo', 'metricsMeterNo']
                        const userEditableFields = ['userName', 'userPassword', 'userFULLNAME']
                        const isEditable = (selectedTable === 'devices' && deviceEditableFields.includes(fieldName)) ||
                                          (selectedTable === 'users' && userEditableFields.includes(fieldName))

                        return (
                          <td
                            key={col.column_name}
                            style={{
                              padding: '12px 16px',
                              color: '#374151',
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={formatValue(row[col.column_name])}
                          >
                            {isEditing && isEditable ? (
                              <input
                                className="k-input"
                                style={{ width: '100%', minWidth: 100, fontSize: 13, padding: '4px 8px' }}
                                value={
                                  selectedTable === 'devices'
                                    ? (inlineEdits[row.deviceID]?.[fieldName] ?? '')
                                    : (inlineEdits[row.userID]?.[fieldName] ?? '')
                                }
                                onChange={(e) => {
                                  const rowId = selectedTable === 'devices' ? row.deviceID : row.userID
                                  handleInlineChange(rowId, fieldName, e.target.value)
                                }}
                              />
                            ) : (
                              formatValue(row[col.column_name])
                            )}
                          </td>
                        )
                      })}
                      {(selectedTable === 'devices' || selectedTable === 'users') && (
                        <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {((selectedTable === 'devices' && inlineEditingId === row.deviceID) ||
                            (selectedTable === 'users' && inlineEditingId === row.userID)) ? (
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              <button
                                onClick={() => {
                                  const rowId = selectedTable === 'devices' ? row.deviceID : row.userID
                                  saveInlineEdit(rowId)
                                }}
                                disabled={loading}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: 12,
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  cursor: loading ? 'not-allowed' : 'pointer',
                                  opacity: loading ? 0.6 : 1
                                }}
                              >
                                💾 Save
                              </button>
                              <button
                                onClick={cancelInlineEdit}
                                disabled={loading}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: 12,
                                  background: '#6b7280',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  cursor: loading ? 'not-allowed' : 'pointer',
                                  opacity: loading ? 0.6 : 1
                                }}
                              >
                                ✖️ Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                              <button
                                onClick={() => startInlineEdit(row)}
                                disabled={loading || inlineEditingId !== null}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: 12,
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  cursor: (loading || inlineEditingId !== null) ? 'not-allowed' : 'pointer',
                                  opacity: (loading || inlineEditingId !== null) ? 0.5 : 1
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => {
                                  const id = selectedTable === 'devices' ? row.deviceID : row.userID
                                  const name = selectedTable === 'devices' ? row.deviceName : row.userName
                                  deleteRecord(id, name, selectedTable)
                                }}
                                disabled={loading || inlineEditingId !== null}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: 12,
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 4,
                                  cursor: (loading || inlineEditingId !== null) ? 'not-allowed' : 'pointer',
                                  opacity: (loading || inlineEditingId !== null) ? 0.5 : 1
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
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
