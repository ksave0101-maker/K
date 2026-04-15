"use client"

import React, { useCallback, useEffect, useState } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'

type SalesDepositRow = {
  id?: number
  doc_no?: string
  doc_date?: string
  customer_name?: string
  total?: number
  status?: string
  doc_type?: string
}

const createEmptyForm = (): SalesDepositRow => ({
  doc_no: '',
  doc_date: new Date().toISOString().slice(0, 10),
  customer_name: '',
  total: 0,
  status: '',
  doc_type: 'deposit'
})

// Styles
const styles = {
  th: {
    padding: '8px 14px',
    background: '#4b5563',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'left' as const,
    whiteSpace: 'nowrap' as const,
    borderBottom: '1px solid #d1d5db'
  },
  td: {
    padding: '7px 14px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: 13.5
  },
  input: {
    width: '100%',
    padding: '7px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    background: '#fff',
    fontSize: 13.5,
    boxSizing: 'border-box' as const,
    fontFamily: '"Sarabun","Tahoma",sans-serif',
    outline: 'none'
  }
}

const buttonStyle = (bg: string, color = '#1f2937') => ({
  padding: '7px 18px',
  background: bg,
  color: color,
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: '"Sarabun","Tahoma",sans-serif',
  transition: 'all 0.2s'
})

const formatNumber = (n: number) => {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export default function SalesDepositPage() {
  const { L } = useLang()

  // State
  const [data, setData] = useState<SalesDepositRow[]>([])
  const [form, setForm] = useState<SalesDepositRow>(createEmptyForm)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')

  // Load data
  const loadData = useCallback(async (q = '') => {
    try {
      const url = '/api/accounting/sales-invoices?doc_type=deposit' +
                  (q ? '&q=' + encodeURIComponent(q) : '')
      const response = await fetch(url)
      const result = await response.json()

      if (result.ok) {
        setData((result.data || []) as SalesDepositRow[])
      } else {
        setMsg('Error: ' + result.error)
      }
    } catch (error: unknown) {
      setMsg('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }, [])

  useEffect(() => {
    void loadData('')
  }, [loadData])

  // Save data
  const saveData = async () => {
    try {
      setLoading(true)
      setMsg('')

      const method = form.id ? 'PUT' : 'POST'
      const response = await fetch('/api/accounting/sales-invoices', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          doc_type: 'deposit'
        })
      })

      const result = await response.json()

      if (result.ok) {
        setShowForm(false)
        setForm(createEmptyForm())
        void loadData(search)
        setMsg(L('Saved successfully', 'บันทึกสำเร็จ'))
      } else {
        setMsg('Error: ' + result.error)
      }
    } catch (error: unknown) {
      setMsg('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  // Delete data
  const deleteData = async (id: number) => {
    if (!confirm(L('Delete this record?', 'ลบรายการนี้?'))) return

    try {
      await fetch('/api/accounting/sales-invoices?id=' + id, {
        method: 'DELETE'
      })
      void loadData(search)
    } catch (error: unknown) {
      setMsg('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }
  const handleDelete = (id?: number) => { if (typeof id === 'number') void deleteData(id) }

  // Handle new form
  const handleNew = () => {
    setForm(createEmptyForm())
    setShowForm(true)
  }

  // Handle edit
  const handleEdit = (record: SalesDepositRow) => {
    setForm({ ...record, doc_type: 'deposit' })
    setShowForm(true)
  }

  return (
    <AccWindow title={L('Receive Deposit', 'รับเงินมัดจำ')}>
      <div style={{ padding: 12 }}>

        {/* Toolbar */}
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 8,
          alignItems: 'center',
          flexWrap: 'wrap' as const
        }}>
          <button style={buttonStyle('#f3f4f6')} onClick={handleNew}>
            + {L('New', 'เพิ่มใหม่')}
          </button>

          <input
            style={{ ...styles.input, width: 200 }}
            placeholder={L('Search...', 'ค้นหา...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && void loadData(search)}
          />

          <button style={buttonStyle('#f3f4f6')} onClick={() => void loadData(search)}>
            {L('Search', 'ค้นหา')}
          </button>

          {msg && (
            <span style={{
              color: msg.startsWith('E') ? 'red' : 'green',
              fontSize: 13
            }}>
              {msg}
            </span>
          )}
        </div>

        {/* Table */}
        <div style={{
          overflowX: 'auto',
          border: '1px solid #d1d5db',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  L('Doc No', 'เลขที่'),
                  L('Date', 'วันที่'),
                  L('Customer', 'ลูกค้า'),
                  L('Amount', 'จำนวนเงิน'),
                  L('Status', 'สถานะ'),
                  ''
                ].map((header, i) => (
                  <th key={i} style={styles.th}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      ...styles.td,
                      textAlign: 'center',
                      color: '#888',
                      padding: 20
                    }}
                  >
                    {L('No data', 'ไม่มีข้อมูล')}
                  </td>
                </tr>
              )}

              {data.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    background: i % 2 ? '#f5f5f5' : '#fff'
                  }}
                >
                  <td style={styles.td}>{row.doc_no}</td>
                  <td style={styles.td}>
                    {row.doc_date?.slice(0, 10)}
                  </td>
                  <td style={styles.td}>{row.customer_name}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    {formatNumber(row.total || 0)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    {row.status}
                  </td>
                  <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>
                    <button
                      style={{
                        ...buttonStyle('#f3f4f6'),
                        marginRight: 3
                      }}
                      onClick={() => handleEdit(row)}
                    >
                      {L('Edit', 'แก้ไข')}
                    </button>
                    <button
                      style={buttonStyle('#f3f4f6', '#dc2626')}
                      onClick={() => handleDelete(row.id)}
                    >
                      {L('Del', 'ลบ')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              minWidth: 420,
              maxWidth: 520,
              width: '95%'
            }}>

              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg,#374151 0%,#4b5563 100%)',
                padding: '3px 8px',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>
                  {form.id ? L('Edit', 'แก้ไข') : L('New', 'เพิ่มใหม่')}
                </span>
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </span>
              </div>

              {/* Modal Body */}
              <div style={{
                padding: 16,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px 12px'
              }}>

                {/* Doc No */}
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>
                    {L('Doc No', 'เลขที่')}
                  </div>
                  <input
                    style={styles.input}
                    value={form.doc_no || ''}
                    onChange={e => setForm({...form, doc_no: e.target.value})}
                  />
                </div>

                {/* Date */}
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>
                    {L('Date', 'วันที่')}
                  </div>
                  <input
                    style={styles.input}
                    type="date"
                    value={form.doc_date || ''}
                    onChange={e => setForm({...form, doc_date: e.target.value})}
                  />
                </div>

                {/* Customer */}
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>
                    {L('Customer', 'ลูกค้า')}
                  </div>
                  <input
                    style={styles.input}
                    value={form.customer_name || ''}
                    onChange={e => setForm({...form, customer_name: e.target.value})}
                  />
                </div>

                {/* Amount */}
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>
                    {L('Amount', 'จำนวนเงิน')}
                  </div>
                  <input
                    style={styles.input}
                    type="number"
                    value={form.total || ''}
                    onChange={e => setForm({...form, total: +e.target.value || 0})}
                  />
                </div>

                {/* Status */}
                <div>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>
                    {L('Status', 'สถานะ')}
                  </div>
                  <input
                    style={styles.input}
                    value={form.status || ''}
                    onChange={e => setForm({...form, status: e.target.value})}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '8px 16px 12px',
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
                borderTop: '1px solid #999'
              }}>
                <button
                  style={buttonStyle('#f3f4f6')}
                  onClick={() => setShowForm(false)}
                >
                  {L('Cancel', 'ยกเลิก')}
                </button>
                <button
                  style={buttonStyle('#f3f4f6', '#4b5563')}
                  disabled={loading}
                  onClick={saveData}
                >
                  {loading ? '...' : L('Save', 'บันทึก')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AccWindow>
  )
}
