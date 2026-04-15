"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

export default function SupplierAddPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [lang, setLang] = useState<'en' | 'th'>('th')

  const [form, setForm] = useState({
    name: '',
    company: '',
    tax_id: '',
    email: '',
    phone: '',
    address: '',
    product_type: '',
    notes: ''
  })

  useEffect(() => {
    setMounted(true)

    // Load language preference
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLang(l as 'en' | 'th')
    } catch {}

    const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLang(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  const L = (en: string, th: string) => lang === 'th' ? th : en

  const loadSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers')
      const j = await res.json()
      if (j && j.success) setSuppliers(j.rows || j.suppliers || [])
    } catch (e) {
      console.error('Failed to load suppliers', e)
    }
  }

  useEffect(() => { loadSuppliers() }, [])

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) {
      alert(L('Please enter supplier name', 'กรุณากรอกชื่อผู้จัดจำหน่าย'))
      return
    }
    setLoading(true)
    try {
      const createdBy = localStorage.getItem('k_system_admin_user') || 'admin'
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, created_by: createdBy })
      })
      const j = await res.json()
      if (!res.ok || !j.success) {
        alert(L('Failed to save: ', 'บันทึกล้มเหลว: ') + (j?.error || 'Unknown error'))
      } else {
        alert(L('Supplier saved successfully', 'บันทึกผู้จัดจำหน่ายเรียบร้อย'))
        setForm({ name: '', company: '', tax_id: '', email: '', phone: '', address: '', product_type: '', notes: '' })
        loadSuppliers()
      }
    } catch (err: any) {
      alert(L('Error: ', 'ข้อผิดพลาด: ') + String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Supplier" titleTh="ผู้จัดจำหน่าย">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{mounted ? L('Add Supplier', 'เพิ่มผู้จัดจำหน่าย') : 'Add Supplier'}</h2>
          <p className={styles.cardSubtitle}>{mounted ? L('Register new supplier', 'ลงทะเบียนผู้จัดจำหน่ายใหม่') : 'Register new supplier'}</p>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Supplier Name', 'ชื่อผู้จัดจำหน่าย')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Supplier name', 'ชื่อผู้จัดจำหน่าย')}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Company', 'บริษัท')}</label>
                <input
                  value={form.company}
                  onChange={e => handleChange('company', e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Company name', 'ชื่อบริษัท')}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Tax ID', 'เลขผู้เสียภาษี')}</label>
                <input
                  value={form.tax_id}
                  onChange={e => handleChange('tax_id', e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Tax identification number', 'เลขประจำตัวผู้เสียภาษี 13 หลัก')}
                  maxLength={13}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Product Type', 'ประเภทสินค้าที่จำหน่าย')}</label>
                <input
                  value={form.product_type}
                  onChange={e => handleChange('product_type', e.target.value)}
                  className={styles.formInput}
                  placeholder={L('e.g., Electronics, Food', 'เช่น อิเล็กทรอนิกส์, อาหาร')}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Email', 'อีเมล')}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className={styles.formInput}
                  placeholder="supplier@example.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Phone', 'โทรศัพท์')}</label>
                <input
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  className={styles.formInput}
                  placeholder="02-xxx-xxxx"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Address', 'ที่อยู่')}</label>
              <input
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
                className={styles.formInput}
                placeholder={L('Full address', 'ที่อยู่เต็ม')}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Notes', 'หมายเหตุ')}</label>
              <textarea
                value={form.notes}
                onChange={e => handleChange('notes', e.target.value)}
                className={styles.formInput}
                rows={3}
                placeholder={L('Additional notes', 'หมายเหตุเพิ่มเติม')}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              <button type="submit" disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`}>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save Supplier', 'บันทึกผู้จัดจำหน่าย')}
              </button>
              <button type="button" onClick={() => router.back()} className={styles.btnOutline}>
                {L('Cancel', 'ยกเลิก')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Suppliers List */}
      <div className={styles.contentCard} style={{ marginTop: 24 }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{L('Suppliers List', 'รายชื่อผู้จัดจำหน่าย')}</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{L('Name', 'ชื่อ')}</th>
                  <th>{L('Company', 'บริษัท')}</th>
                  <th>{L('Tax ID', 'เลขผู้เสียภาษี')}</th>
                  <th>{L('Email', 'อีเมล')}</th>
                  <th>{L('Phone', 'โทรศัพท์')}</th>
                  <th>{L('Product Type', 'ประเภทสินค้า')}</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#999' }}>{L('No suppliers yet', 'ยังไม่มีผู้จัดจำหน่าย')}</td></tr>
                )}
                {suppliers.map((s: any) => (
                  <tr key={s.supplier_id}>
                    <td>{s.supplier_id}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.company || '-'}</td>
                    <td>{s.tax_id || '-'}</td>
                    <td>{s.email || '-'}</td>
                    <td>{s.phone || '-'}</td>
                    <td>{s.product_type || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
