"use client"

import React from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'

export default function CodeDefinitionPage() {
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
            🔢 {L('Code Definition Display', 'ข้อมูลแสดงการกำหนดรหัส')}
          </div>
          <div style={{ fontSize: 13, marginTop: 8, opacity: 0.9 }}>
            {L('System code definition display', 'ระบบข้อมูลแสดงการกำหนดรหัส')}
          </div>
        </div>

        {/* Content */}
        <div style={{
          background: '#f9fafb',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #d1d5db',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {L('Under Development', 'กำลังพัฒนา')}
            </div>
            <div style={{ fontSize: 14, marginTop: 8 }}>
              {L('This feature is coming soon', 'ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้')}
            </div>
          </div>
        </div>

      </div>
    </AccWindow>
  )
}
