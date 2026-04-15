"use client"
import React, { useState, useEffect } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'

type Line = { acc_code: string; description: string; debit: number; credit: number }
type Entry = { id?: number; doc_no?: string; doc_date: string; description: string; status: string; lines: Line[] }
type CoaItem = { code: string; name_th: string }

const emptyLine = (): Line => ({ acc_code: '', description: '', debit: 0, credit: 0 })
const emptyEntry = (): Entry => ({ doc_date: new Date().toISOString().slice(0, 10), description: '', status: 'draft', lines: [emptyLine(), emptyLine()] })

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 12,
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  overflow: 'hidden',
}
const thStyle: React.CSSProperties = { padding: '8px 14px', background: '#4b5563', color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }
const tdStyle: React.CSSProperties = { padding: '7px 14px', borderBottom: '1px solid #e5e7eb', fontSize: 13.5 }
const inputStyle: React.CSSProperties = { padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13.5, width: '100%', boxSizing: 'border-box' as const, fontFamily: '"Sarabun","Tahoma",sans-serif', outline: 'none' }
const btnStyle = (accent = false): React.CSSProperties => ({
  padding: '7px 18px',
  background: accent ? '#4b5563' : '#f3f4f6',
  color: accent ? '#fff' : '#1f2937',
  border: `1px solid ${accent ? '#4b5563' : '#d1d5db'}`,
  borderRadius: 8,
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: '"Sarabun","Tahoma",sans-serif',
  transition: 'all 0.2s',
})

export default function JournalPage() {
  const { L, lang } = useLang()
  const [list, setList] = useState<Entry[]>([])
  const [coa, setCoa] = useState<CoaItem[]>([])
  const [form, setForm] = useState<Entry>(emptyEntry())
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    const r = await fetch('/api/accounting/journal-entries')
    const d = await r.json(); if (d.ok) setList(d.data as Entry[])
  }
  useEffect(() => {
    load()
    fetch('/api/accounting/chart-of-accounts').then(r => r.json()).then(d => { if (d.ok) setCoa(d.data as CoaItem[]) })
  }, [])

  const setLine = (idx: number, field: keyof Line, val: string | number) => {
    setForm(f => {
      const lines = [...f.lines]
      lines[idx] = { ...lines[idx], [field]: val }
      return { ...f, lines }
    })
  }

  const totalDebit = form.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
  const totalCredit = form.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
  const balanced = Math.abs(totalDebit - totalCredit) < 0.005

  const save = async () => {
    if (!balanced) { setMsg(L('Debit/Credit not balanced', 'ยอดเดบิต/เครดิตไม่สมดุล')); return }
    setLoading(true); setMsg('')
    const method = form.id ? 'PUT' : 'POST'
    const res = await fetch('/api/accounting/journal-entries', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await res.json()
    if (d.ok) { setShowForm(false); load(); setMsg(L('Saved', 'บันทึกสำเร็จ')) } else setMsg('Error: ' + d.error)
    setLoading(false)
  }

  const statusColor: Record<string, string> = { draft: '#6b7280', posted: '#16a34a', reversed: '#dc2626' }
  const statusLabel: Record<string, string> = { draft: L('Draft', 'ร่าง'), posted: L('Posted', 'ผ่านบัญชีแล้ว'), reversed: L('Reversed', 'กลับรายการ') }
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const printJournalEntry = async (entryId: number) => {
    const r = await fetch('/api/accounting/journal-entries?id=' + entryId)
    const d = await r.json()
    if (!d.ok || !d.data) return

    const entry = d.data as Entry
    const lines = entry.lines || []
    const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
    const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)

    // Get current user info
    let currentUser = 'Unknown User'
    try {
      const userInfo = localStorage.getItem('k_system_accountant_user')
      if (userInfo) {
        const parsed = JSON.parse(userInfo)
        currentUser = parsed.name || parsed.username || parsed.email || 'Unknown User'
      }
    } catch {
      // If can't get user, use default
    }

    // Capture current language for print
    const currentLang = lang
    const printL = (en: string, th: string) => currentLang === 'th' ? th : en

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Journal Entry - ${entry.doc_no}</title>
        <style>
          @media print { @page { margin: 1cm; } }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Sarabun', 'Tahoma', sans-serif; padding: 20px; font-size: 14px; }
          .company-header { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 3px solid #333; }
          .company-logo { width: 80px; height: 80px; object-fit: contain; }
          .company-info { text-align: left; }
          .company-name { font-size: 22px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
          .company-address { font-size: 13px; color: #666; line-height: 1.5; }
          .header { text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #d1d5db; }
          .header h1 { font-size: 24px; margin-bottom: 8px; font-weight: 700; }
          .header .subtitle { font-size: 16px; color: #666; }
          .info-section { margin-bottom: 25px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
          .info-item { display: flex; }
          .info-label { font-weight: 600; min-width: 120px; color: #444; }
          .info-value { color: #000; }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .status-draft { background: #f3f4f6; color: #6b7280; }
          .status-posted { background: #dcfce7; color: #16a34a; }
          .status-reversed { background: #fee2e2; color: #dc2626; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #374151; color: #fff; padding: 10px; text-align: left; font-weight: 600; border: 1px solid #1f2937; }
          td { padding: 8px 10px; border: 1px solid #d1d5db; }
          tbody tr:nth-child(even) { background: #f9fafb; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-mono { font-family: 'Courier New', monospace; }
          .total-row { font-weight: 700; background: #e5e7eb !important; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #d1d5db; }
          .signature-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 40px; text-align: center; }
          .signature-box { padding-top: 60px; border-top: 1px solid #000; }
          .print-time { text-align: right; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="company-header">
          <img src="/k-energy-save-logo.png" alt="Company Logo" class="company-logo" />
          <div class="company-info">
            <div class="company-name">Zera co.,ltd</div>
            <div class="company-address">
              K Energy Save System<br>
              ${printL('Thailand Office', 'สำนักงานประเทศไทย')}
            </div>
          </div>
        </div>

        <div class="header">
          <h1>${printL('Journal Entry', 'รายการบันทึกบัญชี')}</h1>
          <div class="subtitle">${printL('General Ledger', 'สมุดรายวันทั่วไป')}</div>
        </div>

        <div class="info-section">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">${printL('Document No:', 'เลขที่เอกสาร:')}</span>
              <span class="info-value font-mono">${entry.doc_no || '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">${printL('Date:', 'วันที่:')}</span>
              <span class="info-value">${entry.doc_date ? new Date(entry.doc_date).toLocaleDateString(currentLang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">${printL('Status:', 'สถานะ:')}</span>
              <span class="status-badge status-${entry.status}">${currentLang === 'th' ? (statusLabel[entry.status] || entry.status) : (entry.status === 'draft' ? 'Draft' : entry.status === 'posted' ? 'Posted' : entry.status === 'reversed' ? 'Reversed' : entry.status)}</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-label">${printL('Description:', 'คำอธิบาย:')}</span>
            <span class="info-value">${entry.description || '-'}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 15%">${printL('Account Code', 'รหัสบัญชี')}</th>
              <th style="width: 40%">${printL('Description', 'คำอธิบาย')}</th>
              <th style="width: 20%" class="text-right">${printL('Debit', 'เดบิต')}</th>
              <th style="width: 20%" class="text-right">${printL('Credit', 'เครดิต')}</th>
            </tr>
          </thead>
          <tbody>
            ${lines.map((line) => `
              <tr>
                <td class="font-mono">${line.acc_code || ''}</td>
                <td>${line.description || ''}</td>
                <td class="text-right">${line.debit ? fmt(Number(line.debit)) : '-'}</td>
                <td class="text-right">${line.credit ? fmt(Number(line.credit)) : '-'}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2" class="text-right">${printL('Total:', 'รวม:')}</td>
              <td class="text-right">${fmt(totalDebit)}</td>
              <td class="text-right">${fmt(totalCredit)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div class="signature-section">
            <div class="signature-box">
              <div>${printL('Prepared By', 'ผู้จัดทำ')}</div>
              <div style="margin-top: 8px; color: #666;">_____________________</div>
            </div>
            <div class="signature-box">
              <div>${printL('Reviewed By', 'ผู้ตรวจสอบ')}</div>
              <div style="margin-top: 8px; color: #666;">_____________________</div>
            </div>
            <div class="signature-box">
              <div>${printL('Approved By', 'ผู้อนุมัติ')}</div>
              <div style="margin-top: 8px; color: #666;">_____________________</div>
            </div>
          </div>
          <div class="print-time">
            ${printL('Printed on:', 'พิมพ์เมื่อ:')} ${new Date().toLocaleString(currentLang === 'th' ? 'th-TH' : 'en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })}<br>
            ${printL('Printed by:', 'พิมพ์โดย:')} ${currentUser}
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 250);
          };
          window.onafterprint = function() {
            window.close();
          };
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <AccWindow title={L('Journal Entry', 'บันทึกบัญชี')}>
      <div style={{ padding: 20 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
          <button style={btnStyle(true)} onClick={() => { setForm(emptyEntry()); setShowForm(true) }}>
            + {L('New Journal Entry', 'สร้างรายการบัญชี')}
          </button>
          {msg && <span style={{ fontSize: 13.5, fontWeight: 500, color: msg.startsWith('Error') || msg.includes('สมดุล') || msg.includes('balanced') ? '#dc2626' : '#16a34a' }}>{msg}</span>}
        </div>

        {/* Main List */}
        <div style={cardStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>{L('Doc No', 'เลขที่')}</th>
                <th style={thStyle}>{L('Date', 'วันที่')}</th>
                <th style={thStyle}>{L('Description', 'คำอธิบาย')}</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>{L('Status', 'สถานะ')}</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', padding: 24 }}>{L('No data', 'ไม่มีข้อมูล')}</td></tr>}
              {list.map((row, i) => (
                <tr key={row.id} style={{ background: i % 2 ? '#f9fafb' : '#fff' }}>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12.5, color: '#4b5563' }}>{row.doc_no}</td>
                  <td style={{ ...tdStyle, color: '#374151' }}>{row.doc_date ? new Date(row.doc_date).toLocaleDateString('th-TH') : ''}</td>
                  <td style={{ ...tdStyle, fontWeight: 500, color: '#1f2937' }}>{row.description}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: row.status === 'posted' ? '#dcfce7' : row.status === 'reversed' ? '#fee2e2' : '#f3f4f6',
                      color: statusColor[row.status] || '#6b7280',
                    }}>{statusLabel[row.status] || row.status}</span>
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={btnStyle()} onClick={async () => {
                        if (typeof row.id !== 'number') return
                        const r = await fetch('/api/accounting/journal-entries?id=' + row.id)
                        const d = await r.json(); if (d.ok) { const loaded = d.data as Entry; setForm({ ...loaded, lines: loaded.lines || [] }); setShowForm(true) }
                      }}>{L('View/Edit', 'ดู/แก้ไข')}</button>
                      <button
                        style={{ ...btnStyle(), background: '#1e40af', color: '#fff', border: '1px solid #1e40af', display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => { if (typeof row.id === 'number') void printJournalEntry(row.id) }}
                        title={L('Print Report', 'พิมพ์รายงาน')}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 6 2 18 2 18 9"></polyline>
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                          <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        {L('Print', 'พิมพ์')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40, overflowY: 'auto' }}>
            <div style={{ background: '#fff', borderRadius: 12, width: '95%', maxWidth: 860, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', marginBottom: 40, overflow: 'hidden' }}>
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
                padding: '14px 20px',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span>{form.id ? `${L('Edit Journal Entry', 'แก้ไขรายการบัญชี')} ${form.doc_no}` : L('New Journal Entry', 'บันทึกรายการบัญชีใหม่')}</span>
                <span style={{ cursor: 'pointer', fontSize: 18, fontWeight: 400, opacity: 0.8 }} onClick={() => setShowForm(false)}>✕</span>
              </div>

              {/* Form Fields */}
              <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '10px 14px', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 12.5, marginBottom: 4, fontWeight: 600, color: '#4b5563' }}>{L('Date', 'วันที่')}</div>
                    <input style={inputStyle} type="date" value={form.doc_date} onChange={e => setForm(f => ({ ...f, doc_date: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, marginBottom: 4, fontWeight: 600, color: '#4b5563' }}>{L('Description', 'คำอธิบาย')}</div>
                    <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, marginBottom: 4, fontWeight: 600, color: '#4b5563' }}>{L('Status', 'สถานะ')}</div>
                    <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>

                {/* Lines Table */}
                <div style={{ ...cardStyle, marginBottom: 12 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ ...thStyle, fontSize: 12 }}>{L('Account Code', 'รหัสบัญชี')}</th>
                        <th style={{ ...thStyle, fontSize: 12 }}>{L('Account / Description', 'ชื่อบัญชี / คำอธิบาย')}</th>
                        <th style={{ ...thStyle, fontSize: 12, textAlign: 'right' }}>{L('Debit', 'เดบิต')}</th>
                        <th style={{ ...thStyle, fontSize: 12, textAlign: 'right' }}>{L('Credit', 'เครดิต')}</th>
                        <th style={{ ...thStyle, width: 36 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.lines.map((line, idx) => {
                        const acct = coa.find(c => c.code === line.acc_code)
                        return (
                          <tr key={idx}>
                            <td style={{ ...tdStyle, width: 140 }}>
                              <select style={{ ...inputStyle, fontSize: 12.5 }} value={line.acc_code} onChange={e => setLine(idx, 'acc_code', e.target.value)}>
                                <option value="">-- {L('Select', 'เลือก')} --</option>
                                {coa.map((c) => <option key={c.code} value={c.code}>{c.code} {c.name_th}</option>)}
                              </select>
                            </td>
                            <td style={tdStyle}>
                              <input style={inputStyle} placeholder={acct ? acct.name_th : ''} value={line.description} onChange={e => setLine(idx, 'description', e.target.value)} />
                            </td>
                            <td style={{ ...tdStyle, width: 130 }}>
                              <input style={{ ...inputStyle, textAlign: 'right' }} type="number" value={line.debit || ''} onChange={e => setLine(idx, 'debit', parseFloat(e.target.value) || 0)} />
                            </td>
                            <td style={{ ...tdStyle, width: 130 }}>
                              <input style={{ ...inputStyle, textAlign: 'right' }} type="number" value={line.credit || ''} onChange={e => setLine(idx, 'credit', parseFloat(e.target.value) || 0)} />
                            </td>
                            <td style={{ ...tdStyle, width: 36, textAlign: 'center' }}>
                              <button style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}
                                onClick={() => setForm(f => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }))}>✕</button>
                            </td>
                          </tr>
                        )
                      })}
                      {/* Total Row */}
                      <tr style={{ background: '#f0f1f3' }}>
                        <td colSpan={2} style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#1f2937', borderBottom: 'none' }}>{L('Total', 'รวม')}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: balanced ? '#16a34a' : '#dc2626', borderBottom: 'none' }}>{fmt(totalDebit)}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: balanced ? '#16a34a' : '#dc2626', borderBottom: 'none' }}>{fmt(totalCredit)}</td>
                        <td style={{ ...tdStyle, borderBottom: 'none' }}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Add Line + Balance Check */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button style={{ ...btnStyle(), fontSize: 12.5 }} onClick={() => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }))}>
                    + {L('Add Line', 'เพิ่มบรรทัด')}
                  </button>
                  {!balanced && <span style={{ color: '#dc2626', fontSize: 12.5, fontWeight: 600 }}>
                    ⚠ {L('Not balanced', 'ยอดไม่สมดุล')} ({Math.abs(totalDebit - totalCredit).toFixed(2)})
                  </span>}
                  {balanced && <span style={{ color: '#16a34a', fontSize: 12.5, fontWeight: 600 }}>
                    ✓ {L('Balanced', 'ยอดสมดุล')}
                  </span>}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '12px 20px 16px', display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb' }}>
                <button style={btnStyle()} onClick={() => setShowForm(false)}>{L('Cancel', 'ยกเลิก')}</button>
                <button style={btnStyle(true)} disabled={loading || !balanced} onClick={save}>
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
