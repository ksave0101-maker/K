"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Page(){
  const router = useRouter()
  const [notes, setNotes] = useState<{date:string,status:string,action:string,notes:string}[]>([])
  const [form, setForm] = useState({date:'',status:'Open',action:'',notes:''})

  function add(){ if(!form.date||!form.action){ return alert('กรุณากรอกวันที่และการกระทำ / Enter date and next action') } setNotes([form,...notes]); setForm({date:'',status:'Open',action:'',notes:''}) }

  const styles={container:{padding:24,fontFamily:'Inter,system-ui,Arial',maxWidth:880,margin:'auto'},card:{background:'#fff',padding:18,borderRadius:8,boxShadow:'0 6px 18px rgba(0,0,0,0.06)'},input:{padding:8,borderRadius:6,border:'1px solid #e2e8f0'}} as const

  return (
    <div style={styles.container}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>ติดตามผล / Follow-up</h2>
        <button onClick={()=>router.back()} style={{padding:8}}>ย้อนกลับ / Back</button>
      </div>
      <div style={styles.card}>
        <div style={{marginBottom:8}}>
          <label style={{fontWeight:700}}>วันที่ / Date</label>
          <input type='date' value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={styles.input} />
        </div>
        <div style={{display:'flex',gap:8,marginBottom:8}}>
          <div style={{flex:1}}>
            <label style={{fontWeight:700}}>สถานะ / Status</label>
            <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={styles.input}>
              <option>Open</option>
              <option>In Progress</option>
              <option>Closed</option>
            </select>
          </div>
          <div style={{flex:2}}>
            <label style={{fontWeight:700}}>การกระทำถัดไป / Next action</label>
            <input placeholder='Action' value={form.action} onChange={e=>setForm({...form,action:e.target.value})} style={styles.input} />
          </div>
        </div>
        <div style={{marginBottom:8}}>
          <label style={{fontWeight:700}}>บันทึก / Notes</label>
          <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{...styles.input,height:80}} />
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={add} style={{padding:8,background:'#065f46',color:'#fff'}}>บันทึก / Add note</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        {notes.map((n,idx)=> (
          <div key={idx} style={{background:'#fff',padding:12,borderRadius:8,marginBottom:8,boxShadow:'0 4px 10px rgba(0,0,0,0.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div><strong>{n.date}</strong> — {n.status}</div>
              <div style={{color:'#6b7280'}}>{n.action}</div>
            </div>
            <div style={{marginTop:8}}>{n.notes}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
