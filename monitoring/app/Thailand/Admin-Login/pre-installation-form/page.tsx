"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Page(){
  const router = useRouter()
  const checklistInit = [
    { key: 'site_ready', label: 'สถานที่พร้อม / Site ready', ok:false },
    { key: 'power_available', label: 'ไฟฟ้า / Power available', ok:false },
    { key: 'network', label: 'เครือข่าย / Network', ok:false },
    { key: 'safety', label: 'ความปลอดภัย / Safety', ok:false }
  ]
  const [items,setItems] = useState(checklistInit)
  const [notes,setNotes]=useState('')

  function toggle(i:number){ const c=[...items]; c[i].ok=!c[i].ok; setItems(c)}
  function save(){ console.log({items,notes}); alert('Pre-installation saved (demo)') }

  return (
    <div style={{padding:24,fontFamily:'Inter,system-ui,Arial',maxWidth:880,margin:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>แบบฟอร์มก่อนการติดตั้ง / Pre-installation checklist</h2>
        <button onClick={()=>router.back()} style={{padding:8}}>ย้อนกลับ / Back</button>
      </div>
      <div style={{background:'#fff',padding:18,borderRadius:8,boxShadow:'0 6px 18px rgba(0,0,0,0.06)'}}>
        {items.map((it,idx)=> (
          <label key={it.key} style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
            <input type='checkbox' checked={it.ok} onChange={()=>toggle(idx)} />
            <span style={{fontWeight:700}}>{it.label}</span>
          </label>
        ))}
        <div style={{marginTop:12}}>
          <div style={{fontWeight:700}}>บันทึกเพิ่มเติม / Notes</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #e2e8f0',height:100}} />
        </div>
        <div style={{marginTop:12}}>
          <button onClick={save} style={{padding:8,background:'#065f46',color:'#fff'}}>บันทึก / Save</button>
        </div>
      </div>
    </div>
  )
}

