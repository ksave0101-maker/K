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

export default function IncomeStatementPage() {
  const { L } = useLang()
  const [data, setData] = useState<any[]>([])
  useEffect(() => { fetch('/api/accounting/reports?type=income-statement').then(r => r.json()).then(d => { if (d.ok) setData(d.data || []) }) }, [])

  const income = data.filter((r: any) => r.account_type === 'income')
  const expense = data.filter((r: any) => r.account_type === 'expense')
  const totalInc = income.reduce((s: number, r: any) => s + (r.total_credit || 0) - (r.total_debit || 0), 0)
  const totalExp = expense.reduce((s: number, r: any) => s + (r.total_debit || 0) - (r.total_credit || 0), 0)
  const net = totalInc - totalExp

  const Section = ({ title, titleTh, rows, isIncome }: { title: string; titleTh: string; rows: any[]; isIncome: boolean }) => (
    <div style={cardStyle}>
      <div style={{
        background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
        padding: '12px 18px',
        color: '#fff',
        fontWeight: 800,
        fontSize: 15,
        letterSpacing: '0.01em',
      }}>{L(title, titleTh)}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>{L('Code', 'รหัส')}</th>
            <th style={thStyle}>{L('Account', 'บัญชี')}</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>{L('Amount', 'จำนวนเงิน')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af', padding: 20 }}>{L('No data', 'ไม่มีข้อมูล')}</td></tr>
          )}
          {rows.map((r: any, i: number) => (
            <tr key={i} style={{ background: i % 2 ? '#f9fafb' : '#fff' }}>
              <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#6b7280', fontSize: 12.5 }}>{r.code}</td>
              <td style={{ ...tdStyle, fontWeight: 500, color: '#1f2937' }}>{L(r.name_en || '', r.name_th || '')}</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500, color: '#374151' }}>
                {fmt(isIncome ? (r.total_credit || 0) - (r.total_debit || 0) : (r.total_debit || 0) - (r.total_credit || 0))}
              </td>
            </tr>
          ))}
          <tr style={{ background: '#f0f1f3' }}>
            <td colSpan={2} style={{ ...tdStyle, fontWeight: 700, color: '#1f2937', borderBottom: 'none' }}>{L('Total', 'รวม')}</td>
            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#1f2937', borderBottom: 'none' }}>{fmt(isIncome ? totalInc : totalExp)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  return (
    <AccWindow title={L('Income Statement', 'งบกำไรขาดทุน')}>
      <div style={{ padding: 20 }}>
        {/* Title */}
        <div style={{ ...cardStyle, padding: '18px 22px' }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#1f2937', letterSpacing: '0.01em' }}>
            {L('Income Statement', 'งบกำไรขาดทุน')}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด</div>
        </div>

        <Section title="Revenue" titleTh="รายได้" rows={income} isIncome={true} />
        <Section title="Expenses" titleTh="ค่าใช้จ่าย" rows={expense} isIncome={false} />

        {/* Net Profit/Loss */}
        <div style={{
          ...cardStyle,
          padding: '16px 22px',
          border: `1px solid ${net >= 0 ? '#86efac' : '#fca5a5'}`,
          background: net >= 0 ? '#f0fdf4' : '#fef2f2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: net >= 0 ? '#166534' : '#991b1b' }}>
            {L('Net Profit/Loss', 'กำไร/ขาดทุนสุทธิ')}
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: net >= 0 ? '#166534' : '#991b1b' }}>
            {fmt(net)}
          </span>
        </div>
      </div>
    </AccWindow>
  )
}
