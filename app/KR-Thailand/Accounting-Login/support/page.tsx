"use client"

import React from 'react'
import AccWindow, { useLang } from '../components/AccWindow'

export default function SupportPage() {
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
            💬 {L('Contact Support', 'ติดต่อสนับสนุน')}
          </div>
          <div style={{ fontSize: 13, marginTop: 8, opacity: 0.9 }}>
            {L('Get help and support', 'รับความช่วยเหลือและการสนับสนุน')}
          </div>
        </div>

        {/* Content */}
        <div style={{
          background: '#f9fafb',
          borderRadius: 12,
          padding: 24,
          border: '2px solid #d1d5db'
        }}>

          {/* Office Locations */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 32 }}>

            {/* Thailand Office */}
            <div style={{
              background: '#fff',
              padding: 28,
              borderRadius: 12,
              border: '2px solid #10b981',
              boxShadow: '0 4px 12px rgba(16,185,129,0.15)'
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🇹🇭</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#10b981' }}>
                {L('Thailand Office', 'สำนักงานประเทศไทย')}
              </h3>
              <div style={{ lineHeight: 1.8 }}>
                <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>
                  K Energy Save Co., Ltd.
                </p>
                <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 4 }}>
                  84 Chaloem Phrakiat Rama 9 Soi 34
                </p>
                <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 4 }}>
                  Nong Bon, Prawet
                </p>
                <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 12 }}>
                  Bangkok 10250, Thailand
                </p>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 12 }}>
                  <p style={{ fontSize: 14, marginBottom: 6 }}>
                    <strong>📞 {L('Phone', 'โทร')}:</strong> <a href="tel:+6620808916" style={{ color: '#10b981', textDecoration: 'none' }}>+66 2 080 8916</a>
                  </p>
                  <p style={{ fontSize: 14 }}>
                    <strong>📧 Email:</strong> <a href="mailto:info@kenergy-save.com" style={{ color: '#10b981', textDecoration: 'none' }}>info@kenergy-save.com</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Korea Office */}
            <div style={{
              background: '#fff',
              padding: 28,
              borderRadius: 12,
              border: '2px solid #3b82f6',
              boxShadow: '0 4px 12px rgba(59,130,246,0.15)'
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🇰🇷</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#3b82f6' }}>
                {L('Korea Office', 'สำนักงานประเทศเกาหลี')}
              </h3>
              <div style={{ lineHeight: 1.8 }}>
                <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>
                  Zera-Energy
                </p>
                <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 4 }}>
                  2F, 16-10, 166beon-gil
                </p>
                <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 4 }}>
                  Elseso-ro, Gunpo-si
                </p>
                <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 12 }}>
                  Gyeonggi-do, Korea
                </p>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 12 }}>
                  <p style={{ fontSize: 14, marginBottom: 6 }}>
                    <strong>📞 {L('Phone', 'โทร')}:</strong> <a href="tel:+82314271380" style={{ color: '#3b82f6', textDecoration: 'none' }}>+82 31-427-1380</a>
                  </p>
                  <p style={{ fontSize: 14 }}>
                    <strong>📧 Email:</strong> <a href="mailto:info@zera-energy.com" style={{ color: '#3b82f6', textDecoration: 'none' }}>info@zera-energy.com</a>
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Business Hours */}
          <div style={{
            background: '#fffbeb',
            border: '2px solid #f59e0b',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32 }}>🕐</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: '#92400e' }}>
                  {L('Business Hours', 'เวลาทำการ')}
                </div>
                <div style={{ fontSize: 14, color: '#78350f' }}>
                  {L('Monday - Friday: 9:00 AM - 6:00 PM', 'จันทร์ - ศุกร์: 9:00 - 18:00 น.')}
                </div>
                <div style={{ fontSize: 13, color: '#78350f', marginTop: 4 }}>
                  {L('Response within 24 hours', 'ตอบกลับภายใน 24 ชั่วโมง')}
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              {L('Frequently Asked Questions', 'คำถามที่พบบ่อย')}
            </h3>
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: 16 }}>
              <details style={{ marginBottom: 12 }}>
                <summary style={{ fontWeight: 600, cursor: 'pointer', padding: 8 }}>
                  {L('How to reset password?', 'วิธีรีเซ็ตรหัสผ่าน?')}
                </summary>
                <p style={{ padding: 8, color: '#6b7280' }}>
                  {L('Contact your system administrator or IT support.', 'ติดต่อผู้ดูแลระบบหรือฝ่าย IT')}
                </p>
              </details>
              <details style={{ marginBottom: 12 }}>
                <summary style={{ fontWeight: 600, cursor: 'pointer', padding: 8 }}>
                  {L('How to generate reports?', 'วิธีออกรายงาน?')}
                </summary>
                <p style={{ padding: 8, color: '#6b7280' }}>
                  {L('Go to Reports menu and select the desired report type.', 'ไปที่เมนูรายงานและเลือกประเภทรายงานที่ต้องการ')}
                </p>
              </details>
              <details>
                <summary style={{ fontWeight: 600, cursor: 'pointer', padding: 8 }}>
                  {L('System requirements?', 'ความต้องการของระบบ?')}
                </summary>
                <p style={{ padding: 8, color: '#6b7280' }}>
                  {L('Modern web browser (Chrome, Firefox, Edge) with stable internet connection.', 'เว็บเบราว์เซอร์ที่ทันสมัย (Chrome, Firefox, Edge) พร้อมการเชื่อมต่ออินเทอร์เน็ตที่เสถียร')}
                </p>
              </details>
            </div>
          </div>

        </div>

      </div>
    </AccWindow>
  )
}
