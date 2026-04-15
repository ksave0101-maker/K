"use client"
import AccWindow from '../components/AccWindow'
export default function Page() {
  return (
    <AccWindow title="เกี่ยวกับระบบ">
      <div style={{ padding: 32, fontFamily: '"Sarabun","Tahoma",sans-serif' }}>
        <div style={{
          background: '#fff',
          border: '1px solid #d1d5db', borderRadius: 8,
          padding: '28px 40px', display: 'inline-block', minWidth: 380, textAlign: 'center'
        }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#4b5563', marginBottom: 4 }}>ระบบบัญชีสาขาประเทศไทย</div>
          <div style={{ fontSize: 14, color: '#444', marginBottom: 16 }}>บริษัท เค เอ็นเนอร์ยี่ เซฟ จำกัด</div>
          <div style={{ borderTop: '1px solid #9ca3af', borderBottom: '1px solid #fff', marginBottom: 16 }} />
          <div style={{ fontSize: 13, lineHeight: 2, color: '#333' }}>
            <div><b>บริษัท:</b> เค เอ็นเนอร์ยี่ เซฟ จำกัด</div>
            <div><b>เวอร์ชั่น:</b> 1.0.0 (Internal)</div>
            <div><b>Platform:</b> Next.js + MySQL</div>
            <div><b>ปีที่พัฒนา:</b> 2026</div>
          </div>
          <div style={{ borderTop: '1px solid #9ca3af', borderBottom: '1px solid #fff', margin: '16px 0 12px' }} />
          <div style={{ fontSize: 11, color: '#666' }}>© 2026 K Energy Save Co., Ltd. All rights reserved.</div>
        </div>
      </div>
    </AccWindow>
  )
}
