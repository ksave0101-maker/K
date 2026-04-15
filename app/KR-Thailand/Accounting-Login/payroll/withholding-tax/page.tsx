"use client"

import React from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'

export default function PayrollPage() {
  const { L } = useLang()

  return (
    <AccWindow title={L('บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด', 'K Energy Save Co., Ltd.')}>
      <div style={{ padding: 30 }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          color: '#fff'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            {L('Payroll System', 'ระบบเงินเดือน')}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '2px solid #e5e7eb' }}>
          <div style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', padding: 40 }}>
            {L('This feature is under development...', 'ระบบนี้กำลังพัฒนา...')}
          </div>
        </div>
      </div>
    </AccWindow>
  )
}
