"use client"

import ListPage from '../../shared/ListPage'

export default function StockAdjustmentsListPage() {
  return (
    <ListPage
      title="Stock Adjustments"
      apiPath="/api/stock-adjustments"
      createPath="/KR-Thailand/Admin-Login/documents/stock-adjustments/create"
      columns={[
        { key: 'saNo', label: 'SA No.' },
        { key: 'saDate', label: 'Date' },
        { key: 'warehouse', label: 'Warehouse' },
        { key: 'adjustment_type', label: 'Type' },
        { key: 'adjusted_by', label: 'Adjusted By' },
        { key: 'status', label: 'Status' }
      ]}
      print={{ path: '/KR-Thailand/Admin-Login/stock-adjustments/print', paramName: 'saNo', idKey: 'saID', newTab: true }}
    />
  )
}
