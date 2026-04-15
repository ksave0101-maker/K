"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import styles from '../admin-theme.module.css'

type Product = {
  id: number
  productID: number
  sku?: string
  name: string
  category?: string
  price?: number
  stock_qty?: number
}

export default function ProductsListPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editStock, setEditStock] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const [lang, setLang] = useState<'en'|'th'>(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'th' ? 'th' : 'en'
    } catch { return 'en' }
  })

  useEffect(() => {
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

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/products')
      const j = await res.json()
      if (!res.ok || !j.success) {
        setError(j?.error || 'Failed to load products')
        setProducts([])
      } else {
        setProducts(j.products || j.rows || [])
      }
    } catch (err: any) {
      setError(String(err))
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleEditClick = (product: Product) => {
    setEditingId(product.id)
    setEditStock(String(product.stock_qty ?? ''))
  }

  const handleSaveStock = async (productId: number) => {
    try {
      setSaving(true)
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          stock_qty: parseInt(editStock) || 0
        })
      })

      const j = await res.json()
      if (!res.ok || !j.success) {
        alert('Failed to update stock: ' + (j?.error || 'Unknown error'))
      } else {
        // Update local state
        setProducts(prev => prev.map(p =>
          p.id === productId ? { ...p, stock_qty: parseInt(editStock) || 0 } : p
        ))
        setEditingId(null)
        setEditStock('')
      }
    } catch (err: any) {
      alert('Error updating stock: ' + String(err))
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditStock('')
  }

  const L = (en: string, th: string) => lang === 'th' ? th : en

  return (
    <AdminLayout title="Products" titleTh="รายการสินค้า">
      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{L('Products','รายการสินค้า')}</h2>
          <p className={styles.cardSubtitle}>{L('Manage products and stock','จัดการสินค้าและสต็อก')}</p>
        </div>

        <div className={styles.cardBody}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => router.push('/KR-Thailand/Admin-Login/product-add')}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              + {L('Create', 'สร้างใหม่')}
            </button>
            <button
              onClick={loadProducts}
              className={styles.btnOutline}
              disabled={loading}
            >
              {loading ? L('Loading...', 'กำลังโหลด...') : L('Refresh', 'รีเฟรช')}
            </button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{L('ID', 'รหัส')}</th>
                  <th>{L('SKU', 'SKU')}</th>
                  <th>{L('Name', 'ชื่อ')}</th>
                  <th>{L('Category', 'หมวดหมู่')}</th>
                  <th style={{ textAlign: 'right' }}>{L('Price', 'ราคา')}</th>
                  <th style={{ textAlign: 'center' }}>{L('Stock', 'สต็อก')}</th>
                  <th style={{ textAlign: 'center', width: 200 }}>{L('Actions', 'การกระทำ')}</th>
                </tr>
              </thead>
              <tbody>
                {loading && products.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                      {L('Loading...', 'กำลังโหลด...')}
                    </td>
                  </tr>
                )}

                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                      {L('No products found', 'ไม่พบสินค้า')}
                    </td>
                  </tr>
                )}

                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.sku || '-'}</td>
                    <td>
                      <a
                        href={`/KR-Thailand/Admin-Login/products/view?id=${product.id}`}
                        style={{ color: '#0b5394', textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        {product.name}
                      </a>
                    </td>
                    <td>{product.category || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      {product.price != null ? `${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })} ฿` : '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {editingId === product.id ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          style={{
                            width: 80,
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: '1px solid #e5e7eb',
                            textAlign: 'center'
                          }}
                          autoFocus
                        />
                      ) : (
                        <span style={{ fontWeight: 600 }}>{product.stock_qty ?? '-'}</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        {editingId === product.id ? (
                          <>
                            <button
                              onClick={() => handleSaveStock(product.id)}
                              disabled={saving}
                              className={`${styles.btn} ${styles.btnPrimary}`}
                              style={{ padding: '6px 12px', fontSize: 13 }}
                            >
                              {saving ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={saving}
                              className={styles.btnOutline}
                              style={{ padding: '6px 12px', fontSize: 13 }}
                            >
                              {L('Cancel', 'ยกเลิก')}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => router.push(`/KR-Thailand/Admin-Login/products/view?id=${product.id}`)}
                              className={styles.btnOutline}
                              style={{ padding: '6px 12px', fontSize: 13 }}
                            >
                              {L('View', 'ดู')}
                            </button>
                            <button
                              onClick={() => handleEditClick(product)}
                              className={styles.btnOutline}
                              style={{ padding: '6px 12px', fontSize: 13 }}
                            >
                              {L('Edit', 'แก้ไข')}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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
