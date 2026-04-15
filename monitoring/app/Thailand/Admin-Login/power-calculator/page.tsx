"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Page(){
  const router = useRouter()
  const [voltage,setVoltage] = useState<number>(230)
  const [current,setCurrent] = useState<number>(0)
  const [pf,setPf] = useState<number>(1)
  const [results,setResults] = useState({real:0,apparent:0,reactive:0})

  useEffect(()=>{
    const apparent = Number(voltage) * Number(current)
    const real = apparent * Number(pf)
    const reactive = Math.sqrt(Math.max(0,apparent*apparent - real*real))
    setResults({real,apparent,reactive})
  },[voltage,current,pf])

  const styles={container:{padding:24,fontFamily:'Inter,system-ui,Arial',maxWidth:640,margin:'auto'},card:{background:'#fff',padding:18,borderRadius:8,boxShadow:'0 6px 18px rgba(0,0,0,0.06)'},input:{padding:8,borderRadius:6,border:'1px solid #e2e8f0'}} as const

  return (
    <div style={styles.container}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>เครื่องคิดกำลังไฟฟ้า / Power Calculator</h2>
        <button onClick={()=>router.back()} style={{padding:8}}>ย้อนกลับ / Back</button>
      </div>
      <div style={styles.card}>
        <div style={{marginBottom:8}}>
          <label style={{fontWeight:700}}>แรงดัน (V) / Voltage (V)</label>
          <input type='number' value={voltage} onChange={e=>setVoltage(Number(e.target.value))} style={styles.input} />
        </div>
        <div style={{marginBottom:8}}>
          <label style={{fontWeight:700}}>กระแส (A) / Current (A)</label>
          <input type='number' value={current} onChange={e=>setCurrent(Number(e.target.value))} style={styles.input} />
        </div>
        <div style={{marginBottom:8}}>
          <label style={{fontWeight:700}}>Power Factor / ตัวประกอบกำลัง</label>
          <input type='number' step='0.01' min='0' max='1' value={pf} onChange={e=>setPf(Number(e.target.value))} style={styles.input} />
        </div>

        <div style={{marginTop:12,background:'#f8fafc',padding:12,borderRadius:8}}>
          <div>Apparent Power (S): {results.apparent.toFixed(3)} VA</div>
          <div>Real Power (P): {results.real.toFixed(3)} W</div>
          <div>Reactive Power (Q): {results.reactive.toFixed(3)} VAR</div>
        </div>
      </div>
    </div>
  )
}

