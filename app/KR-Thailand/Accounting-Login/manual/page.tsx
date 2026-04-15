"use client"

import React from 'react'
import AccWindow, { useLang } from '../components/AccWindow'

export default function ManualPage() {
  const { L } = useLang()

  return (
    <AccWindow title={L('K Energy Save Co., Ltd.', 'บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด')}>
      <div style={{ padding: 30 }}>
        
        {/* Header */}
        <div style={{
          background: '#6b7280',
          borderRadius: 12,
          padding: '24px 32px',
          marginBottom: 24,
          color: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            📖 {L('User Manual', 'คู่มือการใช้งาน')}
          </div>
          <div style={{ fontSize: 13, marginTop: 8, opacity: 0.9 }}>
            {L('System user guide and documentation', 'คู่มือและเอกสารการใช้งานระบบ')}
          </div>
        </div>

        {/* Content */}
        <div style={{
          background: '#f9fafb',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #d1d5db'
        }}>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              {L('Quick Start Guide', 'คู่มือเริ่มต้นใช้งาน')}
            </h3>
            <ul style={{ paddingLeft: 24, lineHeight: 2 }}>
              <li>{L('Login to the system', 'เข้าสู่ระบบ')}</li>
              <li>{L('Navigate through menus', 'การเลือกเมนู')}</li>
              <li>{L('Record daily transactions', 'บันทึกรายการประจำวัน')}</li>
              <li>{L('Generate reports', 'ออกรายงาน')}</li>
            </ul>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              {L('Module Guides', 'คู่มือแต่ละโมดูล')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              {[
                { icon: '🛒', title_en: 'Purchase', title_th: 'การซื้อ' },
                { icon: '💰', title_en: 'Sales', title_th: 'การขาย' },
                { icon: '💵', title_en: 'Finance', title_th: 'การเงิน' },
                { icon: '📦', title_en: 'Inventory', title_th: 'สินค้า' },
                { icon: '📊', title_en: 'Accounting', title_th: 'บัญชี' },
                { icon: '👥', title_en: 'Payroll', title_th: 'เงินเดือน' },
              ].map((module, i) => (
                <div key={i} style={{
                  background: '#fff',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{module.icon}</div>
                  <div style={{ fontWeight: 600 }}>
                    {L(module.title_en, module.title_th)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AccWindow>
  )
}
