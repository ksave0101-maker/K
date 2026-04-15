"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const [invoiceNo, setInvoiceNo] = useState('')
  const [customer, setCustomer] = useState({ name: '', phone: '' })
  const [items, setItems] = useState([{ desc: '', qty: 1, price: 0 }])
  const [taxRate, setTaxRate] = useState(7)
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 })

  useEffect(() => {
    const subtotal = items.reduce((s, it) => s + it.qty * Number(it.price || 0), 0)
    const tax = (subtotal * Number(taxRate || 0)) / 100
    setTotals({ subtotal, tax, total: subtotal + tax })
  }, [items, taxRate])

  function addItem() { setItems([...items, { desc: '', qty: 1, price: 0 }]) }
  function updateItem(i: number, key: string, value: any) {
    const copy = [...items]
    // @ts-ignore
    copy[i][key] = key === 'desc' ? value : Number(value)
    setItems(copy)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!invoiceNo) return alert('กรุณาใส่เลขที่ใบแจ้งหนี้ / Enter invoice number')
    console.log({ invoiceNo, customer, items, totals })
    alert('Invoice saved (demo)')
  }

  const styles: Record<string, React.CSSProperties> = {
    container: { padding: 24, fontFamily: 'Inter, system-ui, Arial', maxWidth: 960, margin: 'auto' },
    card: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' },
    label: { fontSize: 14, fontWeight: 600, marginBottom: 6 },
    input: { width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' },
    btn: { padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer' }
  }

  return (
    <div style={styles.container}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>ใบแจ้งหนี้ / Invoice</h2>
        <button style={styles.btn} onClick={() => router.back()}>ย้อนกลับ / Back</button>
      </div>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={{marginBottom:12}}>
          <div style={styles.label}>เลขที่ใบแจ้งหนี้ / Invoice No.</div>
          <input value={invoiceNo} onChange={e=>setInvoiceNo(e.target.value)} style={styles.input} />
        </div>
        <div style={{marginBottom:12}}>
          <div style={styles.label}>ลูกค้า / Customer</div>
          <div style={{display:'flex',gap:8}}>
            <input placeholder='ชื่อลูกค้า / Name' value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} style={styles.input} />
            <input placeholder='โทรศัพท์ / Phone' value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} style={styles.input} />
          </div>
        </div>
        <div>
          <div style={styles.label}>รายการ / Items</div>
          {items.map((it,i)=> (
            <div key={i} style={{display:'flex',gap:8,marginBottom:8}}>
              <input placeholder='รายละเอียด' value={it.desc} onChange={e=>updateItem(i,'desc',e.target.value)} style={{...styles.input,flex:2}} />
              <input type='number' min={1} value={it.qty} onChange={e=>updateItem(i,'qty',e.target.value)} style={{...styles.input,width:100}} />
              <input type='number' min={0} value={it.price} onChange={e=>updateItem(i,'price',e.target.value)} style={{...styles.input,width:140}} />
            </div>
          ))}
          <button type='button' onClick={addItem} style={{...styles.btn,marginTop:8}}>เพิ่มรายการ / Add item</button>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
          <div style={{flex:1}}>
            <div style={styles.label}>VAT (%)</div>
            <input type='number' min={0} value={taxRate} onChange={e=>setTaxRate(Number(e.target.value))} style={styles.input} />
          </div>
          <div style={{width:260,background:'#f8fafc',padding:12,borderRadius:8}}>
            <div style={{fontWeight:700}}>สรุป / Summary</div>
            <div>Subtotal: {totals.subtotal.toFixed(2)} ฿</div>
            <div>Tax: {totals.tax.toFixed(2)} ฿</div>
            <div style={{fontSize:18,fontWeight:800}}>Total: {totals.total.toFixed(2)} ฿</div>
          </div>
        </div>

        <div style={{marginTop:12,display:'flex',gap:8}}>
          <button type='submit' style={{...styles.btn,background:'#0f172a',color:'#fff'}}>บันทึก / Save</button>
        </div>
      </form>
    </div>
  )
}

