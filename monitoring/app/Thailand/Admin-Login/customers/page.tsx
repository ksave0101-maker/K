"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../admin-theme.module.css'
import poStyles from '../purchase-order.module.css'

type Customer = {
  cusID: number,
  fullname: string,
  email?: string | null,
  phone?: string | null,
  company?: string | null,
  address?: string | null,
  subject?: string | null,
  message?: string | null,
  created_by?: string | null,
  created_at?: string | null
}

export default function Page(){
  const router = useRouter()
  const [customers,setCustomers] = useState<Customer[]>([])
  const [locale, setLocale] = useState<'th'|'en'>(() => {
    try {
      const l = localStorage.getItem('locale')
      return l === 'en' ? 'en' : 'th'
    } catch (e) {
      return 'th'
    }
  })

  // Toggle language and persist
  function toggleLocale() {
    const next = locale === 'th' ? 'en' : 'th'
    setLocale(next)
    try { localStorage.setItem('locale', next) } catch (e) {}
    // broadcast change for other components if needed
    try { window.dispatchEvent(new CustomEvent('locale-changed', { detail: { locale: next } })) } catch (e) {}
  }

  // Fetch customers from API on mount
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/customers')
        const j = await res.json()
        if (mounted && j && Array.isArray(j.customers)) setCustomers(j.customers)
      } catch (err) {
        console.error('Failed to load customers', err)
      }
    })()
    return () => { mounted = false }
  }, [])

  const inlineStyles={container:{padding:24,fontFamily:'Inter,system-ui,Arial',maxWidth:1200,margin:'auto'},table:{width:'100%',borderCollapse:'collapse'}} as const

  return (
    <div style={styles.container}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 className={styles.pageTitle}>{locale === 'th' ? 'รายละเอียดลูกค้า' : 'Customer Details'}</h2>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className={styles.btnLocale} onClick={toggleLocale}>{locale === 'th' ? 'TH' : 'EN'}</button>
          <button className={styles.btnBack} onClick={()=>router.back()}>{locale === 'th' ? 'ย้อนกลับ' : 'Back'}</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        {customers.length===0? <div style={{color:'#6b7280'}}>ยังไม่มีลูกค้า / No customers yet</div> : (
          <div className={poStyles.tableWrapper}>
            <table className={poStyles.poTable}>
            <thead>
              <tr style={{textAlign:'left'}}>
                <th>{locale === 'th' ? 'รหัส' : 'cusID'}</th>
                <th>{locale === 'th' ? 'ชื่อ-นามสกุล' : 'fullname'}</th>
                <th>{locale === 'th' ? 'อีเมล' : 'email'}</th>
                <th>{locale === 'th' ? 'โทรศัพท์' : 'phone'}</th>
                <th>{locale === 'th' ? 'บริษัท' : 'company'}</th>
                <th>{locale === 'th' ? 'ที่อยู่' : 'address'}</th>
                <th>{locale === 'th' ? 'หัวข้อ' : 'subject'}</th>
                <th>{locale === 'th' ? 'ข้อความ' : 'message'}</th>
                <th>{locale === 'th' ? 'สร้างโดย' : 'created_by'}</th>
                <th>{locale === 'th' ? 'วันที่สร้าง' : 'created_at'}</th>
              </tr>
            </thead>
              <tbody>
                {customers.map(c=> (
                  <tr key={c.cusID}>
                    <td>{c.cusID}</td>
                    <td>{c.fullname}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.company}</td>
                    <td>{c.address}</td>
                    <td>{c.subject}</td>
                    <td style={{whiteSpace:'pre-wrap'}}>{c.message}</td>
                    <td>{c.created_by}</td>
                    <td>{c.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
