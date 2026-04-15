"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Page(){
  const router = useRouter()
  const [records, setRecords] = useState([{ date:'', method:'Cash', amount:0, reference:'' }])

  function addRow(){ setRecords([...records, { date:'', method:'Cash', amount:0, reference:'' }]) }
  function update(i:number,key:string,value:any){ const c=[...records]; // @ts-ignore
    c[i][key]= key==='amount'?Number(value):value; setRecords(c)}

  function handleSave(e:React.FormEvent){ e.preventDefault(); console.log(records); alert('Receipts saved (demo)') }

  const styles={container:{padding:24,fontFamily:'Inter, system-ui, Arial',maxWidth:880,margin:'auto'},card:{background:'#fff',padding:18,borderRadius:8,boxShadow:'0 6px 18px rgba(0,0,0,0.06)'},input:{padding:8,borderRadius:6,border:'1px solid #e2e8f0'}} as const

  return (
    <div style={styles.container}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>ใบรับเงิน / Receipt</h2>
        <button onClick={()=>router.back()} style={{padding:8}}>ย้อนกลับ / Back</button>
      </div>
      <form onSubmit={handleSave} style={styles.card}>
        {records.map((r,i)=> (
          <div key={i} style={{display:'flex',gap:8,marginBottom:8}}>
            <input type='date' value={r.date} onChange={e=>update(i,'date',e.target.value)} style={{...styles.input,width:160}} />
            <select value={r.method} onChange={e=>update(i,'method',e.target.value)} style={{...styles.input,width:140}}>
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Credit Card</option>
            </select>
            <input type='number' min={0} value={r.amount} onChange={e=>update(i,'amount',e.target.value)} style={{...styles.input,width:160}} />
            <input placeholder='Ref / หมายเหตุ' value={r.reference} onChange={e=>update(i,'reference',e.target.value)} style={{...styles.input,flex:1}} />
          </div>
        ))}
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button type='button' onClick={addRow} style={{padding:8}}>เพิ่มบันทึก / Add record</button>
          <button type='submit' style={{padding:8,background:'#065f46',color:'#fff'}}>บันทึก / Save</button>
        </div>
      </form>
    </div>
  )
}
