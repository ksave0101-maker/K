"use client"
import React,{useCallback,useEffect,useState} from 'react'
import AccWindow,{useLang} from '../components/AccWindow'
interface SettingRow {
  id?: number
  setting_key: string
  setting_value: string
  description: string
}

const th:React.CSSProperties={padding:'8px 14px',background:'#4b5563',color:'#fff',fontSize:13,fontWeight:600,textAlign:'left',whiteSpace:'nowrap',borderBottom:'1px solid #d1d5db'}
const td:React.CSSProperties={padding:'7px 14px',borderBottom:'1px solid #e5e7eb',fontSize:13.5}
const inp:React.CSSProperties={width:'100%',padding:'7px 12px',border:'1px solid #d1d5db',borderRadius:8,background:'#fff',fontSize:13.5,boxSizing:'border-box',fontFamily:'"Sarabun","Tahoma",sans-serif',outline:'none'}
const btn=(bg:string,c='#1f2937'):React.CSSProperties=>({padding:'7px 18px',background:bg==='#f3f4f6'?'#f3f4f6':bg,color:c,border:'1px solid #d1d5db',borderRadius:8,fontSize:13.5,fontWeight:600,cursor:'pointer',fontFamily:'"Sarabun","Tahoma",sans-serif',transition:'all 0.2s'})
export default function SettingsPage(){
  const{L}=useLang()
  const[data,setData]=useState<SettingRow[]>([]);const[editRow,setEditRow]=useState<SettingRow | null>(null);const[val,setVal]=useState('')
  const load=useCallback(async()=>{const r=await fetch('/api/accounting/settings');const d=await r.json();if(d.ok)setData((d.data||[]) as SettingRow[])},[])
  useEffect(()=>{void load()},[load])
  const save=async()=>{if(!editRow)return;await fetch('/api/accounting/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({setting_key:editRow.setting_key,setting_value:val,description:editRow.description})});setEditRow(null);load()}
  return(<AccWindow title={L('System Settings','ตั้งค่าระบบ')}><div style={{padding:12}}>
    <div style={{overflowX:'auto',border:'1px solid #d1d5db',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr><th style={th}>{L('Key','คีย์')}</th><th style={th}>{L('Value','ค่า')}</th><th style={th}>{L('Description','คำอธิบาย')}</th><th style={th}></th></tr></thead>
      <tbody>{data.map((r,i)=>(<tr key={r.id} style={{background:i%2?'#f5f5f5':'#fff'}}>
        <td style={td}>{r.setting_key}</td><td style={td}>{r.setting_value}</td><td style={td}>{r.description}</td>
        <td style={td}><button style={btn('#f3f4f6')} onClick={()=>{setEditRow(r);setVal(r.setting_value)}}>{L('Edit','แก้ไข')}</button></td>
      </tr>))}</tbody></table></div>
    {editRow&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',border:'1px solid #d1d5db',borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',minWidth:380,maxWidth:460,width:'95%'}}>
        <div style={{background:'linear-gradient(135deg,#374151 0%,#4b5563 100%)',padding:'3px 8px',color:'#fff',fontSize:13,fontWeight:700,display:'flex',justifyContent:'space-between'}}>
          <span>{L('Edit Setting','แก้ไขค่า')}</span><span style={{cursor:'pointer'}} onClick={()=>setEditRow(null)}>✕</span></div>
        <div style={{padding:16}}>
          <div style={{fontSize:12,marginBottom:2}}>{editRow.setting_key} — {editRow.description}</div>
          <input style={inp} value={val} onChange={e=>setVal(e.target.value)} /></div>
        <div style={{padding:'8px 16px 12px',display:'flex',gap:8,justifyContent:'flex-end',borderTop:'1px solid #999'}}>
          <button style={btn('#f3f4f6')} onClick={()=>setEditRow(null)}>{L('Cancel','ยกเลิก')}</button>
          <button style={btn('#f3f4f6','#4b5563')} onClick={save}>{L('Save','บันทึก')}</button>
        </div></div></div>}
  </div></AccWindow>)
}
