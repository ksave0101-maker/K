"use client"
import React, { useEffect } from 'react'
import ListPage from "../../shared/ListPage"
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const selectMode = searchParams?.get('select') === '1'

  function handleSelect(row: any) {
    try {
      if (window.opener && typeof window.opener.postMessage === 'function') {
        window.opener.postMessage({ type: 'k-system-invoice-selected', invoice: row }, '*')
        window.close()
      } else {
        // fallback: store selection in localStorage
        localStorage.setItem('k_system_selected_invoice', JSON.stringify(row))
        alert('Selected invoice saved to localStorage')
      }
    } catch (e) {
      console.error('Failed to send selected invoice', e)
    }
  }

  useEffect(() => {
    if (!selectMode) return
    const handler = (e: Event) => {
      try {
        const row = (e as any)?.detail || (e as any)?.data || null
        if (row) handleSelect(row)
      } catch (err) { console.error(err) }
    }
    window.addEventListener('k-system-list-select', handler)
    return () => { window.removeEventListener('k-system-list-select', handler) }
  }, [selectMode])

  return (
    <ListPage
      title="Invoices"
      apiPath="/api/invoices"
      createPath="/KR-Thailand/Admin-Login/invoice"
      columns={[
        { key: 'invNo', label: 'Invoice No' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'total_amount', label: 'Total' },
        { key: 'status', label: 'Status' },
        { key: 'invDate', label: 'Date' },
        { key: 'created_at', label: 'Created' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/invoice/print', paramName: 'invNo', idKey: 'invNo', newTab: true }}
      link={{ columnKey: 'invNo', path: '/KR-Thailand/Admin-Login/invoice', paramName: 'invNo' }}
      selectable={selectMode}
    />
  )
}
