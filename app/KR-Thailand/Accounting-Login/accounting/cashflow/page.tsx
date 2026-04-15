"use client"
import React, { useState, useEffect } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 12,
  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  marginBottom: 14,
  overflow: 'hidden',
}
const thStyle: React.CSSProperties = { padding: '8px 14px', background: '#4b5563', color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }
const tdStyle: React.CSSProperties = { padding: '7px 14px', borderBottom: '1px solid #e5e7eb', fontSize: 13.5 }

export default function CashFlowStatementPage() {
  const { L } = useLang()
  const [data, setData] = useState<any[]>([])
  useEffect(() => { fetch('/api/accounting/reports?type=cashflow').then(r => r.json()).then(d => { if (d.ok) setData(d.data || []) }) }, [])

  const grandTotal = data.reduce((s: number, r: any) => s + (Number(r.total) || 0), 0)

  return (
    <AccWindow title={L('Cash Flow Statement', 'งบกระแสเงินสด')}>
      <div style={{ padding: 20 }}>
        {/* Title */}
        <div style={{ ...cardStyle, padding: '18px 22px' }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#1f2937', letterSpacing: '0.01em' }}>
            {L('Cash Flow Statement', 'งบกระแสเงินสด')}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด</div>
        </div>

        {/* Data Table */}
        <div style={cardStyle}>
          <div style={{
            background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
            padding: '12px 18px',
            color: '#fff',
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: '0.01em',
          }}>{L('Cash Flow Summary', 'สรุปกระแสเงินสด')}</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>{L('Method', 'วิธีชำระ')}</th>
                <th style={thStyle}>{L('Type', 'ประเภท')}</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>{L('Count', 'จำนวน')}</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>{L('Total', 'ยอดรวม')}</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', padding: 24 }}>{L('No data', 'ไม่มีข้อมูล')}</td></tr>
              )}
              {data.map((r: any, i: number) => (
                <tr key={r.id || i} style={{ background: i % 2 ? '#f9fafb' : '#fff' }}>
                  <td style={{ ...tdStyle, fontWeight: 500, color: '#1f2937' }}>{r.method}</td>
                  <td style={{ ...tdStyle, color: '#4b5563' }}>{r.voucher_type}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500 }}>{fmt(r.count || 0)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: '#1f2937' }}>{fmt(r.total || 0)}</td>
                </tr>
              ))}
              {data.length > 0 && (
                <tr style={{ background: '#374151' }}>
                  <td colSpan={3} style={{ padding: '8px 14px', fontWeight: 700, fontSize: 13.5, color: '#fff' }}>{L('Grand Total', 'รวมทั้งหมด')}</td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 700, fontSize: 13.5, color: '#fff' }}>{fmt(grandTotal)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AccWindow>
  )
}
