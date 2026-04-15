"use client"

import React, { useState, useEffect } from 'react'
import styles from '../../../admin-theme.module.css'

type Product = {
  productID: number
  sku: string
  name: string
  description: string
  category: string
  'Capacity (kVA)': string
  MCB: string
  'Size (WxLxH) cm.': string
  Weight: string
  price: number
  unit: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSelect: (product: Product) => void
  locale: 'en' | 'th'
}

export default function ProductSearchModal({ isOpen, onClose, onSelect, locale }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const L = (en: string, th: string) => locale === 'th' ? th : en

  useEffect(() => {
    if (isOpen) {
      loadProducts()
    }
  }, [isOpen])

  async function loadProducts() {
    setLoading(true)
    try {
      const res = await fetch('/api/products?limit=100')
      const j = await res.json()
      if (j.success && j.products) {
        setProducts(j.products)
      }
    } catch (err) {
      console.error('Failed to load products:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p['Capacity (kVA)']?.toLowerCase().includes(search.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        width: '90%',
        maxWidth: 900,
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: 20, borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              {L('Select Product', 'เลือกสินค้า')}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#6b7280',
                padding: 0,
                width: 32,
                height: 32
              }}
            >
              ×
            </button>
          </div>

          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={L('Search by name, SKU, category, or capacity...', 'ค้นหาด้วยชื่อ, SKU, หมวดหมู่, หรือกำลังไฟฟ้า...')}
            className={styles.formInput}
            style={{ marginBottom: 0 }}
            autoFocus
          />
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              {L('Loading...', 'กำลังโหลด...')}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              {L('No products found', 'ไม่พบสินค้า')}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{L('SKU', 'รหัส')}</th>
                  <th>{L('Name', 'ชื่อสินค้า')}</th>
                  <th>{L('Model', 'โมเดล')}</th>
                  <th>{L('Category', 'หมวดหมู่')}</th>
                  <th>{L('Price', 'ราคา')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.productID}>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>{product.sku || '-'}</td>
                    <td style={{ fontWeight: 500 }}>{product.name}</td>
                    <td>{product['Capacity (kVA)'] || '-'}</td>
                    <td>{product.category || '-'}</td>
                    <td style={{ textAlign: 'right' }}>{product.price?.toLocaleString() || '0'}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(product)
                          onClose()
                        }}
                        className={styles.btnPrimary}
                        style={{ padding: '6px 12px', fontSize: 14 }}
                      >
                        {L('Select', 'เลือก')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
